#!/usr/bin/env bash
set -euo pipefail

clients_delete() {
  require_jq || return 127
  clients_repo_init

  local input="${1:-}"
  local force="0" select="0"
  shift || true

  local as_json="0"
  args_parse_kv "$@" --json as_json || true
  args_parse_kv "$@" --force force --select select

  local slug="" id=""

  if [[ -n "$input" ]]; then
    slug="$(clients_resolve_slug "$input" || true)"
  fi

  if [[ -z "$slug" && "${select:-0}" == "1" ]]; then
    slug="$(clients_repo_list_select_lines | select_from_list "Select client to delete:" || true)"
    slug="${slug%%$'\t'*}"
  fi

  [[ -n "$slug" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "VALIDATION" "id/slug required (or --select)"
    else
      emit error code=VALIDATION message="id/slug required (or --select)"
    fi
    return 2
  }

  id="$(clients_index_get_id_by_slug "$slug" || true)"
  [[ -n "$id" ]] || {
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "NOT_FOUND" "client not found" "{\"slug\":\"$slug\"}"
    else
      emit error code=NOT_FOUND message="client not found" slug="$slug"
    fi
    return 2
  }

  if [[ "${force:-0}" != "1" ]]; then
    if [[ "${as_json:-0}" == "1" ]]; then
      sf_json_err "VALIDATION" "refusing delete without --force" "{\"id\":\"$id\",\"slug\":\"$slug\"}"
    else
      emit warn message="Refusing delete without --force" id="$id" slug="$slug"
    fi
    return 2
  fi

  clients_repo_delete_by_slug "$slug"
  clients_index_delete_slug "$slug"
  clients_index_delete_id "$id"

  if [[ "${as_json:-0}" == "1" ]]; then
    sf_json_ok "{\"id\":\"$id\",\"slug\":\"$slug\"}"
  else
    emit deleted type=client id="$id" slug="$slug"
  fi
}