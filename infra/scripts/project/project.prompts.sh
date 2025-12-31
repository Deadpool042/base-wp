#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# project/project.prompts.sh
# UI Project (wizard/prompt/pick). Dépend de shared/ui.sh + strings.sh + validate.sh
# ------------------------------------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=/dev/null
source "$SCRIPT_DIR/../shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../shared/strings.sh"
# shellcheck source=/dev/null
source "$SCRIPT_DIR/../shared/validate.sh"

project_pick_from_list() {
  local title="${1:-Choisir}"
  local items="${2:-}"
  ui_menu "$title" "$items"
}

# read_line <prompt> <default>
# - utilise readline si possible (flèches OK)
_read_line() {
  local prompt="${1:-❯ }"
  local def="${2:-}"
  local out=""

  # readline seulement si stdin est un TTY
  if [[ -t 0 ]]; then
    if [[ -n "$def" ]]; then
      # -e : readline, -i : default éditable
      read -e -r -p "$prompt" -i "$def" out || true
    else
      read -e -r -p "$prompt" out || true
    fi
  else
    # fallback non-interactif
    read -r -p "$prompt" out || true
  fi

  out="$(str_trim "${out:-}")"
  out="$(str_strip_newlines "$out")"
  printf "%s" "$out"
}

project_prompt_value() {
  local label="${1:-Valeur}"
  local def="${2:-}"
  local required="${3:-false}"
  local v=""

  while true; do
    echo
    if [[ -n "$def" ]]; then
      read -er -p "❯ ${label} [${def}] : " v || true
    else
      read -er -p "❯ ${label} : " v || true
    fi

    v="$(str_strip_newlines "$(str_trim "${v:-}")")"
    local def_clean
    def_clean="$(str_strip_newlines "$(str_trim "${def:-}")")"

    echo

    if [[ -z "$v" && -n "$def_clean" ]]; then
      printf "%s" "$def_clean"
      return 0
    fi

    if [[ "$required" == "true" && -z "$v" ]]; then
      warn "Valeur requise."
      continue
    fi

    printf "%s" "$v"
    return 0
  done
}

project_prompt_prod_domain() {
  local def="${1:-}"
  local v
  v="$(project_prompt_value "Domaine prod (laisser vide = auto)" "$def" "false")"
  v="$(str_trim "$v")"
  printf "%s" "$v"
}

project_choose_locale() {
  local def="${1:-fr_FR}"
  local items picked

  items=$(
    cat <<'EOF'
fr_FR
en_US
es_ES
de_DE
it_IT
EOF
  )

  picked="$(ui_menu "Locale WP" "$items")"
  case "${picked:-}" in
    "__back__"|"__quit__"|"__noop__"|"") printf "%s" "$def" ;;
    *) printf "%s" "$picked" ;;
  esac
}

project_prompt_edit_action() {
  local picked
  picked="$(ui_menu "Éditer un projet" "$(cat <<'EOF'
👤 Modifier le client
🌐 Modifier le domaine local
🌍 Modifier le domaine prod
🗣️  Modifier la locale WP
🔁 Régénérer les env
🧾 Sync hosts
🔐 Ensure certs
📁 Ouvrir le dossier
EOF
)")"

  case "${picked:-}" in
    "__back__"|"__quit__"|"__noop__"|"") echo "" ;;
    "👤 Modifier le client")   echo "client_name" ;;
    "🌐 Modifier le domaine local") echo "local_domain" ;;
    "🌍 Modifier le domaine prod")  echo "prod_domain" ;;
    "🗣️  Modifier la locale WP")    echo "wp_locale" ;;
    "🔁 Régénérer les env")         echo "regen_env" ;;
    "🧾 Sync hosts")                echo "sync_hosts" ;;
    "🔐 Ensure certs")              echo "ensure_certs" ;;
    "📁 Ouvrir le dossier")         echo "open_folder" ;;
    *) echo "" ;;
  esac
}