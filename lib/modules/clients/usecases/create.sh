#!/usr/bin/env bash
set -euo pipefail

clients_create() {
  require_jq || return 127
  clients_repo_init

  local as_json="0"
  # On supporte --json 1 dans create aussi
  # (args_parse_kv ignore les inconnus, donc on le parse 2 fois proprement)
  args_parse_kv "$@" --json as_json || true

  local slug="" name="" email="" phone=""
  args_parse_kv "$@" \
    --slug slug \
    --name name \
    --email email \
    --phone phone

  slug="$(clients_domain_normalize_slug "$slug")"
  clients_domain_validate_slug "$slug" || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "VALIDATION" "invalid slug" "{\"slug\":\"$slug\"}"
    else
      emit error code=VALIDATION message="invalid slug" slug="$slug"
    fi
    return 2
  }

  require_nonempty "$name" || name="$slug"

  # slug unique
  if clients_index_slug_exists "$slug"; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "ALREADY_EXISTS" "slug already exists" "{\"slug\":\"$slug\"}"
    else
      emit error code=ALREADY_EXISTS message="slug already exists" slug="$slug"
    fi
    return 1
  fi

  local id ts json
  id="$(uuid_v4)"
  ts="$(now_utc)"

  json="$(clients_domain_defaults_json "$id" "$slug" "$name" "$ts")"
  json="$(printf '%s' "$json" | jq \
    --arg email "$email" \
    --arg phone "$phone" \
    --arg ts "$ts" \
    '.contact.email = (if $email == "" then null else $email end)
     | .contact.phone = (if $phone == "" then null else $phone end)
     | .updatedAt = $ts
    ')"

  clients_repo_write_by_slug "$slug" "$json"
  clients_index_set_slug "$slug" "$id"
  clients_index_set_id "$id" "$slug"

  if [[ "${as_json:-0}" == "1" ]]; then
    sf_json_ok "{\"id\":\"$id\",\"slug\":\"$slug\"}"
  else
    emit created type=client id="$id" slug="$slug" name="$name"
  fi
}