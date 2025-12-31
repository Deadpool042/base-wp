SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRUD_DIR="$SCRIPT_DIR/crud"

# shellcheck source=/dev/null
source "$CRUD_DIR/project.create.sh"
# shellcheck source=/dev/null
source "$CRUD_DIR/project.edit.sh"
# shellcheck source=/dev/null
source "$CRUD_DIR/project.delete.sh"
# shellcheck source=/dev/null
source "$CRUD_DIR/project.rename_client.sh"

# API publique appelée par basewp-project
project_list_projects()   { project_list; }
project_pick_project()    { project_pick; }

project_create_project()  { project_wizard_create; }
project_edit_project()    { project_wizard_edit; }
project_delete_project()  { project_wizard_delete; }