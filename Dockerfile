# ─── Stage 1: Build the Spring Boot JAR ──────────────────────────────────────
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /build

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
# Cache dependencies first (faster rebuilds)
RUN ./mvnw dependency:go-offline -B -q

COPY src src
RUN ./mvnw clean package -DskipTests -q

# ─── Stage 2: Runtime image (Java + Python) ──────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

# Install Python 3 + build tools for Prophet/psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create Python venv and install ML dependencies
COPY scripts/requirements.txt scripts/requirements.txt
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r scripts/requirements.txt

# Install CmdStan (required by Prophet internally)
RUN python3 -c "import cmdstanpy; cmdstanpy.install_cmdstan()" 2>&1 | tail -5

# Copy the built JAR from Stage 1
COPY --from=builder /build/target/profitlense-0.0.1-SNAPSHOT.jar app.jar

# Copy Python forecast script
COPY scripts/forecast.py scripts/forecast.py

# Copy the demo dataset (needed for DataLoaderRunner on first start)
COPY data.csv data.csv

# Expose port
EXPOSE 8080

# Run with production-friendly JVM flags
CMD ["java", \
     "-Xmx384m", \
     "-Xms128m", \
     "-jar", "app.jar"]
