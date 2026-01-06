You are in AGENT MODE.
Goal: refactor the UI/UX of the page:
projects/(project)/client/site/view
It is currently too "brouillon".

## UX target
Split responsibilities into clear sections, progressive disclosure:

1) Environment (DEV)
- Always docker (local/prodlike)
- Choose profile: local | prodlike
- Show allowed services (based on capabilities)

2) Deployment (STAGING/PROD)
- Choose hostingType: mutualise | dedie
- Choose hostingProvider: o2switch (only for now)
- Choose dbMode: managed | autonomous
- Show what will be deployed and how (no docker on mutualisé)
- Choose stage: staging | production

3) Services
- Show toggles only for allowed services
- Mail: mailpit by default, can switch to provider (SMTP/cPanel/etc)
- Each service must display: purpose, required env vars, status (enabled/disabled)

## Behavior constraints
- Conditional fields:
  - WP projects: do not show Next-specific fields (unless later "headless" is enabled)
- Enforce required fields in UI + validate on backend.

## Deliverables
- New UI structure (component breakdown)
- Data model (what config is read/written)
- Interaction flow (user steps)
- Minimal refactor plan (files to change)
- No code unless explicitly requested at the end.