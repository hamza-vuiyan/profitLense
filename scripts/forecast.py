#!/usr/bin/env python3
"""
forecast.py — ProfitLens Prophet Forecasting Script
Called by ForecastService.java via ProcessBuilder.

Usage:
    python3 forecast.py \
        --db-url  "postgresql://user:pass@host:5432/postgres" \
        --merchant-id  "<uuid>" \
        [--min-records 10] \
        [--forecast-weeks 4]

Outputs:
    JSON to stdout: { "forecasted": N, "skipped": M }
    Errors to stderr.
    Writes forecast rows to `forecasts` table.
"""

import argparse
import json
import os
import sys
from contextlib import contextmanager
import warnings

warnings.filterwarnings("ignore")

@contextmanager
def suppress_stdout_stderr():
    """Context manager to suppress stdout/stderr (suppress Stan output)."""
    with open(os.devnull, 'w') as devnull:
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = devnull
        sys.stderr = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr

import pandas as pd
import psycopg2
from prophet import Prophet


def parse_args():
    parser = argparse.ArgumentParser(description="ProfitLens Prophet Forecasting")
    parser.add_argument("--db-url", required=True, help="JDBC-style or psycopg2 PostgreSQL URL")
    parser.add_argument("--merchant-id", required=True, help="Merchant UUID")
    parser.add_argument("--min-records", type=int, default=10, help="Min records required to run Prophet")
    parser.add_argument("--forecast-weeks", type=int, default=4, help="Number of weeks to forecast")
    parser.add_argument("--limit", type=int, default=10, help="Max products to forecast (top by data volume)")
    return parser.parse_args()


def jdbc_to_psycopg2(jdbc_url: str) -> str:
    """Convert Spring-style JDBC URL to psycopg2-style DSN."""
    # jdbc:postgresql://host:port/db?params  →  postgresql://host:port/db?params
    if jdbc_url.startswith("jdbc:"):
        return jdbc_url[5:]
    return jdbc_url


def get_connection(db_url: str):
    dsn = jdbc_to_psycopg2(db_url)
    return psycopg2.connect(dsn)


def load_sales(conn, merchant_id: str) -> pd.DataFrame:
    query = """
        SELECT 
            sr.product_id::text AS product_id,
            p.name AS product_name,
            sr.sale_date,
            SUM(sr.quantity_sold) AS daily_qty
        FROM sales_records sr
        JOIN products p ON p.id = sr.product_id
        WHERE sr.merchant_id = %s::uuid
        GROUP BY sr.product_id, p.name, sr.sale_date
        ORDER BY sr.product_id, sr.sale_date
    """
    df = pd.read_sql_query(query, conn, params=(merchant_id,))
    df["sale_date"] = pd.to_datetime(df["sale_date"])
    return df


def delete_existing_forecasts(conn, merchant_id: str, product_ids: list):
    """Delete old forecasts for these products so we can write fresh ones."""
    if not product_ids:
        return
    with conn.cursor() as cur:
        placeholders = ",".join(["%s::uuid"] * len(product_ids))
        cur.execute(
            f"""DELETE FROM forecasts 
                WHERE merchant_id = %s::uuid 
                AND product_id IN ({placeholders})""",
            [merchant_id] + product_ids,
        )
    conn.commit()


def run_prophet(df_product: pd.DataFrame, forecast_weeks: int) -> pd.DataFrame:
    """Fit Prophet and return a dataframe of future dates + predictions."""
    df_prophet = df_product[["sale_date", "daily_qty"]].rename(
        columns={"sale_date": "ds", "daily_qty": "y"}
    )
    df_prophet = df_prophet.sort_values("ds").reset_index(drop=True)

    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.8,
        mcmc_samples=0,  # Use MAP estimation — 100x faster than full MCMC
    )
    with suppress_stdout_stderr():
        model.fit(df_prophet)

    future = model.make_future_dataframe(periods=forecast_weeks * 7, freq="D")
    forecast = model.predict(future)

    # Return only the future portion
    last_date = df_prophet["ds"].max()
    future_forecast = forecast[forecast["ds"] > last_date][
        ["ds", "yhat", "yhat_lower", "yhat_upper"]
    ].copy()

    # Clamp negatives to 0
    future_forecast["yhat"] = future_forecast["yhat"].clip(lower=0)
    future_forecast["yhat_lower"] = future_forecast["yhat_lower"].clip(lower=0)
    future_forecast["yhat_upper"] = future_forecast["yhat_upper"].clip(lower=0)

    return future_forecast


def save_forecasts(conn, merchant_id: str, product_id: str, forecasts: pd.DataFrame):
    rows = []
    for _, row in forecasts.iterrows():
        rows.append((
            merchant_id,
            product_id,
            row["ds"].date(),
            float(row["yhat"]),
            float(row["yhat_lower"]),
            float(row["yhat_upper"]),
        ))

    with conn.cursor() as cur:
        cur.executemany(
            """INSERT INTO forecasts 
               (merchant_id, product_id, forecast_date, predicted_demand, lower_bound, upper_bound)
               VALUES (%s::uuid, %s::uuid, %s, %s, %s, %s)
               ON CONFLICT (merchant_id, product_id, forecast_date) 
               DO UPDATE SET 
                   predicted_demand = EXCLUDED.predicted_demand,
                   lower_bound = EXCLUDED.lower_bound,
                   upper_bound = EXCLUDED.upper_bound,
                   created_at = NOW()
            """,
            rows,
        )
    conn.commit()


def main():
    args = parse_args()

    try:
        conn = get_connection(args.db_url)
    except Exception as e:
        print(f"DB connection failed: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        df_all = load_sales(conn, args.merchant_id)
    except Exception as e:
        print(f"Failed to load sales data: {e}", file=sys.stderr)
        conn.close()
        sys.exit(1)

    if df_all.empty:
        result = {"forecasted": 0, "skipped": 0, "message": "No sales data found"}
        print(json.dumps(result))
        conn.close()
        return

    product_groups = df_all.groupby("product_id")
    forecasted = 0
    skipped = 0

    # Sort product groups by number of records descending — forecast top products first
    sorted_groups = sorted(product_groups, key=lambda kv: len(kv[1]), reverse=True)

    for product_id, group in sorted_groups[:args.limit]:
        if len(group) < args.min_records:
            skipped += 1
            continue
        try:
            future_fc = run_prophet(group, args.forecast_weeks)
            save_forecasts(conn, args.merchant_id, product_id, future_fc)
            forecasted += 1
        except Exception as e:
            print(f"[WARN] Skipping product {product_id}: {e}", file=sys.stderr)
            skipped += 1

    conn.close()

    result = {
        "forecasted": forecasted,
        "skipped": skipped,
        "message": f"Completed: {forecasted} products forecasted, {skipped} skipped",
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
