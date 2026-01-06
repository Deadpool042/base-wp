You are a refactor agent. Follow this plan exactly and do not expand scope.

PLAN:
A) Create capabilities registry (single file) with:
   - normalizeStage()
   - getCapabilities(ctx)
   - deterministic rules (no IO, no fetch)
B) Integrate registry into:
   - ProjectView Services section
   - Deploy page preselection (stage)
C) Remove dead code paths related to old inline service rules (only if safe).
D) Keep types strict and readable.

RULES:
- No new deps.
- No backend/API.
- Do not modify UX structure (3 sections).
- Use only staging|production. Map prod => production.
- Redis allowed only for wp + dedie.
- Mail always allowed. Provider is a toggle (mailpit vs external).

DELIVERABLE:
- Provide diffs only + short summary.