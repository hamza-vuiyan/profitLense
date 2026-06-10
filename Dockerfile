# Use Eclipse Temurin with Java 17 as base
FROM eclipse-temurin:17-jdk-jammy

# Install Python 3, pip, and required build tools for CmdStan and psycopg2
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a Python virtual environment and install requirements
# (Using a venv is safer even in Docker to avoid system package conflicts)
COPY scripts/requirements.txt /app/scripts/requirements.txt
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN pip install --no-cache-dir -r /app/scripts/requirements.txt

# Install CmdStan (Required for Prophet)
RUN python3 -c "import cmdstanpy; cmdstanpy.install_cmdstan()"

# Copy the Maven wrapper and pom.xml first to cache dependencies
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline -B

# Copy source code and Python scripts
COPY src src
COPY scripts scripts

# Build the Spring Boot application
RUN ./mvnw clean package -DskipTests

# Expose the default Spring Boot port
EXPOSE 8080

# Command to run the application
CMD ["java", "-jar", "target/profitlense-0.0.1-SNAPSHOT.jar"]
