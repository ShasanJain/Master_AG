#!/bin/bash

# Exit on error
set -e

# ==========================================
# GCP Cloud Run Deployment Script
# ==========================================

# Variables - Replace PROJECT_ID with your actual GCP Project ID when ready
PROJECT_ID="hackkit-app"
SERVICE_NAME="edconnect-ai"
REGION="us-central1"
IMAGE="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "=========================================="
echo "Deploying $SERVICE_NAME to Cloud Run..."
echo "=========================================="

# 1. Build the Docker image
echo "[1/3] Building Docker image..."
docker build -t $IMAGE .

# 2. Push to Google Container Registry (or Artifact Registry)
echo "[2/3] Pushing to Container Registry..."
docker push $IMAGE

# 3. Deploy to Cloud Run
echo "[3/3] Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID \
  --port 3000

echo "=========================================="
echo "Deployment Complete! 🚀"
echo "=========================================="
