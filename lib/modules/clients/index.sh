#!/usr/bin/env bash
# /lib/modules/clients/index.sh
set -euo pipefail

# domain
 sf_require_source "modules/clients/domain/model.sh"
 sf_require_source "modules/clients/domain/validate_json.sh"

# infra
sf_require_source "modules/clients/repo/clients_repo.sh"

# usecases
sf_require_source "modules/clients/usecases/resolve.sh"
sf_require_source "modules/clients/usecases/create.sh"
sf_require_source "modules/clients/usecases/list.sh"
sf_require_source "modules/clients/usecases/show.sh"
sf_require_source "modules/clients/usecases/update.sh"
sf_require_source "modules/clients/usecases/delete.sh"
sf_require_source "modules/clients/usecases/validate.sh"