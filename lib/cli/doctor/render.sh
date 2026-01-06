#!/usr/bin/env bash
set -euo pipefail

doctor_human_header() {
  printf "%-28s %s\n" "Site-Factory" "doctor"
}

doctor_status_message() {
  if [[ "$DOCTOR_FAILS" -eq 0 && "$DOCTOR_WARNS" -eq 0 ]]; then
    printf '%s' "Environment OK"
    return 0
  fi
  if [[ "$DOCTOR_FAILS" -eq 0 ]]; then
    printf '%s' "Environment OK (with warnings)"
    return 0
  fi
  printf '%s' "Environment issues detected"
}

doctor_render_human_footer() {
  local message
  message="$(doctor_status_message)"

  # footer seulement si pas de FAIL (sinon tu as déjà les lignes FAIL)
  if [[ "$DOCTOR_FAILS" -eq 0 ]]; then
    echo
    echo "✓ $message"
  fi
}

doctor_render_json() {
  local message summary payload total available
  message="$(doctor_status_message)"

  total="$(printf '%s' "$DOCTOR_CHECKS" | jq 'length')"
  summary="$(jq -n \
    --argjson total "$total" \
    --argjson warn "$DOCTOR_WARNS" \
    --argjson fail "$DOCTOR_FAILS" \
    '{total:$total,warn:$warn,fail:$fail}'
  )"

  # available checks for UI dropdown (provided by doctor_cmd.sh)
  available="$(doctor_available_checks_json)"

  payload="$(jq -n \
    --arg message "$message" \
    --argjson checks "$DOCTOR_CHECKS" \
    --argjson summary "$summary" \
    --argjson availableChecks "$available" \
    '{message:$message,checks:$checks,summary:$summary,availableChecks:$availableChecks}'
  )"

  if [[ "$DOCTOR_FAILS" -gt 0 ]]; then
    jq -n --argjson data "$payload" '{ok:false,data:$data,meta:null}'
  else
    jq -n --argjson data "$payload" '{ok:true,data:$data,meta:null}'
  fi
}

doctor_available_checks_json() {
  # expects DOCTOR_AVAILABLE_CHECKS to be a bash array (global)
  jq -n --argjson items "$(printf '%s\n' "${DOCTOR_AVAILABLE_CHECKS[@]:-}" | jq -R . | jq -s .)" '$items'
}

doctor_render_invalid_only_json() {
  # args: requested_only
  local requested="${1:-}"

  local available
  available="$(doctor_available_checks_json)"

  local payload
  payload="$(jq -n \
    --arg message "unknown doctor check" \
    --arg requested "$requested" \
    --argjson availableChecks "$available" \
    '{message:$message,requested:$requested,availableChecks:$availableChecks}'
  )"

  # UI-friendly failure envelope
  jq -n --argjson data "$payload" '{ok:false,data:$data,meta:null}'
}

doctor_render_invalid_only_human() {
  # args: requested_only
  local requested="${1:-}"
  echo "ERROR: unknown doctor check: $requested" >&2
  echo "Available checks:" >&2
  local x
  for x in "${DOCTOR_AVAILABLE_CHECKS[@]:-}"; do
    echo "  - $x" >&2
  done
}