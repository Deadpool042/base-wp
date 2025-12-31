#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info
echo

echo "⚠️ RESET COMPLET — SUPPRESSION DES VOLUMES"
echo "Cela va supprimer :"
echo "  - les containers du profil courant"
echo "  - les volumes Docker (DB + WP)"
echo

if [[ "${ENV_NAME:-}" == "prod" ]]; then
  echo "🚨 ENV_NAME=prod détecté — opération critique"
  if ! confirm "CONFIRMER RESET PROD (irréversible)"; then
    echo "⏭️ Reset annulé."
    exit 0
  fi
else
  if ! confirm "Confirmer reset (dev)"; then
    echo "⏭️ Reset annulé."
    exit 0
  fi
fi

echo "🧹 Suppression des containers et volumes…"
dc down -v --remove-orphans
echo "✅ Reset terminé."