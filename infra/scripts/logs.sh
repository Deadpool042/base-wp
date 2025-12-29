#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

svc="$(service_pick)"

if [[ -z "${svc:-}" ]]; then
  echo "⏭️ Aucun service sélectionné."
  exit 0
fi

container_logs "$svc"