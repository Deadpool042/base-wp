#!/usr/bin/env bash
set -euo pipefail

# Cache global des fichiers déjà sourcés (par chemin absolu)
# Note: -g pour garantir global même si ce fichier est sourcé dans une fonction
declare -gA __SF_SOURCED=()

# sf_source — Source un fichier relatif à $SF_ROOT (idempotent)
# Args:
#   $1: chemin relatif (ex: "core/log/emit.sh")
# Returns:
#   0 si OK ; 1 sinon
# Side effects:
#   charge le fichier dans le shell courant (une seule fois par process)
sf_source() {
  local rel="${1:-}"

  if [[ "${SF_DEBUG_SOURCE:-0}" == "1" ]]; then
  echo "[sf] load $rel" >&2
fi

  [[ -n "$rel" ]] || { echo "[sf] sf_source: path missing" >&2; return 1; }

  [[ -n "${SF_ROOT:-}" ]] || { echo "[sf] sf_source: SF_ROOT not set" >&2; return 1; }

  local abs="$SF_ROOT/$rel"
  if [[ ! -f "$abs" ]]; then
    echo "[sf] source not found: $abs" >&2
    return 1
  fi

  # Déjà sourcé → no-op
  if [[ -n "${__SF_SOURCED[$abs]:-}" ]]; then
    return 0
  fi
  __SF_SOURCED["$abs"]=1

  # shellcheck source=/dev/null
  source "$abs"
}

# sf_require_source — Comme sf_source mais exit si KO (utile dans bootstrap)
sf_require_source() {

  sf_source "${1:-}" || exit 1
}