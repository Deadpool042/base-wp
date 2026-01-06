#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SF_ROOT="$HERE"

export SF_ROOT

# shellcheck source=core/bootstrap.sh
source "$SF_ROOT/core/bootstrap.sh"

cmd="${1:-}"
shift || true

case "$cmd" in
  clients)
    sf_require_source "cli/clients_cmd.sh"
    clients_cmd "$@"
    ;;
  projects)
    sf_require_source "cli/projects_cmd.sh"
    projects_cmd "$@"
    ;;
  doctor) sf_require_source "cli/doctor/doctor_cmd.sh"
    doctor_cmd "$@" ;;
  ""|-h|--help)
    echo "Usage:"
    echo "  site-factory clients <subcommand>"
    echo "  site-factory projects <subcommand>"
    echo "  site-factory doctor [--json=1]"
    ;;
  *)
    log_error "Unknown command: $cmd"
    exit 2
    ;;
esac