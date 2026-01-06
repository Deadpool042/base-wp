#!/usr/bin/env bash
set -euo pipefail

doctor_init_context() {
  DOCTOR_AS_JSON="${1:-0}"
  DOCTOR_FAILS=0
  DOCTOR_WARNS=0
  DOCTOR_CHECKS='[]'
}

doctor_push_check() {
  local name="${1:-}" status="${2:-}" message="${3:-}"
  DOCTOR_CHECKS="$(jq -n \
    --argjson checks "$DOCTOR_CHECKS" \
    --arg name "$name" \
    --arg status "$status" \
    --arg message "$message" \
    '$checks + [{name:$name,status:$status,message:$message}]'
  )"
}

doctor_ok() {
  doctor_push_check "$1" "ok" "${2:-}"
  [[ "$DOCTOR_AS_JSON" == "1" ]] || printf "%-28s OK\n" "$1"
}

doctor_warn() {
  DOCTOR_WARNS=$((DOCTOR_WARNS + 1))
  doctor_push_check "$1" "warn" "${2:-}"
  [[ "$DOCTOR_AS_JSON" == "1" ]] || printf "%-28s WARN: %s\n" "$1" "${2:-}"
}

doctor_fail() {
  DOCTOR_FAILS=$((DOCTOR_FAILS + 1))
  doctor_push_check "$1" "fail" "${2:-}"
  [[ "$DOCTOR_AS_JSON" == "1" ]] || printf "%-28s FAIL: %s\n" "$1" "${2:-}"
}