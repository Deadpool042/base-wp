#!/usr/bin/env bash
set -euo pipefail

doctor_check_paths() {
  if [[ -n "${SF_ROOT:-}" && -d "$SF_ROOT" ]]; then
    doctor_ok "SF_ROOT"
  else
    doctor_fail "SF_ROOT" "not set or invalid"
  fi

  local d label
  for d in "$DATA_DIR" "$INDEX_DIR" "$TMP_DIR"; do
    label="dir $(basename "$d")"
    if [[ -d "$d" ]]; then
      doctor_ok "$label"
    else
      doctor_fail "$label" "missing: $d"
    fi
  done
}