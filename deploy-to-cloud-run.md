# Deploy Trading Journal to Google Cloud Run

## Architecture

Single Cloud Run service with two containers (sidecar pattern):

- **Frontend** (Nginx, port 8080): Serves the React SPA, proxies `/api` to backend
- **Backend** (Quarkus JVM, port 8081): REST API connected to Supabase PostgreSQL

All requests go through Nginx — no CORS issues, single origin.

## Prerequisites

- Google Cloud project with billing enabled (free tier eligible)
- `gcloud` CLI installed and authenticated
- Docker Desktop running (WSL integration enabled if on Windows)
- `backend/.env` file with DB credentials (copy from `backend/.env.example`)

## One-Time Setup

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
```

## Deploy

```bash
./docker/deploy.sh
```

The script automatically:

1. Creates/verifies Artifact Registry repository
2. Loads DB credentials from `backend/.env`
3. Builds and pushes frontend image (Nginx + React)
4. Builds and pushes backend image (Maven + Quarkus JVM on JDK 17)
5. Generates a temp `cloud-run.yaml` with image URLs and DB credentials
6. Deploys to Cloud Run in `us-central1`
7. Cleans up temp files
8. Prints the deployed URL

## Make Public (First Deploy Only)

After the first deploy, enable unauthenticated access:

```bash
gcloud run services add-iam-policy-binding trading-journal \
  --region=us-central1 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

## Free Tier Configuration

The deployed service uses:

| Setting | Value |
|---|---|
| `minScale` | 0 (scale to zero when idle) |
| `cpu-throttling` | true (request-based CPU billing) |
| Frontend memory | 256Mi |
| Backend memory | 512Mi |
| Region | us-central1 |

For a personal trading journal (< 500 requests/month), this stays well within Cloud Run's free tier (2M requests/mo, 360K GB-seconds, 180K vCPU-seconds).

## Files

| File | Purpose |
|---|---|
| `docker/frontend.Dockerfile` | Multi-stage build: Node 18 → Nginx alpine |
| `docker/nginx.conf` | SPA routing + `/api` proxy to localhost:8081 |
| `docker/backend-jvm.Dockerfile` | Multi-stage build: Maven 3.9 → UBI9 OpenJDK 17 |
| `docker/cloud-run.yaml` | Cloud Run service definition with probes |
| `docker/deploy.sh` | Full deployment automation script |

## Troubleshooting

```bash
# View Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=trading-journal" --limit 20

# Check service config
gcloud run services describe trading-journal --region=us-central1

# List revisions
gcloud run revisions list --service=trading-journal --region=us-central1
```
