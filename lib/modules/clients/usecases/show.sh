#!/usr/bin/env bash
set -euo pipefail

# clients_show — Affiche les détails d'un client par ID ou slug
# Args:
#   $1: ID (UUID) ou slug
#   --json <0|1>: si 1, renvoie un envelope JSON (défaut 0)
# Returns:
#   0 si trouvé ; 1 sinon ; 127 si jq manquant
clients_show() {
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
    return 1
  }

  local slug id json
  slug="$(clients_resolve_slug "$input" || true)"
  if [[ -z "$slug" ]]; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"input\":\"$input\"}"
    else
      emit error code=NOT_FOUND message="client not found" input="$input"
    fi
    return 1
  fi

  id="$(clients_index_get_id_by_slug "$slug" || true)"
  [[ -n "$id" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$slug"
    fi
    return 1
  }

  json="$(clients_repo_read_by_slug "$slug" || true)"
  [[ -n "$json" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$slug"
    fi
    return 1
  }

  if [[ "${as_json:-0}" == "1" ]]; then
    # data = JSON client complet ; meta = infos utiles
    sf_json_ok "$json" "{\"id\":\"$id\",\"slug\":\"$slug\"}"
    return 0
  fi

  # Human/dev: JSON brut (parfait pour debug + piping jq)
  printf '%s\n' "$json"
}