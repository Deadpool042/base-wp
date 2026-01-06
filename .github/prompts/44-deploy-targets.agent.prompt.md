You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

STEP 44 — Deploy targets (mutualisé vs dédié) as adapters (shell only)

Goal:
Introduce a small, deterministic "deploy target adapter" layer so deploy logic does NOT hardcode provider rules in deploy.sh/env_generate.sh.
Keep current behavior identical (no functional change), just refactor to make it scalable.

Context (already done):
- stage is canonical: staging|production, env derived (staging|prod).
- projects deploy Option A calls projects env generate first.
- fixtures symlink is stable and tests exist.

Scope:
- Shell only: lib/site-factory/**
- No UI changes.
- No new services rules (capabilities stays in UI only).
- No CI/CD.
- No secrets storage.
- No remote "apply" implementation.

Tasks:
1) Create a "deploy target adapter" folder:
   lib/site-factory/modules/projects/deploy_targets/

2) Add adapter for mutualized:o2switch:
   File: lib/site-factory/modules/projects/deploy_targets/o2switch_mutualise.sh
   Responsibilities (pure functions):
   - projects_target_id() -> "mutualized:o2switch"
   - projects_target_hosting_type() -> "mutualise"
   - projects_target_supports_docker_runtime() -> false
   - projects_target_coerce_runtime_config(stage, runtime_config_json_path) -> emits deterministic "coerce" notes ONLY (no secrets)
     * Example: enforce mail provider to smtp for staging/prod if current config says mailpit (emit warn+coerce note)
     * Example: enforce dbMode to managed if deploymentTarget is mutualized:o2switch
   - projects_target_validate(stage, runtime_config_json_path) -> errors if impossible combo (deterministic)

   IMPORTANT:
   - Do not implement remote apply
   - Coercions must be visible via NDJSON notes (emit plan/step with kind=coerce or note)
   - Do not mutate files if --dry-run is used upstream (deploy already early-exits after env generate)

3) Add a minimal target resolver (single entrypoint):
   File: lib/site-factory/modules/projects/domain/deploy_targets.sh
   - projects_deploy_target_normalize(input) -> canonical string (keep existing format)
   - projects_deploy_target_resolve(target) -> sources the right adapter file
   - projects_deploy_target_assert_supported(target) -> nice error if unknown

4) Wire adapters in exactly ONE place:
   Prefer: inside projects env generate (where coercion/validation already happens),
   so deploy.sh stays orchestration-only.

   Concretely:
   - env_generate.sh:
     * resolve adapter from runtime_config.json deploymentTarget
     * call adapter validate + coerce (emit notes)
     * keep existing outputs unchanged

5) Add/extend tests:
   - Extend lib/tools/test-deploy-fixture.sh to assert:
     * adapter resolution occurs (grep an NDJSON note like targetId or "coerce")
     * mutualized:o2switch marks docker runtime unsupported (note only)
   Tests must be set -euo pipefail safe (if-based asserts).

Deliverables:
- Diffs only
- Short summary
- No extra refactors
- No behavior changes (same outputs for existing fixtures)