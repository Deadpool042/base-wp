# 43-fixtures-symlink.low-token.prompt.md

Apply 00-rules.agent.prompt.md strictly.

Goal:
Make fixtures usable everywhere by ensuring a stable path:
lib/site-factory/projects/fixtures -> lib/site-factory/projects/_fixtures
Do NOT rename folders. Keep the symlink approach.

Scope:
- Shell only (lib/site-factory + lib/tools)
- No UI changes.
- No behavior changes in deploy logic.
- Idempotent + safe with set -euo pipefail.

Tasks:
1) Add a small helper function (in core/fs.sh or core/path.sh) OR a dedicated tool script:
   - ensure_fixtures_symlink()
   - Creates lib/site-factory/projects/_fixtures if missing.
   - Creates symlink lib/site-factory/projects/fixtures pointing to _fixtures if missing.
   - If fixtures exists and is NOT a symlink, do NOT overwrite; emit a warning and exit non-zero.

2) Wire it in ONE place:
   Option A: call ensure_fixtures_symlink from core/bootstrap.sh
   Option B: call it from lib/tools/test-deploy-fixture.sh before running tests
Pick the safest minimal integration (prefer bootstrap if already executed by CLI startup).

3) Update docs minimally (README or a short comment) so new dev machines understand why fixtures is a symlink.

Deliverables:
- Diffs only.
- Short summary (what changed + why).
- No extra refactors.