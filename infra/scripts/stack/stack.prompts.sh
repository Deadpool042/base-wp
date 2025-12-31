#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# stack/stack.prompts.sh
# UI Stack (profiles/env/service) via shared/ui.sh
# ------------------------------------------------------------------------------

# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/../shared/ui.sh"
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/stack.context.sh"
# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/stack.core.sh"

stack_prompt_choose_profile() {
  local profiles
  profiles="$(stack_list_profiles)"
  [[ -n "$profiles" ]] || { warn "Aucun profile infra trouvé."; echo "__back__"; return 0; }
  ui_menu "Choisir un profile" "$profiles"
}

stack_prompt_choose_env_name() {
  local items=$(
    cat <<'EOF'
default
dev
prod
EOF
  )
  ui_menu "Choisir un ENV" "$items"
}

stack_prompt_pick_service() {
  local services
  services="$(stack_services || true)"
  [[ -n "$services" ]] || { warn "Aucun service (stack down ?)"; echo "__back__"; return 0; }
  ui_menu "Choisir un service" "$services"
}

stack_prompt_pick_shell() {
  local shells=$(
    cat <<'EOF'
sh
bash
EOF
  )
  ui_menu "Choisir un shell" "$shells"
}

stack_prompt_command() {
  # Prompt commande libre (pour exec)
  # Retourne une ligne brute (peut contenir espaces)
  local cmd=""
  read -r -p "Commande à exécuter (ex: wp --info): " cmd
  echo "$cmd"
}