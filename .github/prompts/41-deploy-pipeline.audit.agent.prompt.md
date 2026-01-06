You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

Goal:
Audit and consolidate the existing Step 40 "deployment pipeline logic" deliverable.
Do NOT redesign UI. Do NOT change existing service rules. Do NOT add new profiles.

Context:
- DEV always uses Docker (local|prodlike).
- STAGING/PRODUCTION depend on hostingType:
  - mutualise: no Docker runtime in production hosting
  - dedie: Docker may be used (optional), but logic must support both
- UI already has 3 sections (Environment / Deployment / Services) and must remain unchanged.

Scope:
- Deployment logic only (shell/infra design + config shape).
- UI stays summary-only.
- No new services, no new rules, no new profiles.
- No backend/API; mark anything that would require backend as TODO only.

Tasks:
1) Extract the canonical flow that Step 40 defined:
   DEV → STAGING → PRODUCTION → UPDATE LOOP
   - Ensure steps are explicit, deterministic, and reproducible.
2) Normalize terminology and keys:
   - stage: staging|production (map prod => production)
   - hostingType: mutualise|dedie
   - dockerProfile: local|prodlike
   - dbMode: managed|autonomous (only where relevant)
3) Define how artifacts are handled per hostingType:
   - docker artifacts built in DEV (images, compose outputs, env templates)
   - reused in staging/prod when dedie supports docker
   - discarded/adapted when mutualise does not support docker
4) Define minimal deploy config (NO secrets):
   - What is reused from DEV config
   - What is overridden per stage (staging vs production)
   - What must remain empty and injected later (TODO secrets)
5) Produce a responsibilities split:
   - lib/site-factory (shell): source of truth, generation, packaging, deploy steps
   - UI: display summary only + stage selection only (already done)
   - future backend: only TODO markers, no implementation
6) Identify redundancy introduced by Step 40:
   - duplicated logic
   - conflicting naming
   - unclear boundaries
   - missing “single entrypoint” for deploy pipeline
7) Output a file-level refactor plan:
   - which new files to create
   - which existing files to edit
   - what functions/commands to introduce
   - where config files should live under projects/<client>/...

Constraints:
- Do NOT redesign UX.
- Do NOT reintroduce service rules.
- Do NOT invent new profiles.
- Prefer explicit steps over abstractions.
- Keep all steps compatible with mutualised hosting (no docker runtime assumption).

Deliverables:
- Textual deployment flow diagram (final canonical)
- Minimal config spec (keys + examples without secrets)
- Responsibilities split (UI vs lib vs TODO backend)
- File-level refactor plan (with exact paths)
- Explicit non-goals list

Output format:
1) Flow diagram
2) Config spec (YAML-like or JSON-like example)
3) Responsibilities split
4) Refactor plan (bulleted list with paths)
5) Non-goals