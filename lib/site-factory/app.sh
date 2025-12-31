#!/usr/bin/env bash
set -euo pipefail

# Global options parsing (minimal v1)
FORMAT="${FORMAT:-ndjson}"

args=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --format)
      shift
      FORMAT="${1:-ndjson}"
      shift || true
      ;;
    --format=*)
      FORMAT="${1#*=}"
      shift
      ;;
    --no-interactive)
      export INTERACTIVE=0
      shift
      ;;
    -h|--help)
      cat >&2 <<'TXT'
site-factory

Usage:
  site-factory projects list [--format ndjson|human]
TXT
      exit 0
      ;;
    *)
      args+=("$1")
      shift
      ;;
  esac
done

export FORMAT

cmd="${args[0]:-}"
sub="${args[1]:-}"

case "$cmd" in
  projects)
    # shellcheck source=./commands/projects.sh
    source "$(dirname "${BASH_SOURCE[0]}")/commands/projects.sh"
    projects_cmd "$sub" "${args[@]:2}"
    ;;
  "" )
    echo "[ERROR] Missing command. Try --help" >&2
    exit 2
    ;;
  * )
    echo "[ERROR] Unknown command: $cmd" >&2
    exit 2
    ;;
esac