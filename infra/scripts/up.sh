#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

echo "🚀 Démarrage infra…"
dc up -d
dc ps
echo "✅ OK"