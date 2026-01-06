#!/usr/bin/env bash
set -euo pipefail

# now_utc — Retourne le timestamp actuel en ISO-8601 UTC
# Args: none
# Returns:
#   0 toujours
# Side effects:
#   - Affiche la date/heure courante sur stdout
# Example:
#   ts="$(now_utc)"  => "2025-01-05T14:30:45Z"
now_utc() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
