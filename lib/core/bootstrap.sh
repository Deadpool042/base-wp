#!/usr/bin/env bash
# /lib/core/bootstrap.sh
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
: "${SF_ROOT:="$(cd "$HERE/.." && pwd)"}"
export SF_ROOT

DATA_DIR="$SF_ROOT/data"
INDEX_DIR="$SF_ROOT/indexes"
TMP_DIR="${TMP_DIR:-$SF_ROOT/.tmp}"

mkdir -p "$DATA_DIR" "$INDEX_DIR" "$TMP_DIR"

# shellcheck source=fs/source.sh
source "$SF_ROOT/core/fs/source.sh"

#args
sf_require_source "core/args/parse.sh"

#logs
sf_require_source "core/log/emit.sh"
sf_require_source "core/log/format.sh"

#fs
sf_require_source "core/fs/atomic.sh"
sf_require_source "core/fs/path.sh"

#json
sf_require_source "core/json/jq.sh"
sf_require_source "core/json/result.sh"

#select
sf_require_source "core/select/select.sh"

#strings
sf_require_source "core/strings/slug.sh"
sf_require_source "core/strings/uuid.sh"

#time
sf_require_source "core/time/now.sh"

#validate
sf_require_source "core/validate/require.sh"
sf_require_source "core/validate/ids.sh"