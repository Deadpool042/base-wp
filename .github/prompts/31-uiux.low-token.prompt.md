STEP 31 — Implement capabilities registry + wiring

Goal:
Create a single source of truth "capabilities" used by the UI to know which services/toggles are allowed, based on:
- stack (wp only for now)
- hosting_type (mutualise|dedie)
- docker_profile (local|prodlike)
- stage (staging|production)

Constraints:
- No backend/API. Pure TS registry.
- ProjectView remains summary-only (no deploy action).
- Deploy page can read stage param and compute capabilities.

Tasks:
1) Add a capabilities registry file (e.g. apps/site-factory-ui/src/lib/capabilities.ts):
   - export type Stage = "staging"|"production"
   - export type HostingType = "mutualise"|"dedie"
   - export function normalizeStage(input?: string): Stage (maps "prod" => "production", default "staging")
   - export function getCapabilities(ctx): { services: { mail: {...}, redis: {...}, ... } }
   - Rules now:
     - mail: always available; provider toggle (mailpit vs external)
     - redis: only if stack="wp" AND hosting_type="dedie"
2) Update Services UI to rely ONLY on getCapabilities() to show/enable toggles.
3) Persist user choices locally (optional): keep existing state mechanism; do not invent new storage unless already present.
4) Add minimal tests or runtime asserts (optional) but keep small.
5) Keep env vars minimal: MAILPIT_ENABLED, REDIS_ENABLED.

Output:
- list modified/created files
- explain mapping rules succinctly