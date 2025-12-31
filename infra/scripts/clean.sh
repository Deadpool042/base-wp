#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info
echo

soft_clean() {
  info "Clean soft: containers arrêtés + réseaux orphelins + cache build"
  docker container prune -f >/dev/null || true
  docker network prune -f >/dev/null || true
  docker builder prune -f >/dev/null || true
  ok "Clean soft terminé."
}

hard_clean() {
  warn "Clean hard: images inutilisées + volumes orphelins"
  docker image prune -af >/dev/null || true
  docker volume prune -f >/dev/null || true
  ok "Clean hard terminé."
}

project_stop() {
  info "Stop projet (profil courant): dc down --remove-orphans"
  dc down --remove-orphans
  ok "Projet stoppé."
}

if ! has_fzf; then
  soft_clean
  exit 0
fi

choice="$(printf "%s\n" \
  "Project: stop (dc down)" \
  "Docker: clean soft" \
  "Docker: clean hard (⚠️)" \
  "Cancel" \
| pick "Clean")"

case "$choice" in
  "Project: stop (dc down)") project_stop ;;
  "Docker: clean soft") soft_clean ;;
  "Docker: clean hard (⚠️)") confirm "Confirmer clean hard ?" && hard_clean || echo "⏭️ Annulé." ;;
  *) echo "⏭️ Annulé." ;;
esac