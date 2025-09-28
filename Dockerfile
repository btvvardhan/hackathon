# syntax=docker/dockerfile:1
FROM python:3.13-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server code into the image
COPY api/server /app

# Install Python deps
# If you have a requirements.txt in api/server, you can:
# COPY api/server/requirements.txt /app/requirements.txt
# RUN pip install --no-cache-dir -r /app/requirements.txt
# Otherwise, install inline:
RUN pip install --no-cache-dir \
    "fastapi==0.112.*" "uvicorn[standard]==0.30.*" \
    "google-cloud-aiplatform>=1.68.0" "google-auth" \
    "vertexai>=1.71.1" "requests" "pydantic"

EXPOSE 8080
ENV PORT=8080

CMD ["uvicorn", "app:app", "--host=0.0.0.0", "--port=8080"]
