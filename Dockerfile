# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    wget \
    libcurl4-openssl-dev \
    libssl-dev \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Download and install curl-impersonate for Firefox
RUN wget -q https://github.com/lwthiker/curl-impersonate/releases/download/v0.6.1/libcurl-impersonate-v0.6.1.x86_64-linux-gnu.tar.gz \
    && tar -xzf libcurl-impersonate-v0.6.1.x86_64-linux-gnu.tar.gz -C /usr/local \
    && rm libcurl-impersonate-v0.6.1.x86_64-linux-gnu.tar.gz \
    && ldconfig

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY glm.py glm_server.py ./

# Expose port
EXPOSE 10000

# Set environment variable for curl-impersonate
ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH

# Run the server (will bind to 0.0.0.0 by default and use PORT env var)
CMD ["python", "glm_server.py"]
