#!/usr/bin/env bash
set -euo pipefail
# args_parse_kv — Parse arguments --key value et --key=value en variables
# Args:
#   $1+: liste d'arguments CLI mélangés avec specs --key varname
# Returns:
#   0 toujours
# Side effects:
#   - Assigne les variables par référence dans le scope appelant
# Example:
#   local slug name
#   args_parse_kv "$@" --slug slug --name name
args_parse_kv() {
  local argv=("$@")
  local i=0

  while [[ $i -lt ${#argv[@]} ]]; do
    local tok="${argv[$i]}"

    case "$tok" in
      --*=*)
        local key="${tok%%=*}"
        local val="${tok#*=}"
        _args_assign "$key" "$val" "${argv[@]:$((i+1))}"
        ;;
      --*)
        local key="$tok"
        local val="${argv[$((i+1))]:-}"
        _args_assign "$key" "$val" "${argv[@]:$((i+2))}"
        i=$((i+1))
        ;;
    esac

    i=$((i+1))
  done
}

# _args_assign — Fonction interne de args_parse_kv
# Args:
#   $1: clé (--key)
#   $2: valeur
#   $3+: spécifications --key varname à traiter
# Returns:
#   0 si la clé a été assignée ; 1 sinon
# Side effects:
#   - Assigne une variable nommée si la clé correspond
# Example:
#   _args_assign "--slug" "acme" --slug slug_var
_args_assign() {
  local key="$1" val="$2"
  shift 2

  while [[ $# -gt 0 ]]; do
    local spec="$1"
    local var="$2"
    shift 2

    if [[ "$key" == "$spec" ]]; then
      printf -v "$var" '%s' "$val"
      return 0
    fi
  done
}
