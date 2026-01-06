LOW-TOKEN MODE.
Implement the plan with minimal text, maximal diffs.

## Scope
Implement:
1) services registry (minimal)
2) resolveCapabilities()
3) docker compose generation for DEV (local + prodlike)
4) deploy pipeline for o2switch mutualisé (staging + prod)
5) integrate into existing CLI commands (projects/client view flow)

Do NOT redesign UI deeply here, only expose required config fields and write files.

## Rules
- Keep diffs small and readable.
- Do not introduce eval in bash.
- Keep shellcheck clean (or annotate with minimal disables).
- Ensure set -euo pipefail compatibility.

## Expected outputs
- Diff blocks per file
- New files content
- Updated commands usage examples:
  - site-factory projects configure ...
  - site-factory projects docker generate ...
  - site-factory projects deploy staging ...
  - site-factory projects deploy prod ...

## Notes
- For o2switch mutualisé: deploy should produce an artifact + upload strategy (rsync/ssh if available; fallback to sftp).
- SSL in dev: provide a local reverse proxy option (traefik or caddy) in prodlike profile only.