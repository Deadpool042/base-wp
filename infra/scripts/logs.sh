#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

profile_info
echo

svc="${1:-}"
shift || true

# Récupère les services (sans faire planter si infra down)
services="$(dc ps --services 2>/dev/null || true)"

# Si l'utilisateur passe un service explicitement
if [[ -n "$svc" ]]; then
  if [[ -z "$services" ]]; then
    info "Aucun service Docker en cours pour ce projet."
    echo
    info "Lance d'abord l'infra : make up"
    exit 0
  fi

  if ! printf "%s\n" "$services" | grep -qx "$svc"; then
    err "Service inconnu: $svc"
    echo
    info "Services disponibles:"
    printf "  - %s\n" $services
    exit 1
  fi

  echo "📜 Logs: $svc (Ctrl+C pour quitter)"
  dc logs -f --tail 200 "$svc" "$@"
  exit 0
fi

# Pas de service fourni → fzf si dispo
if has_fzf; then
  if [[ -z "$services" ]]; then
    info "Aucun service Docker en cours pour ce projet."
    echo
    info "Actions possibles :"
    echo "  • make up        → démarrer l'infra"
    echo "  • make project   → changer de projet"
    echo "  • make ps        → status"
    exit 0
  fi

  container_logs "$(service_pick)"
  exit 0
fi

# Fallback sans fzf
warn "fzf non détecté, et aucun service fourni."
echo "➡️ Usage: make logs <service>"
echo

if [[ -z "$services" ]]; then
  info "Aucun service Docker en cours."
  echo "➡️ Lance: make up"
  exit 0
fi

info "Services disponibles:"
printf "  - %s\n" $services
echo
dc ps