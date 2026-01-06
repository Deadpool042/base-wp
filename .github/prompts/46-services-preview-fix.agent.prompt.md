# 44-services-preview-fix.agent.prompt.md

You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

Goal:
Fix Project "view preview" inconsistencies AND extend the services catalog (capabilities-driven) without changing the existing 3-sections UX.

Symptoms to fix (must reproduce mentally from code, no guesswork):
1) In Project View preview, selecting "local / mutualisé / o2switch / mailpit" does NOT generate the expected env + docker preview outputs.
2) Redis is shown/enabled too often (appears even when it makes no sense, e.g. mutualisé o2switch).
3) Services list is incomplete: only Mail exists, but we need a predefined catalog (ex: Redis, Grafana, Loki, etc.) displayed conditionally by capabilities.

Non-goals:
- Do NOT redesign UI/UX structure (keep: Environment (DEV) / Deployment (summary) / Services).
- Do NOT add backend/API, do NOT change CLI deploy logic.
- Do NOT add new dependencies.
- Do NOT reintroduce scattered service rules in components: capabilities registry remains single source of truth.

Scope:
- apps/site-factory-ui only (UI + API routes already present).
- lib/site-factory untouched for this step.

Tasks:

A) Fix deploymentTarget mapping (ROOT CAUSE of wrong preview)
- Ensure UI <-> runtime_config deploymentTarget is canonical and matches CLI expectations.
- Canonical values MUST be:
  - "mutualized:o2switch" for o2switch mutualisé
  - "vps:ovh" for OVH VPS (dedicated)
- Locate where Project View computes target (likely computedTarget / hoster+hostingType mapping).
- Implement deterministic mapping:
  - if provider=o2switch AND hostingType=mutualise => deploymentTarget="mutualized:o2switch"
  - if provider=ovh AND hostingType=dedie => deploymentTarget="vps:ovh"
  - refuse/guard invalid combos (show warning in preview result, no crash)
- Ensure the preview requests (runtime_config POST + preview endpoints) use the canonical deploymentTarget.
- Validate: selecting o2switch mutualisé must trigger the coerce rules already present (staging/prod db/mail managed/smtp) but local remains docker+mailpit if chosen.

B) Remove hardcoded capability context in ProjectViewShell
- ProjectViewShell currently builds capabilities ctx with hardcoded stack/hostingType (or defaults).
- Replace it by values coming from ProjectViewContext state:
  - stack (wp/wp-headless/next where applicable)
  - hostingType (mutualise/dedie)
  - dockerProfile (local/prodlike)
  - stage only if needed for summary
- Result: Redis visibility must correctly follow hostingType. No more “always redis”.

C) Extend services catalog (capabilities registry)
- Keep capabilities as single source of truth: apps/site-factory-ui/src/lib/capabilities.ts
- Add a predefined catalog with at least:
  - mail (mailpit vs external provider toggle)
  - redis
  - grafana
  - loki
  - (optional) promtail (or “log shipper”) if it’s already in docker fragments; otherwise add as disabled-only stub
- For each service define:
  - id
  - purpose (short)
  - minimal env vars (as strings, not secrets)
  - visible/allowed flags from getCapabilities(ctx)
- Rules (strict, deterministic):
  - mail: always visible/allowed (provider toggle)
  - redis: allowed ONLY if stack starts with "wp" AND hostingType="dedie"
  - grafana + loki: allowed ONLY in DEV dockerProfile="prodlike" (never on mutualisé deploy), and only when docker is used (DEV always docker)
  - keep these rules in ONE place (capabilities.ts)
- Update Services UI to render cards for all catalog services but only show toggles when visible=true.
  - If not visible: do not render the card at all (no clutter).
  - If visible but not allowed: render card disabled with reason.

D) Preview outputs alignment
- Ensure the preview shown in Project View reflects what the current config WOULD generate:
  - docker files preview depends on dockerProfile + DEV
  - env preview depends on selected providers (mailpit/smtp) and target coercions
- Do not add new preview endpoints: reuse existing calls.
- Fix any mismatch between:
  - UI selection
  - runtime_config.json written by /api/projects/runtime POST
  - preview plan returned by preview endpoints

Deliverables:
1) Diffs only (file-by-file).
2) Short summary explaining:
   - the root cause for wrong preview (deploymentTarget mapping / hardcoded ctx)
   - the new services catalog rules
3) List of files changed/added.

Quality gates:
- TypeScript strict: no any, no widening.
- No duplicate business rules outside capabilities.ts.
- No UX changes besides fixing wrong visibility and adding new service cards conditionally.