#!/usr/bin/env bash
set -euo pipefail

# clients_validate — Valide le JSON d'un client (contract v1)
# Args:
#   $1: id|slug
#   --json <0|1>: si 1, renvoie un JSON stable (défaut 0)
# Returns:
#   0 si valid ; 1 si invalid ; 2 si not found/args invalid ; 127 si jq manquant
clients_validate() {
  require_jq || return 127

  local input="${1:-}"
  shift || true

  local as_json="0"
  args_parse_kv "$@" --json as_json

  require_nonempty "$input" || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "VALIDATION" "id or slug required"
    else
      emit error code=VALIDATION message="id or slug required"
    fi
    return 2
  }

  local slug json
  slug="$(clients_resolve_slug "$input" || true)"
  if [[ -z "$slug" ]]; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"input\":\"$input\"}"
    else
      emit error code=NOT_FOUND message="client not found" input="$input"
    fi
    return 2
  fi

  json="$(clients_repo_read_by_slug "$slug" || true)"
  if [[ -z "$json" ]]; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$slug"
    fi
    return 2
  fi

  if printf '%s' "$json" | clients_validate_json; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_ok "{\"slug\":\"$slug\"}"
    else
      emit success type=client_validation slug="$slug"
    fi
    return 0
  fi

  if [[ "${as_json:-0}" == "1" ]]; then
    sf_json_err "INVALID_DATA" "invalid client json" "{\"slug\":\"$slug\"}"
  else
    emit error code=INVALID_DATA message="invalid client json" slug="$slug"
  fi
  return 1
}