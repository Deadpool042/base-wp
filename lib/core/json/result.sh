#!/usr/bin/env bash
set -euo pipefail

# sf_json_ok — JSON "envelope" succès
# Args:
#   $1: data (JSON) optionnel, défaut null
#   $2: meta (JSON) optionnel, défaut null
sf_json_ok() {
  require_jq || return 127
  local data="${1:-null}"
  local meta="${2:-null}"

  jq -n \
    --argjson data "$data" \
    --argjson meta "$meta" \
    '{ok:true,data:$data,meta:$meta}'
}

# sf_json_err — JSON "envelope" erreur
# Args:
#   $1: code (string)
#   $2: message (string)
#   $3: details (JSON) optionnel, défaut null
sf_json_err() {
  require_jq || return 127
  local code="${1:-ERROR}"
  local message="${2:-error}"
  local details="${3:-null}"

  jq -n \
    --arg code "$code" \
    --arg message "$message" \
    --argjson details "$details" \
    '{ok:false,error:{code:$code,message:$message,details:$details}}'
}