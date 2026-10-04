# NutriVision AI Backend Docker Container
FROM python:3.10-slim

WORKDIR /app

# Set memory-saving & configuration environment variables
ENV PYTHONUNBUFFERED=1
ENV YOLO_CONFIG_DIR=/tmp/Ultralytics
ENV OMP_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV MKL_NUM_THREADS=1
ENV NUMEXPR_NUM_THREADS=1
ENV VECLIB_MAXIMUM_THREADS=1
ENV PORT=8000

# Install system dependencies for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and trained models
COPY backend /app/backend
COPY backend/app /app/app
COPY backend/ml /app/ml
COPY backend/models /app/models

# Set Python path
ENV PYTHONPATH=/app/backend:/app

# Expose default port
EXPOSE 8000

# Start Uvicorn production server with dynamic Render $PORT support
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1"]
