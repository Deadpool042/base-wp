You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

Goal:
Implement the Step 41 refactor plan in lib/site-factory (shell only), without changing UI and without changing service rules.

Scope:
- lib/site-factory/modules/projects/** only
- NO UI changes
- NO new services
- NO backend/API
- Remote apply remains TODO only

Tasks:
1) Create: lib/site-factory/modules/projects/domain/deploy_terms.sh
   - projects_stage_normalize(input): staging|production (map prod => production, default staging)
   - projects_env_from_stage(stage): staging->staging, production->prod
   - projects_stage_from_env(env): prod->production, staging->staging
   - projects_hosting_type_from_target(target): mutualized:* => mutualise, vps:* => dedie

2) Create: lib/site-factory/modules/projects/domain/deploy_flow.sh
   - projects_deploy_flow_plan(slug, stage): emits NDJSON steps
   - projects_deploy_flow_assert_compatible(target, hostingType, stage): deterministic errors

3) Update existing deploy-related commands to use deploy_terms:
   - projects env generate: accept --stage (staging|production) in a non-breaking way (keep --env)
   - projects deploy: accept --stage and internally map to env
   - NDJSON events must include BOTH: stage and env (for clarity), but the logic must use stage as canonical.

4) Decide and implement ONE behavior:
   Option A (recommended): projects deploy ALWAYS calls projects env generate (even in dry-run) before packaging.
   - In dry-run: generate in-memory plan, do not write files.
   - In non-dry-run: generate files + artifact + upload
   (Do not implement remote apply.)

5) Ensure file conventions:
   - runtime_config.json stays in projects/<slug>/data/
   - artifacts in projects/<slug>/artifacts/<env>/
   - docker outputs in projects/<slug>/docker/ (DEV only)

Deliverables:
- Provide diffs only (unified diff)
- Short summary of changes
- List of new files created
Non-goals:
- No UI changes
- No capabilities/service rule changes
- No CI/CD
- No remote apply implementation
