#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

echo "🛑 Arrêt infra…"
dc down
echo "✅ OK"