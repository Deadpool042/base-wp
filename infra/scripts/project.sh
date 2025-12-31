#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/_lib.sh"

PM="$SCRIPT_DIR/project-manager.sh"

require_pm() {
  if [[ ! -f "$PM" ]]; then
    echo "❌ project-manager.sh introuvable: $PM"
    echo "➡️  Attendu: infra/scripts/project-manager.sh"
    echo "➡️  Ce script doit gérer: list/edit/create/delete/select/current project"
    exit 1
  fi
  if [[ ! -x "$PM" ]]; then
    chmod +x "$PM" 2>/dev/null || true
  fi
  if [[ ! -x "$PM" ]]; then
    echo "❌ project-manager.sh non exécutable: $PM"
    echo "➡️  Fais: chmod +x infra/scripts/project-manager.sh"
    exit 1
  fi
}

pm() {
  require_pm
  bash "$PM" "$@"
}

# --------------------------------------------------
# BaseWP — Project launcher (UI)
# - Interactive menu + shortcuts
# - Delegates project CRUD to project-manager.sh
# --------------------------------------------------

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url"
  else
    echo "$url"
  fi
}

site_url() {
  load_env
  if [[ -n "${WP_SITE_URL:-}" ]]; then
    echo "$WP_SITE_URL"
    return 0
  fi
  if [[ -n "${SITE_DOMAIN:-}" ]]; then
    echo "https://${SITE_DOMAIN}"
    return 0
  fi
  echo "http://localhost"
}

print_help() {
  cat <<EOF
🧩 Profil: $PROFILE | ENV_NAME=${ENV_NAME:-default}

Usage:
  project.sh                # menu interactif (fzf)
  project.sh open           # ouvre le site (WP_SITE_URL)
  project.sh select         # sélectionner le projet courant
  project.sh list           # lister les projets
  project.sh edit           # éditer un projet
  project.sh create         # créer un projet
  project.sh delete         # supprimer un projet

Note:
  Les commandes list/edit/create/delete sont déléguées à project-manager.sh

Raccourcis infra/wp:
  project.sh up|down|restart|ps|logs
  project.sh wp|install
  project.sh clean|reset
EOF
}

# ---------- Commands (non-interactive) ----------
cmd="${1:-}"

run_infra() {
  local sub="$1"
  shift || true
  case "$sub" in
    up)      dc up -d --remove-orphans ;;
    down)    dc down --remove-orphans ;;
    restart) dc down --remove-orphans && dc up -d --remove-orphans ;;
    ps)      dc ps ;;
    logs)    "$SCRIPT_DIR/logs.sh" ;;
    clean)   "$SCRIPT_DIR/clean.sh" ;;
    reset)   "$SCRIPT_DIR/reset.sh" ;;
    *)
      echo "❌ Commande infra inconnue: $sub"
      return 1
      ;;
  esac
}

run_wp() {
  local sub="$1"
  shift || true
  case "$sub" in
    menu|wp) "$SCRIPT_DIR/wp.sh" ;;
    install) "$SCRIPT_DIR/wp.sh" install ;;
    *)
      echo "❌ Commande WP inconnue: $sub"
      return 1
      ;;
  esac
}

case "$cmd" in
  ""|menu)
    # handled below (fzf)
    ;;

  open)
    open_url "$(site_url)"
    exit 0
    ;;

  select|list|edit|create|current)
    pm "$cmd"
    exit 0
    ;;

  delete|rm|remove)
    pm delete
    exit 0
    ;;

  up|down|restart|ps|logs|clean|reset)
    run_infra "$cmd"
    exit 0
    ;;

  wp)
    run_wp menu
    exit 0
    ;;

  install)
    run_wp install
    exit 0
    ;;

  -h|--help|help)
    print_help
    exit 0
    ;;

  *)
    echo "❌ Commande inconnue: $cmd"
    echo
    print_help
    exit 1
    ;;
esac

# ---------- Interactive menu ----------
if ! has_fzf; then
  echo "⚠️ fzf non détecté: brew install fzf"
  echo
  print_help
  exit 0
fi

require_pm
profile_info

declare -a MENU_ITEMS=(
  "Project: select current"
  "Project: current (show)"
  "Project: list"
  "Project: edit"
  "Project: create"
  "Project: delete"
  "──────────"
  "Infra: up"
  "Infra: down"
  "Infra: restart"
  "Infra: ps"
  "Infra: logs"
  "──────────"
  "WP: menu"
  "WP: install"
  "──────────"
  "Open site"
  "Clean"
  "Reset (⚠️)"
)

choice="$(printf "%s\n" "${MENU_ITEMS[@]}" | pick "Project")"
[[ -n "${choice:-}" ]] || { echo "⏭️ Annulé."; exit 0; }

case "$choice" in
  "Project: select current")
    pm select
    ;;

  "Project: current (show)")
    pm current
    ;;

  "Project: list") pm list ;;
  "Project: edit") pm edit ;;
  "Project: create") pm create ;;
  "Project: delete") pm delete ;;

  "Infra: up") dc up -d --remove-orphans ;;
  "Infra: down") dc down --remove-orphans ;;
  "Infra: restart") dc down --remove-orphans && dc up -d --remove-orphans ;;
  "Infra: ps") dc ps ;;
  "Infra: logs") "$SCRIPT_DIR/logs.sh" ;;

  "WP: menu") "$SCRIPT_DIR/wp.sh" ;;
  "WP: install") "$SCRIPT_DIR/wp.sh" install ;;

  "Open site") open_url "$(site_url)" ;;
  "Clean") "$SCRIPT_DIR/clean.sh" ;;
  "Reset (⚠️)") "$SCRIPT_DIR/reset.sh" ;;

  "──────────")
    echo "⏭️ Annulé."
    exit 0
    ;;

  *)
    echo "⏭️ Annulé."
    ;;
esac