#!/usr/bin/env bash
set -euo pipefail
# require_jq — Vérifie la disponibilité de jq et affiche erreur si absent
# Args: none
# Returns:
#   0 si jq présent ; 127 sinon
# Side effects:
#   - Affiche un log_error si jq manque
# Example:
#   require_jq || return 127
require_jq() { command -v jq >/dev/null 2>&1 || { log_error "jq missing"; return 127; }; }

# json_from_file — Charge et valide un JSON depuis un fichier (format compact)
# Args:
#   $1: path du fichier JSON
# Returns:
#   0 si valide ; 1 si fichier n'existe pas ; 127 si jq absent
# Side effects:
#   - Affiche le JSON compact sur stdout
# Example:
#   json="$(json_from_file /path/to/data.json)"
json_from_file() {
  local p="${1:-}"
  require_jq || return 127
  [[ -f "$p" ]] || return 1
  jq -c '.' "$p"
}

# json_pretty_from_file — Charge et affiche un JSON avec indentation
# Args:
#   $1: path du fichier JSON
# Returns:
#   0 si valide ; 1 si fichier n'existe pas ; 127 si jq absent
# Side effects:
#   - Affiche le JSON formaté (indentation) sur stdout
# Example:
#   json_pretty_from_file /path/to/data.json | less
json_pretty_from_file() {
  local p="${1:-}"
  require_jq || return 127
  [[ -f "$p" ]] || return 1
  jq '.' "$p"
}
