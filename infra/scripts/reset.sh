#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

echo "⚠️ RESET COMPLET"
echo "Cela va supprimer les volumes Docker (DB + WP)."

if confirm "Confirmer reset"; then
  echo "🧹 Suppression des containers et volumes…"
  dc down -v
  echo "✅ Reset terminé (volumes supprimés)."
else
  echo "⏭️ Reset annulé."
fi