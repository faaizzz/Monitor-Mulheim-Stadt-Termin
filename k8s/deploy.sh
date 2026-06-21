#!/usr/bin/env bash
# Run on the VPS by .github/workflows/deploy.yml, with the manifests already
# copied to /tmp/mhtermin-k8s. Expects GH_ACTOR/GHCR_PAT/SUPABASE_URL/
# SUPABASE_SERVICE_ROLE_KEY/TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID in the
# environment.
set -euo pipefail

kubectl apply -f /tmp/mhtermin-k8s/namespace.yaml

kubectl create secret docker-registry ghcr-credentials \
  -n mhtermin \
  --docker-server=ghcr.io \
  --docker-username="$GH_ACTOR" \
  --docker-password="$GHCR_PAT" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic mhtermin-secrets \
  -n mhtermin \
  --from-literal=SUPABASE_URL="$SUPABASE_URL" \
  --from-literal=SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
  --from-literal=TELEGRAM_BOT_TOKEN="$TELEGRAM_BOT_TOKEN" \
  --from-literal=TELEGRAM_CHAT_ID="$TELEGRAM_CHAT_ID" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f /tmp/mhtermin-k8s/monitor.yaml -f /tmp/mhtermin-k8s/sync.yaml -f /tmp/mhtermin-k8s/dashboard.yaml

kubectl -n mhtermin rollout restart deployment/mhtermin-monitor deployment/mhtermin-sync deployment/mhtermin-dashboard
kubectl -n mhtermin rollout status deployment/mhtermin-monitor --timeout=120s
kubectl -n mhtermin rollout status deployment/mhtermin-sync --timeout=120s
kubectl -n mhtermin rollout status deployment/mhtermin-dashboard --timeout=120s
