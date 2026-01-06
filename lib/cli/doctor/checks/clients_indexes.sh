#!/usr/bin/env bash
set -euo pipefail

doctor_check_clients_indexes() {
  local c_by_slug c_by_id
  c_by_slug="$INDEX_DIR/clients/by-slug"
  c_by_id="$INDEX_DIR/clients/by-id"

  if [[ -d "$c_by_slug" ]]; then
    doctor_ok "clients index by-slug"
  else
    doctor_warn "clients index by-slug" "missing"
  fi

  if [[ -d "$c_by_id" ]]; then
    doctor_ok "clients index by-id"
  else
    doctor_warn "clients index by-id" "missing"
  fi
}