#!/usr/bin/env bash
set -euo pipefail

doctor_check_binaries() {
  if command -v bash >/dev/null 2>&1; then
    doctor_ok "bash"
  else
    doctor_fail "bash" "not found"
  fi

  if command -v jq >/dev/null 2>&1; then
    doctor_ok "jq"
  else
    doctor_fail "jq" "not found (required)"
  fi
}