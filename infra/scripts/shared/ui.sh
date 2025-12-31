#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# shared/ui.sh
# UI : menus, confirm, fzf/select. Retour/Quitter standardisés.
# ------------------------------------------------------------------------------

# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/log.sh"

ui_has_fzf() { command -v fzf >/dev/null 2>&1; }

ui_restore_tty() {
  stty sane 2>/dev/null || true
}

# ui_confirm <message>
# Retour: 0 si oui, 1 sinon
ui_confirm() {
  local confirm_message="${1:-Continuer ?}"

  if ui_has_fzf; then
    local picked=""
    picked="$(
      printf "non\noui\n" | fzf \
        --prompt "${confirm_message} > " \
        --height 10% \
        --border \
        --reverse \
        --cycle \
        || true
    )"
    [[ "${picked:-}" == "oui" ]]
    return $?
  fi

  local ans=""
  read -r -p "${confirm_message} [y/N] " ans || true
  [[ "${ans:-}" =~ ^[Yy]$ ]]
}

# Pause simple (sans oui/non)
ui_pause() {
  local msg="${1:-Appuie sur Entrée pour continuer…}"
  echo
  read -r -p "${msg} " _ || true
  echo
}

ui_ok() { ui_pause "${1:-Appuie sur Entrée pour revenir au menu…}"; }

# ------------------------------------------------------------------------------
# ui_menu <menu_name> <items_newline_separated> [is_root=false]
# - Header (menu/profil/env/projet) EN HAUT
# - Input fzf EN BAS
# - Root: pas de "Retour" (seulement Quitter)
# Retourne: "__back__" | "__quit__" | "__noop__" | "<item>"
# ------------------------------------------------------------------------------
ui_menu() {
  local menu_name="${1:-Menu}"
  local menu_items="${2:-}"
  local is_root="${3:-false}"

  # --- Contexte global (si context.sh est sourcé)
  local profile env current
  profile="$(ctx_get_profile 2>/dev/null || true)"
  [[ -n "${profile:-}" ]] || profile="(auto)"

  env="$(ctx_get_env_name 2>/dev/null || true)"
  [[ -n "${env:-}" ]] || env="default"

  current="$(ctx_get_current_project_ref 2>/dev/null || true)"
  [[ -n "${current:-}" ]] || current="(aucun)"

  # --- Header (haut) + padding (respiration)
  local header
  header=$(
    cat <<EOF
📋 MENU     : ${menu_name}
🧩 PROFIL   : ${profile}
🏷️  ENV      : ${env}
📦 PROJET   : ${current}

(↑/↓ naviguer • Entrée valider • Esc retour • Ctrl+C quitter)
EOF
  )
  header=$'\n'"$header"$'\n'  # espace au-dessus + en dessous

  # --- Items (nettoyage lignes vides)
  local full_items
  full_items="$(printf "%s\n" "$menu_items" | awk 'NF {print}')"

  if [[ "$is_root" == "true" ]]; then
    full_items+=$'\n'"⛔ Quitter"
  else
    full_items+=$'\n'"↩️  Retour"$'\n'"⛔ Quitter"
  fi

  local picked=""

  if ui_has_fzf; then
    picked="$(
      printf "%s\n" "$full_items" | fzf \
        --reverse \
        --cycle \
        --info=inline-right \
        --header "$header" \
        --header-first \
        --prompt $'❯ ' \
        --height 45% \
        --border=rounded \
        --ansi \
        --bind 'esc:abort' \
        --bind 'ctrl-c:abort' \
        || true
    )"
  else
    echo
    echo "========================================"
    printf "%s\n" "$header"
    echo "----------------------------------------"

    local index=1 line
    while IFS= read -r line; do
      printf "%2d) %s\n" "$index" "$line"
      index=$((index + 1))
    done <<< "$full_items"

    echo "========================================"
    echo
    local choice=""
    read -r -p "❯ Choix : " choice || true
    echo

    if [[ -z "${choice:-}" ]]; then
      [[ "$is_root" == "true" ]] && { echo "__noop__"; return 0; }
      echo "__back__"
      return 0
    fi

    picked="$(printf "%s\n" "$full_items" | sed -n "${choice}p")"
  fi

  case "${picked:-}" in
    "↩️  Retour") echo "__back__" ;;
    "⛔ Quitter") echo "__quit__" ;;
    "" )
      [[ "$is_root" == "true" ]] && echo "__noop__" || echo "__back__"
      ;;
    *) echo "$picked" ;;
  esac
}