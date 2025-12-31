#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# stack/stack.core.sh
# Commandes Docker Compose encapsulées.
# ------------------------------------------------------------------------------

# shellcheck source=/dev/null
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/stack.context.sh"

stack_init() {
  [[ -n "${BASEWP_PROFILE:-}" ]] || BASEWP_PROFILE="ovh-vps"
  [[ "${BASEWP_ENV_NAME:-}" == "default" ]] && BASEWP_ENV_NAME=""
  stack_compute_paths
}

stack_dc() {
  stack_init

  local file
  for file in "${STACK_COMPOSE_FILES[@]}"; do
    stack_require_file "$file"
  done

  if [[ ! -f "$STACK_ENV_FILE" ]]; then
    stack_print_env_hint
    die "Env manquant: $STACK_ENV_FILE"
  fi

  local args=()
  for file in "${STACK_COMPOSE_FILES[@]}"; do
    args+=(-f "$file")
  done

  local project_name
  project_name="$(stack_compose_project_name)"

  docker compose -p "$project_name" --env-file "$STACK_ENV_FILE" "${args[@]}" "$@"
}

# ------------------------------------------------------------------------------
# Actions simples
# ------------------------------------------------------------------------------

stack_up()   { stack_dc up -d "$@"; }
stack_down() { stack_dc down "$@"; }
stack_ps()   { stack_dc ps "$@"; }

stack_config() { stack_dc config; }

stack_images() {
  # Affiche les images utilisées par le projet (utile debug)
  stack_dc images || true
}

stack_pull() { stack_dc pull "$@"; }
stack_build() { stack_dc build "$@"; }

stack_restart() {
  # $1 optionnel: service, sinon restart tous
  local service_name="${1:-}"
  if [[ -n "$service_name" ]]; then
    stack_dc restart "$service_name"
  else
    stack_dc restart
  fi
}

# ------------------------------------------------------------------------------
# Services / exec / shells
# ------------------------------------------------------------------------------

stack_services() {
  stack_dc ps --services
}

stack_exec() {
  # Exécute une commande dans un service.
  # Usage: stack_exec <service> <cmd...>
  local service_name="${1:-}"
  shift || true
  [[ -n "$service_name" ]] || die "stack_exec: service_name requis"
  [[ "$#" -gt 0 ]] || die "stack_exec: commande requise"

  stack_dc exec -T "$service_name" "$@"
}

stack_shell() {
  # Ouvre un shell interactif dans un service.
  # Usage: stack_shell <service> [shell]
  local service_name="${1:-}"
  local preferred_shell="${2:-sh}"

  [[ -n "$service_name" ]] || die "stack_shell: service_name requis"

  # On tente d'abord bash, puis sh.
  if [[ "$preferred_shell" == "bash" ]]; then
    stack_dc exec "$service_name" bash || stack_dc exec "$service_name" sh
    return 0
  fi

  stack_dc exec "$service_name" sh || stack_dc exec "$service_name" bash
}

# ------------------------------------------------------------------------------
# Logs
# ------------------------------------------------------------------------------

stack_logs() {
  # Logs d'un service (follow)
  # Usage: stack_logs <service> [--tail N]
  local service_name="${1:-}"
  [[ -n "$service_name" ]] || die "stack_logs: service_name requis"
  info "Logs: $service_name (Ctrl+C pour quitter)"
  stack_dc logs -f --tail 200 "$service_name"
}

stack_logs_all() {
  info "Logs: all services (Ctrl+C pour quitter)"
  stack_dc logs -f --tail 200
}