FROM python:3.11-slim

# Install system dependencies and ca-certificates for SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    build-essential \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy only requirements.txt first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install Python dependencies with trusted hosts
RUN python -m pip install --upgrade pip setuptools && \
    pip install --no-cache-dir -r requirements.txt \
    --trusted-host pypi.org \
    --trusted-host pypi.python.org \
    --trusted-host files.pythonhosted.org

# Now copy the rest of the code
COPY . .

# Expose the port your application runs on
EXPOSE 8001

# Command to run the application
CMD ["python", "-m", "server.main"]
