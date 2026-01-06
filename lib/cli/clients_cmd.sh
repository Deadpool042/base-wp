#!/usr/bin/env bash
set -euo pipefail

 sf_require_source "modules/clients/index.sh"

# clients_cmd — Dispatcher principal pour les sous-commandes client
# Args:
#   $1: sous-commande (create, list, show, update, delete, help)
#   $2+: arguments spécifiques à la sous-commande
# Returns:
#   0 si succès ; 1 validation ; 2 erreur métier
# Side effects:
#   - Sourcing et appel de fonctions du module clients
#   - Affichage sur stdout/stderr
# Example:
#   clients_cmd create --slug "acme" --name "ACME Corp"
clients_cmd() {
  local sub="${1:-}"
  shift || true

  case "$sub" in
    create) clients_create "$@" ;;
    list)   clients_list "$@" ;;
    show)   clients_show "$@" ;;
    update) clients_update "$@" ;;
    delete) clients_delete "$@" ;;
    validate) clients_validate "$@" ;;
    ""|-h|--help)
      cat <<'TXT'
site-factory clients

Usage:
  site-factory clients create --slug <slug> --name <name> [--email <email>] [--phone <phone>]
  site-factory clients list [--json 1]
  site-factory clients show <id|slug>
  site-factory clients update <id|slug> [--slug <slug>] [--name <name>] [--email <email>] [--phone <phone>]
  site-factory clients delete <id|slug> --force
  site-factory clients delete --select 1 --force
  site-factpry clients validate --slug <slug>
TXT
      ;;
    *)
      emit error code=UNKNOWN_SUBCOMMAND message="Unknown clients subcommand" sub="$sub"
      return 2
      ;;
  esac
}
