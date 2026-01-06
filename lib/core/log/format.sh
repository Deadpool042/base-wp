#!/usr/bin/env bash
set -euo pipefail
# log_info — Émet un message de type 'info' avec un contenu
# Args:
#   $1: message de log
# Returns:
#   0 toujours
# Side effects:
#   - Appelle emit pour afficher sur stdout
# Example:
#   log_info "Application démarrée"
log_info()  { emit info  "msg=$1"; }

# log_warn — Émet un message de type 'warn' avec un contenu
# Args:
#   $1: message de log
# Returns:
#   0 toujours
# Side effects:
#   - Appelle emit pour afficher sur stdout
# Example:
#   log_warn "Checkpoint non trouvé, création par défaut"
log_warn()  { emit warn  "msg=$1"; }

# log_error — Émet un message de type 'error' avec un contenu
# Args:
#   $1: message de log
# Returns:
#   0 toujours
# Side effects:
#   - Appelle emit pour afficher sur stdout
# Example:
#   log_error "Impossible de lire le fichier"
log_error() { emit error "msg=$1"; }
