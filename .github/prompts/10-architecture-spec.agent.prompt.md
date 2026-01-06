You are in AGENT MODE.
You must produce a complete architecture SPEC + plan, before any code.

## Context
We have a CLI "site-factory" with bash modules. We already generate:
- client_meta.json
- environment_meta.json
- site_config_meta.json
We also have schemas under lib/site-factory/schemas.

We want a robust, scalable system to prepare docker/dev, and deploy staging/prod depending on hosting.

## Goal (end state)
We support a workflow:
1) DEV: Generate Docker config for local/prodlike with easy switches (mailpit vs real SMTP provider, etc.)
2) STAGING: Deploy online for testing
3) PROD: Deploy online
4) Update flow: pull project locally, update, re-deploy staging then prod

Mutualisé hosting (e.g. o2switch):
- DEV uses docker
- STAGING/PROD does NOT use docker (rsync/ssh/ftp/git+composer/wp-cli etc depending constraints)

VPS/dédié:
- DEV uses docker
- STAGING/PROD may use docker-based deploy

## Deliverables
A) Define the canonical configuration model:
- Where do we store stack/hosting/profile selections?
- Which meta file contains what?
- Versioning strategy
- Required fields vs optional fields (UI will enforce required too)

B) Define "capabilities resolution":
- A deterministic function resolveCapabilities(stack, hostingType, hostingProvider, dbMode, profile)
- Output: allowed services + forbidden services + required services
- Explain rules clearly

C) Define services registry:
- List a minimal set now: mail (mailpit/smtp), db (mariadb), redis, grafana, loki, traefik/caddy (ssl)
- Explain how to add services later without breaking backward compatibility

D) Define docker generation strategy:
- Compose base + overlays? (compose.yml + compose.prodlike.yml)
- File locations inside project
- How profile selects overlays

E) Define deploy strategy:
- staging/prod per hostingType/provider
- for now implement "o2switch mutualisé" pathway only (staging+prod)
- describe scripts + inputs + outputs

F) Provide the exact list of files to create/modify (paths must match repository)
- No code yet, only a plan.

## Constraints
- Do NOT ask questions. If missing info, make minimal assumptions and label them as:
  ASSUMPTION: ...
- Keep the spec implementable in bash + json.
- Ensure future extension to Next.js is possible, but do not implement Next now.

## Output format
1) SPEC (sections A-F)
2) FILE PLAN (create/modify list)
3) TASK LIST (ordered steps, small PR-friendly)