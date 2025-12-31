#!/usr/bin/env bash
set -euo pipefail

# Guard
if [[ "${__BASEWP_STRINGS_LOADED:-0}" == "1" ]]; then return 0; fi
__BASEWP_STRINGS_LOADED="1"

str_strip_newlines() { printf "%s" "${1:-}" | tr -d '\r\n'; }

str_lower() { printf "%s" "${1:-}" | tr '[:upper:]' '[:lower:]'; }

str_trim() {
  # trim spaces + tabs
  local s="${1:-}"
  s="${s#"${s%%[!$' \t']*}"}"
  s="${s%"${s##*[!$' \t']}"}"
  printf "%s" "$s"
}

str_slugify() {
  local s
  s="$(str_lower "${1:-}")"
  s="$(printf "%s" "$s" | sed -E 's/[ _]+/-/g; s/[^a-z0-9-]+/-/g; s/-+/-/g; s/^-|-$//g')"
  printf "%s" "$s"
}

str_clean_input() {
  # supprime CR/LF puis trim espaces/tabs
  local s="${1:-}"
  s="$(str_strip_newlines "$s")"
  s="$(str_trim "$s")"
  printf "%s" "$s"
}

