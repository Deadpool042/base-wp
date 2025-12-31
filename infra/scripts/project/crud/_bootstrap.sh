#!/usr/bin/env bash
set -euo pipefail

CRUD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$CRUD_DIR/.." && pwd)"              # infra/scripts/project
SCRIPTS_DIR="$(cd "$PROJECT_DIR/.." && pwd)"           # infra/scripts

# shared
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/log.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/ui.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/strings.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/validate.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/fs.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/env.sh"
# shellcheck source=/dev/null
source "$SCRIPTS_DIR/shared/context.sh"

# project modules
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.context.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.list.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.meta.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.env.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.hosts.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.certs.sh"
# shellcheck source=/dev/null
source "$PROJECT_DIR/project.prompts.sh"