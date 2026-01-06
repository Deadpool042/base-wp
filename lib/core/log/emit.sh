#!/usr/bin/env bash
set -euo pipefail

# emit — Émet une ligne de log type + paires clé=valeur vers stdout
# Args:
#   $1: type du message (ex: info, warn, error, created, etc.)
#   $2+: paires clé=valeur (optionnel)
# Returns:
#   0 toujours
# Side effects:
#   - Écrit une ligne sur stdout
# Example:
#   emit info "msg=test" "user=alice"
emit() {
  local type="${1:-}"
  shift || true
  printf '%s' "$type"
  local kv
  for kv in "$@"; do
    printf ' %s' "$kv"
  done
  printf '\n'
}
