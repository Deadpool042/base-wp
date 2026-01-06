#!/usr/bin/env bash
set -euo pipefail

doctor_cmd() {
  local as_json="0"
  local only=""
  args_parse_kv "$@" --json as_json --only only || true

  # context + render
  sf_require_source "cli/doctor/context.sh"
  sf_require_source "cli/doctor/render.sh"

  # checks
  sf_require_source "cli/doctor/checks/binaries.sh"
  sf_require_source "cli/doctor/checks/paths.sh"
  sf_require_source "cli/doctor/checks/write.sh"
  sf_require_source "cli/doctor/checks/clients_indexes.sh"

  # Registry (order matters) — stable IDs for UI/CLI
  local -a DOCTOR_CHECKS_REGISTRY=(
    "binaries:doctor_check_binaries"
    "paths:doctor_check_paths"
    "write:doctor_check_write"
    "clients-indexes:doctor_check_clients_indexes"
  )

  doctor_init_context "$as_json"

    # expose available checks for UI
  DOCTOR_AVAILABLE_CHECKS=()
  local entry
  for entry in "${DOCTOR_CHECKS_REGISTRY[@]}"; do
    DOCTOR_AVAILABLE_CHECKS+=("${entry%%:*}")
  done

  # validate --only
    # validate --only (UI-friendly)
  if [[ -n "$only" ]]; then
    local found="0"
    for entry in "${DOCTOR_CHECKS_REGISTRY[@]}"; do
      if [[ "${entry%%:*}" == "$only" ]]; then
        found="1"
        break
      fi
    done

    if [[ "$found" != "1" ]]; then
      if [[ "$as_json" == "1" ]]; then
        doctor_render_invalid_only_json "$only"
      else
        doctor_render_invalid_only_human "$only"
      fi
      return 1
    fi
  fi

  _doctor_should_run_check() {
    local check_id="${1:-}"
    [[ -z "$only" ]] && return 0
    [[ "$only" == "$check_id" ]]
  }

  # Human header
  [[ "$DOCTOR_AS_JSON" == "1" ]] || doctor_human_header

  # Run checks dynamically
  local entry id fn
  for entry in "${DOCTOR_CHECKS_REGISTRY[@]}"; do
    id="${entry%%:*}"
    fn="${entry##*:}"

    if _doctor_should_run_check "$id"; then
      type "$fn" >/dev/null 2>&1 || {
        emit error code=MISSING_CHECK message="missing doctor check function" check="$id" fn="$fn"
        return 1
      }
      "$fn"
    fi
  done

  # Render
  if [[ "$DOCTOR_AS_JSON" == "1" ]]; then
    doctor_render_json
    [[ "$DOCTOR_FAILS" -gt 0 ]] && return 1
    return 0
  fi

  doctor_render_human_footer
  [[ "$DOCTOR_FAILS" -gt 0 ]] && return 1
  return 0
}