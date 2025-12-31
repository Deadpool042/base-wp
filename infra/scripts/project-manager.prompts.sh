#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# BaseWP — Project Manager (PROMPTS / UI)
# - Tout ce qui est I/O: read, select, fzf, menus.
# - Zéro logique “métier” ici.
# - Dépend du core (pm_is_fqdn, has_fzf, pick, etc.)
# ------------------------------------------------------------------------------

# Guard: avoid double-sourcing
if [[ "${__BASEWP_PM_PROMPTS_LOADED:-0}" == "1" ]]; then
  return 0
fi
__BASEWP_PM_PROMPTS_LOADED="1"

# ==============================================================================
# Generic prompts
# ==============================================================================


pm_prompt_value() {
  local label="$1"
  local def="${2:-}"
  local val=""

  if [[ -n "$def" ]]; then
    read -r -p "$label [$def]: " val
    printf "%s" "${val:-$def}"
    echo
    return 0
  fi

  read -r -p "$label: " val
  printf "%s" "${val}"
  echo
}


pm_pick_from_list() {
  local title="${1:-Select}"
  local items="${2:-}"

  [[ -n "$items" ]] || { echo ""; return 0; }

  if has_fzf; then
    printf "%s\n" "$items" | pick "$title"
    return 0
  fi

  # Build an array so "select" works even with special chars (/), and we don't word-split.
  local -a arr=()
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    arr+=("$line")
  done < <(printf "%s\n" "$items")

  [[ "${#arr[@]}" -gt 0 ]] || { echo ""; return 0; }

  echo "Choisir:"
  select opt in "${arr[@]}"; do
    echo "${opt:-}"
    return 0
  done
}


pm_pick_action() {
  local title="${1:-Action}"
  local actions="${2:-}"
  pm_pick_from_list "$title" "$actions"
}

# ==============================================================================
# Domain / locale prompts
# ==============================================================================

pm_choose_locale() {
  local def="${1:-fr_FR}"

  local locales
  locales=$(
    cat <<'EOF'
fr_FR
en_US
es_ES
de_DE
it_IT
nl_NL
pt_PT
pt_BR
EOF
  )

  if has_fzf; then
    # show default first, dedup
    printf "%s\n" "$def" "$locales" | awk '!seen[$0]++' | pick "Locale (WordPress)"
    return 0
  fi

  local -a arr=()
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    arr+=("$line")
  done < <(printf "%s\n" "$locales")

  echo "Choisir la langue WordPress (locale). Défaut: $def"
  select opt in "${arr[@]}" "Autre (saisir...)" "Garder défaut ($def)"; do
    case "${opt:-}" in
      "") echo "$def"; return 0 ;;
      "Autre (saisir...)")
        pm_prompt_value "Locale (ex: fr_FR, en_US)" "$def"
        return 0
        ;;
      "Garder défaut ($def)") echo "$def"; return 0 ;;
      *) echo "$opt"; return 0 ;;
    esac
  done
}


pm_prompt_prod_domain() {
  local def="${1:-}"
  local v="" v_norm=""

  while true; do
    v="$(pm_prompt_value "Domaine prod (ex: example.com) (optionnel)" "$def")"

    # lowercase + trim all whitespace
    v="$(printf "%s" "$v" | tr '[:upper:]' '[:lower:]')"
    v="$(printf "%s" "$v" | tr -d '[:space:]')"
    v_norm="$v"

    case "$v_norm" in
      "-"|"skip"|"none")
        echo ""
        return 0
        ;;
    esac

    if [[ -z "$v_norm" ]]; then
      if [[ -z "$def" ]]; then
        echo ""
        return 0
      fi
      echo "$def"
      return 0
    fi

    if pm_is_fqdn "$v_norm"; then
      echo "$v_norm"
      return 0
    fi

    echo "⚠️ Domaine invalide. Exemple attendu: example.com / monsite.fr (ou '-' pour ignorer)."
  done
}