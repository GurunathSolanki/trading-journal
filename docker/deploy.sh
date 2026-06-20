#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

PROJECT_ID=$(gcloud config get-value project 2>/dev/null || true)
if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: No GCP project set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

REGION="us-central1"
REPO_NAME="trading-journal"
SERVICE_NAME="trading-journal"

USE_CLOUD_BUILD=false
USE_LOCAL_NATIVE=false
for arg in "$@"; do
  if [ "$arg" = "--cloud-build" ]; then USE_CLOUD_BUILD=true; fi
  if [ "$arg" = "--local-native" ]; then USE_LOCAL_NATIVE=true; fi
done

BUILD_TAG="$(date +%Y%m%d-%H%M%S)"

if [ "$USE_CLOUD_BUILD" = true ]; then
  BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend-native"
  FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend"
  MODE="Cloud Build (native)"
elif [ "$USE_LOCAL_NATIVE" = true ]; then
  BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend-native"
  FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend"
  MODE="Local Native (Host Maven + Docker)"
else
  BACKEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend"
  FRONTEND_IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/frontend"
  MODE="Local Docker (JVM)"
fi

echo "=== Trading Journal Deploy ==="
echo "Project: $PROJECT_ID | Region: $REGION | Mode: $MODE"

gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet 2>/dev/null

echo ""
echo "[1/4] Ensuring Artifact Registry..."
if ! gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" > /dev/null 2>&1; then
  gcloud artifacts repositories create "$REPO_NAME" --repository-format=docker --location="$REGION"
fi
echo "  OK."

echo ""
echo "[2/4] Loading database credentials..."
ENV_FILE="$ROOT_DIR/backend/.env"
if [ -f "$ENV_FILE" ]; then
  set -a; source "$ENV_FILE"; set +a
else
  echo "ERROR: $ENV_FILE not found."
  exit 1
fi
if [ -z "${DB_URL:-}" ] || [ -z "${DB_USERNAME:-}" ] || [ -z "${DB_PASSWORD:-}" ]; then
  echo "ERROR: DB_URL, DB_USERNAME, or DB_PASSWORD missing."
  exit 1
fi
echo "  OK."

echo ""
if [ "$USE_CLOUD_BUILD" = true ]; then
  echo "[3/4] Cloud Build (native)..."
  gcloud services enable cloudbuild.googleapis.com --quiet 2>/dev/null || true
  cd "$ROOT_DIR"
  gcloud builds submit \
    --config="$SCRIPT_DIR/cloudbuild.yaml" \
    --substitutions=_TAG=$BUILD_TAG \
    --region=$REGION
  BACKEND_IMAGE="$BACKEND_IMAGE:$BUILD_TAG"
  FRONTEND_IMAGE="$FRONTEND_IMAGE:$BUILD_TAG"
elif [ "$USE_LOCAL_NATIVE" = true ]; then
  echo "[3/4] Local Native Build..."
  command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found. Please enable Docker Desktop WSL integration."; exit 1; }
  cd "$ROOT_DIR"
  
  echo "  Compiling Quarkus native executable locally..."
  ./backend/mvnw -f backend/pom.xml clean package -Dnative -Dquarkus.native.container-build=true -DskipTests
  
  echo "  Packaging native executable into Docker image..."
  docker build -f docker/backend-native-local.Dockerfile -t "$BACKEND_IMAGE:$BUILD_TAG" . && docker push "$BACKEND_IMAGE:$BUILD_TAG"
  
  echo "  Packaging frontend into Docker image..."
  docker build -f docker/frontend.Dockerfile -t "$FRONTEND_IMAGE:$BUILD_TAG" . && docker push "$FRONTEND_IMAGE:$BUILD_TAG"
  
  BACKEND_IMAGE="$BACKEND_IMAGE:$BUILD_TAG"
  FRONTEND_IMAGE="$FRONTEND_IMAGE:$BUILD_TAG"
else
  echo "[3/4] Local Docker build (JVM)..."
  command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found."; exit 1; }
  cd "$ROOT_DIR"
  docker build -f docker/backend-jvm.Dockerfile -t "$BACKEND_IMAGE:$BUILD_TAG" . && docker push "$BACKEND_IMAGE:$BUILD_TAG"
  docker build -f docker/frontend.Dockerfile -t "$FRONTEND_IMAGE:$BUILD_TAG" . && docker push "$FRONTEND_IMAGE:$BUILD_TAG"
  
  BACKEND_IMAGE="$BACKEND_IMAGE:$BUILD_TAG"
  FRONTEND_IMAGE="$FRONTEND_IMAGE:$BUILD_TAG"
fi
echo "  Images pushed."

echo ""
echo "[4/4] Deploying to Cloud Run..."
TMP_YAML=$(mktemp)
cp "$SCRIPT_DIR/cloud-run.yaml" "$TMP_YAML"
sed -i "s|FRONTEND_IMAGE_PLACEHOLDER|$FRONTEND_IMAGE|g" "$TMP_YAML"
sed -i "s|BACKEND_IMAGE_PLACEHOLDER|$BACKEND_IMAGE|g" "$TMP_YAML"
sed -i "s|YOUR_DB_URL|$DB_URL|g" "$TMP_YAML"
sed -i "s|YOUR_DB_USERNAME|$DB_USERNAME|g" "$TMP_YAML"
sed -i "s|YOUR_DB_PASSWORD|$DB_PASSWORD|g" "$TMP_YAML"

gcloud run services replace "$TMP_YAML" --region "$REGION"
rm -f "$TMP_YAML"

echo ""
echo "=== Deployment Complete ==="
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format="value(status.url)" 2>/dev/null || echo "unknown")
echo "URL: $SERVICE_URL"