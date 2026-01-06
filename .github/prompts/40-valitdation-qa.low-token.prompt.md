You are in AGENT MODE.
Apply 00-rules.agent.prompt.md strictly.

Goal:
Define and refactor the deployment pipeline logic without changing existing UI or service rules.

Context:
- DEV always uses Docker (local or prodlike).
- Production hosting may NOT support Docker (e.g. mutualised hosting).
- The UI already separates:
  - Environment (DEV)
  - Deployment (STAGING / PRODUCTION)
  - Services (capabilities-driven)

Scope:
- Deployment logic only.
- No UI refactor.
- No new services.
- No backend/API unless explicitly required.

Tasks:
1) Define the canonical deployment flow:
   DEV → STAGING → PRODUCTION → UPDATE LOOP
2) Specify how Docker artifacts are:
   - built
   - reused
   - adapted (or discarded) depending on hostingType
3) Formalize differences between:
   - mutualise vs dedie
   - staging vs production
4) Define minimal config needed for deploy (no secrets):
   - what is reused from DEV
   - what is overridden per stage
5) Identify which parts should live in:
   - lib/site-factory (shell / infra)
   - UI (summary only)
   - future backend (marked as TODO only)

Constraints:
- Do NOT redesign UX.
- Do NOT reintroduce service rules.
- Do NOT invent new profiles.
- Prefer explicit steps over abstractions.

Deliverables:
- Clear deployment flow diagram (textual)
- Responsibilities split (dev / staging / prod)
- File-level refactor plan (what changes, where)
- Explicit non-goals