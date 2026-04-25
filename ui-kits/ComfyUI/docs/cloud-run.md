# Deploy ComfyUI on Google Cloud Run

This repository now includes a production-friendly `Dockerfile` so you can deploy ComfyUI directly to Cloud Run.

## 1) Set your project and region

```bash
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region YOUR_REGION
```

## 2) Enable required APIs

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## 3) Build the container image

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/YOUR_PROJECT_ID/comfyui/comfyui:latest
```

## 4) Deploy to Cloud Run

```bash
gcloud run deploy comfyui \
  --image REGION-docker.pkg.dev/YOUR_PROJECT_ID/comfyui/comfyui:latest \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --cpu 4 \
  --memory 16Gi \
  --timeout 3600 \
  --concurrency 1 \
  --max-instances 1
```

## 5) (Optional) Configure persistent model/output storage

Cloud Run filesystem is ephemeral. To persist data, mount a Cloud Storage bucket using Cloud Run volume mounts and point ComfyUI at that directory:

```bash
gcloud run services update comfyui \
  --add-volume name=comfyui-data,type=cloud-storage,bucket=YOUR_BUCKET \
  --add-volume-mount volume=comfyui-data,mount-path=/data
```

The container starts ComfyUI with:

- `--listen 0.0.0.0`
- `--port ${PORT:-8080}`
- `--base-directory /data`

so mounted storage is used automatically.

## Notes

- This image is CPU-first and works without a GPU.
- Stable Diffusion inference on CPU can be slow; consider managed GPU infrastructure for production workloads.
- Add authentication (IAP, API Gateway, or identity-aware access) before exposing publicly.
