# 45-deploy-targets-vps-ovh.stub.agent.prompt.md

You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

STEP 45 — Add VPS OVH deploy target adapter (STUB) + deterministic errors (shell only)

Goal:
Add a second deploy target adapter for VPS OVH, but keep it as a stub:
- no remote apply
- no new behavior
- just centralize validation + capability flags
This makes the deploy target system scalable without touching UI.

Context:
- Step 44 introduced deploy target adapters + resolver + wiring in env_generate.sh.
- stage is canonical (staging|production) and env is derived (staging|prod).
- projects deploy Option A calls projects env generate before packaging.
- Existing behavior: vps:ovh may return NOT_IMPLEMENTED. Keep that.

Scope:
- Shell only: lib/site-factory/** and lib/tools/**
- No UI changes.
- No new services rules.
- No CI/CD.
- No secrets storage or injection.
- No remote apply implementation.

Tasks:
1) Create OVH VPS adapter:
   File: lib/site-factory/modules/projects/deploy_targets/ovh_vps.sh

   It must expose the same adapter API as Step 44:
   - projects_target_id() -> "vps:ovh"
   - projects_target_hosting_type() -> "dedie"
   - projects_target_supports_docker_runtime() -> true

   - projects_target_validate(stage, runtime_config_json_path):
       * must be deterministic
       * if any required deploy inputs for VPS are missing in runtime_config.json, emit a clear error code=VALIDATION
       * MUST NOT check secrets
       * MUST NOT do network/IO except reading runtime_config.json

   - projects_target_coerce(stage, runtime_config_json_path):
       * emit NDJSON notes only (no file mutation)
       * example notes: "VPS target supports docker runtime", "dbMode autonomous allowed"
       * do NOT add new rules beyond notes (avoid changing behavior)

2) Update resolver mapping:
   File: lib/site-factory/modules/projects/domain/deploy_targets.sh
   - Ensure projects_deploy_target_resolve("vps:ovh") sources ovh_vps.sh
   - Keep unknown target behavior unchanged (nice error)

3) Centralize "NOT_IMPLEMENTED" for VPS deploy (without changing behavior):
   Currently deploy may fail later with NOT_IMPLEMENTED.
   Make it explicit and deterministic in ONE place:
   - Prefer inside deploy.sh right after env_generate succeeds:
       * if target supports docker runtime AND we do not implement VPS remote apply,
         emit error code=NOT_IMPLEMENTED message="VPS deploy apply not implemented yet"
         (only when not --dry-run? preserve current semantics)
   Rules:
   - Do not break mutualized:o2switch path.
   - Do not break existing --dry-run behavior (still early exit after env_generate, no packaging/upload).
   - If current behavior already errors for vps:ovh even in dry-run, keep it identical.
     If dry-run currently passes until early exit, keep it passing.

   IMPORTANT:
   - Do NOT implement remote apply or docker push.
   - Just make the error come from a single, predictable place.

4) Tests:
   Extend lib/tools/test-deploy-fixture.sh:
   - Add a fixture slug for VPS (create a minimal fixture runtime_config.json under _fixtures if needed).
   - Assert resolver emits an NDJSON note containing "vps:ovh".
   - Assert the expected NOT_IMPLEMENTED behavior is unchanged (match on NDJSON code/message).
   - Tests must be set -euo pipefail safe (if-based asserts, no fragile pipes).

Deliverables:
- Diffs only.
- Short summary (what changed + why).
- Explicit confirmation: no behavior changes (except clearer/earlier deterministic NOT_IMPLEMENTED if it matches prior behavior).
- No extra refactors.