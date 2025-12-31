#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=../core/projects.sh
source "$(dirname "${BASH_SOURCE[0]}")/../core/projects.sh"

projects_cmd() {
  local sub="${1:-}"
  shift || true

  case "$sub" in
    list) projects_list ;;
    create)
      projects_create "$@"
      ;;
    show)
      projects_show "${1:-}"
      ;;
    ""|help|-h|--help)
      cat >&2 <<'TXT'
Usage:
  site-factory projects list [--format ndjson|human]

Notes:
  - Default format: ndjson
TXT
      ;;
    *)
      echo "[ERROR] Unknown subcommand: projects $sub" >&2
      exit 2
      ;;
  esac
}