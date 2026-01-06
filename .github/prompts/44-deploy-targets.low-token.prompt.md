Apply 00-rules.agent.prompt.md strictly.

STEP 44 (low-token) — add deploy target adapter for mutualized:o2switch (shell only)

Create:
- lib/site-factory/modules/projects/deploy_targets/o2switch_mutualise.sh
  exports:
    projects_target_id -> mutualized:o2switch
    projects_target_hosting_type -> mutualise
    projects_target_supports_docker_runtime -> false
    projects_target_validate(stage, runtime_config_path) -> deterministic checks only
    projects_target_coerce(stage, runtime_config_path) -> emit NDJSON notes only (no secrets)

Create resolver:
- lib/site-factory/modules/projects/domain/deploy_targets.sh
  functions:
    projects_deploy_target_resolve(target) -> source adapter
    projects_deploy_target_assert_supported(target)

Wire in ONE place:
- env_generate.sh:
  read deploymentTarget from runtime_config.json
  resolve adapter
  call validate + coerce (emit notes)
  keep behavior/output unchanged

Tests:
- extend lib/tools/test-deploy-fixture.sh
  assert adapter resolution emits a note containing "mutualized:o2switch"
  keep asserts if-based (pipefail safe)

Output:
- list modified/created files
- 5-line summary