#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"
source "$SCRIPT_DIR/project-manager.core.sh"
source "$SCRIPT_DIR/project-manager.prompts.sh"

usage() {
  cat <<EOF
Usage: $0 <command>

Commands:
  list       List projects (slugs)
  current    Show current project
  select     Select current project (fzf if available)
  create     Create a new project (prompts)
  edit       Edit a project (fzf)
  delete     Delete a project (fzf)
EOF
}

cmd_list() {
  local items
  items="$(pm_list_projects)"
  if [[ -z "$items" ]]; then
    echo "(aucun projet)"
    exit 0
  fi
  printf "%s\n" "$items"
}

cmd_current() {
  local cur
  cur="$(get_current_project)"
  if [[ -z "${cur:-}" ]]; then
    echo "(aucun projet courant)"
    exit 0
  fi
  echo "$cur"
}

cmd_select() {
  local ref
  ref="$(pm_pick_project)"
  [[ -n "$ref" ]] || exit 0
  set_current_project "$ref"
  echo "✅ Projet courant: $ref"
}

case "${1:-}" in
  list) cmd_list ;;
  current) cmd_current ;;
  select) cmd_select ;;
  create) pm_create_project ;;
  edit) pm_edit_project ;;
  delete) pm_delete_project ;;
  -h|--help|help|"") usage ;;
  *)
    echo "❌ Command inconnue: ${1:-}"
    echo
    usage
    exit 1
    ;;
esac