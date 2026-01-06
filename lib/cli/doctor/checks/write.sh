#!/usr/bin/env bash
set -euo pipefail

doctor_check_write() {
  if [[ "$DOCTOR_AS_JSON" != "1" ]]; then
    printf "%-28s %s\n" "Write checks" ""
  fi

  local d label testfile
  for d in "$DATA_DIR" "$INDEX_DIR" "$TMP_DIR"; do
    label="write $(basename "$d")"
    testfile="$d/.sf_doctor_write_test"

    if echo "ok" >"$testfile" 2>/dev/null; then
      rm -f "$testfile"
      doctor_ok "$label"
    else
      doctor_fail "$label" "not writable: $d"
    fi
  done
}