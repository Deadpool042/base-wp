#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

echo "⚠️ RESET COMPLET"
echo "Cela va supprimer les volumes Docker (DB + WP)."

if confirm "Confirmer reset"; then
  dc down -v
  echo "✅ Volumes supprimés."
else
  echo "⏭️ Annulé."
fi