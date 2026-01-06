#!/usr/bin/env bash
set -euo pipefail
# path_exists — Vérifie l'existence d'un chemin (fichier ou répertoire)
# Args:
#   $1: path
# Returns:
#   0 si existe ; 1 sinon
# Side effects: none
# Example:
#   path_exists "/etc/passwd" && echo "File exists"
path_exists() { [[ -e "$1" ]]; }

# is_file — Vérifie qu'un chemin est un fichier régulier
# Args:
#   $1: path
# Returns:
#   0 si fichier ; 1 sinon
# Side effects: none
# Example:
#   is_file "/etc/passwd" && echo "It's a file"
is_file()     { [[ -f "$1" ]]; }

# is_dir — Vérifie qu'un chemin est un répertoire
# Args:
#   $1: path
# Returns:
#   0 si répertoire ; 1 sinon
# Side effects: none
# Example:
#   is_dir "/etc" && echo "It's a directory"
is_dir()      { [[ -d "$1" ]]; }
