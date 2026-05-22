FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# One-shot: run main.py and exit.
# Schedule via host cron or docker-compose + ofelia:
#   0 8 * * * TZ=Asia/Ho_Chi_Minh docker compose -f docker-compose.factory.yml run --rm alpha-factory-legacy
CMD ["python", "main.py"]
