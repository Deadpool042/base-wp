#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/_lib.sh"

svc="$(service_pick)"
container_logs "$svc"