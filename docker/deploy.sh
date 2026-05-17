#!/bin/bash
set -euo pipefail

# Configuration
PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

REGION="us-central1"
REPO_NAME="trading-journal"
SERVICE_NAME="trading-journal"
FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend"
BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend"

echo "=== Trading Journal Deploy ==="
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo ""

# Prerequisites check
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found. Install it first."; exit 1; }
echo "OK: docker found."

# Configure Docker for Artifact Registry
echo "Configuring Docker for Artifact Registry..."
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet

# 0. Ensure Artifact Registry exists
echo ""
echo "[1/5] Ensuring Artifact Registry repository..."
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" > /dev/null 2>&1; then
  echo "  Repository $REPO_NAME already exists."
else
  echo "  Creating repository $REPO_NAME..."
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION"
fi

# 1. Load Env Vars from backend/.env
echo ""
echo "[2/5] Loading database credentials..."
if [ -f "backend/.env" ]; then
  set -a
  source backend/.env
  set +a
else
  echo "ERROR: backend/.env not found. Create it from backend/.env.example."
  exit 1
fi

if [ -z "${DB_URL:-}" ] || [ -z "${DB_USERNAME:-}" ] || [ -z "${DB_PASSWORD:-}" ]; then
  echo "ERROR: DB_URL, DB_USERNAME, or DB_PASSWORD missing in backend/.env."
  exit 1
fi
echo "  OK: credentials loaded."

# 2. Build and Push Frontend
echo ""
echo "[3/5] Building and pushing frontend image..."
docker build -f docker/frontend.Dockerfile -t "$FRONTEND_IMAGE" .
docker push "$FRONTEND_IMAGE"
echo "  Frontend image pushed."

# 3. Build and Push Backend (Native)
echo ""
echo "[4/5] Building and pushing backend (JVM) image..."
echo "  (Building with Maven + JDK 17, targeting port 8081)"
docker build -f docker/backend-jvm.Dockerfile -t "$BACKEND_IMAGE" .
docker push "$BACKEND_IMAGE"
echo "  Backend image pushed."

# 4. Prepare cloud-run.yaml and deploy
echo ""
echo "[5/5] Deploying to Cloud Run..."
TMP_YAML=$(mktemp)
cp docker/cloud-run.yaml "$TMP_YAML"
sed -i "s|FRONTEND_IMAGE_PLACEHOLDER|$FRONTEND_IMAGE|g" "$TMP_YAML"
sed -i "s|BACKEND_IMAGE_PLACEHOLDER|$BACKEND_IMAGE|g" "$TMP_YAML"
sed -i "s|YOUR_DB_URL|$DB_URL|g" "$TMP_YAML"
sed -i "s|YOUR_DB_USERNAME|$DB_USERNAME|g" "$TMP_YAML"
sed -i "s|YOUR_DB_PASSWORD|$DB_PASSWORD|g" "$TMP_YAML"

gcloud run services replace "$TMP_YAML" --region "$REGION"
rm -f "$TMP_YAML"

# 5. Get the deployed URL
echo ""
echo "=== Deployment Complete ==="
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)" 2>/dev/null || echo "unknown")
echo "URL: $SERVICE_URL"
echo "Logs: gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit 20"
