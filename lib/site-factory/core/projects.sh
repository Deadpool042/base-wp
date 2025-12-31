#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=./sanitize.sh
source "$(dirname "${BASH_SOURCE[0]}")/sanitize.sh"
# shellcheck source=./config.sh
source "$(dirname "${BASH_SOURCE[0]}")/config.sh"
# shellcheck source=./emit.sh
source "$(dirname "${BASH_SOURCE[0]}")/emit.sh"
# shellcheck source=./fs.sh
source "$(dirname "${BASH_SOURCE[0]}")/fs.sh"

meta_get_id() {
  local meta_file="$1"
  [[ -f "$meta_file" ]] || { echo ""; return 0; }

  local id

  # 1) Nouveau schéma : meta.id
  id="$(sed -nE 's/^[[:space:]]*"id"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$meta_file" \
        | head -n 1)"

  # 2) Ancien schéma plat (fallback)
  if [[ -z "$id" ]]; then
    id="$(sed -nE 's/.*"id"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$meta_file" \
          | head -n 1)"
  fi

  echo "$id"
}

# json_escape() {
#   local s="${1:-}"
#   s="${s//\\/\\\\}"
#   s="${s//\"/\\\"}"
#   s="${s//$'\n'/\\n}"
#   printf '%s' "$s"
# }

projects_list() {
  mkdirp "$PROJECTS_DIR"
  mkdirp "$ARCHIVE_DIR"

  if [[ "$FORMAT" == "ndjson" ]]; then
    emit start op=projects.list
  fi

  local count=0

  # expects: projects/<client>/<site>/
  # find depth 2 directories
  while IFS= read -r rel; do
    [[ -z "$rel" ]] && continue

    local client site slug
    client="${rel%%/*}"
    site="${rel##*/}"
    slug="$client/$site"
    local meta_file id
    meta_file="$PROJECTS_DIR/$client/$site/data/project_meta.json"
    id="$(meta_get_id "$meta_file")"
    # Mode strict : pas d'id => on ignore le projet
    [[ -n "$id" ]] || continue


    count=$((count + 1))

    if [[ "$FORMAT" == "ndjson" ]]; then
      emit project id="$id" slug="$slug" client="$client" site="$site"
    else
      printf '%s\n' "$slug"
    fi
  done < <(
    (cd "$PROJECTS_DIR" && find . -mindepth 2 -maxdepth 2 -type d -print 2>/dev/null) \
      | sed -E 's|^\./||' \
      | sort
  )

  if [[ "$FORMAT" == "ndjson" ]]; then
    emit done ok=true count="$count"
  fi
}

projects_create() {
  local project_id
if command -v uuidgen >/dev/null 2>&1; then
  project_id="$(uuidgen | tr '[:upper:]' '[:lower:]')"
else
  project_id="$(openssl rand -hex 16)"
fi
  local client_raw="${1:-}"
  local site_raw="${2:-}"

  [[ -n "$client_raw" && -n "$site_raw" ]] || {
    emit error code=VALIDATION message="Missing client or site"
    return 1
  }

  local client site
  client="$(require_safe_slug "$client_raw")" || { emit error code=VALIDATION message="Invalid client"; return 1; }
  site="$(require_safe_slug "$site_raw")"     || { emit error code=VALIDATION message="Invalid site"; return 1; }

  local p="$PROJECTS_DIR/$client/$site"

  if [[ -e "$p" ]]; then
    emit error code=ALREADY_EXISTS message="Project already exists" slug="$client/$site"
    return 1
  fi

emit start op=projects.create client="$client" site="$site" id="$project_id"

  mkdirp "$p/env"
  mkdirp "$p/certs"
  mkdirp "$p/data"
  mkdirp "$p/logs"
  mkdirp "$p/tmp"

  local now meta
  now="$(date -Iseconds)"
meta=$(
  cat <<JSON
{
  "schema_version": 1,
  "meta": {
    "id": "$project_id",
    "created_at": "$now",
    "updated_at": "$now"
  },
  "identity": {
    "client": "$client",
    "site_name": "$site"
  },
  "params": {
    "slug": "$client/$site"
  }
}
JSON
)

  atomic_write "$p/data/project_meta.json" "$meta"

  emit created id="$project_id" slug="$client/$site" path="$p"
  emit done ok=true
}

projects_show() {
  local slug_raw="${1:-}"
  [[ -n "$slug_raw" ]] || { emit error code=VALIDATION message="Missing slug (client/site)"; return 1; }

  # slug attendu: client/site
  if [[ "$slug_raw" != */* ]]; then
    emit error code=VALIDATION message="Invalid slug format, expected client/site"
    return 1
  fi

  local client site
  client="${slug_raw%%/*}"
  site="${slug_raw##*/}"

  # sécurité: on passe par require_safe_slug
  client="$(require_safe_slug "$client")" || { emit error code=VALIDATION message="Invalid client"; return 1; }
  site="$(require_safe_slug "$site")"     || { emit error code=VALIDATION message="Invalid site"; return 1; }

  local p="$PROJECTS_DIR/$client/$site"
  local meta_file="$p/data/project_meta.json"

  emit start op=projects.show slug="$client/$site"

  [[ -f "$meta_file" ]] || { emit error code=NOT_FOUND message="project_meta.json not found" slug="$client/$site"; return 1; }

  # id obligatoire dans ton mode strict
  local id
  id="$(meta_get_id "$meta_file")"
  [[ -n "$id" ]] || { emit error code=INVALID_META message="Missing id in project_meta.json" slug="$client/$site"; return 1; }

  local raw
  raw="$(cat "$meta_file")"
  # raw_escaped="$(json_escape "$raw")"

  emit meta id="$id" slug="$client/$site" meta_file="$meta_file"
  emit done ok=true
}