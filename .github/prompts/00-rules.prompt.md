# Site-Factory — Global Rules (Copilot)

## Objective
Refactor and stabilize Site-Factory project configuration + docker/dev/prodlike + deploy staging/prod,
with strict separation:
- DEV always uses Docker (local/prodlike)
- STAGING/PROD deploy depends on hosting type (mutualisé => no docker, VPS/dédié => docker allowed)

## Hard constraints
- Do NOT change behavior unless the prompt explicitly asks to implement features.
- Prefer small diffs, file-by-file.
- No new dependencies unless justified.
- Keep naming consistent with existing project structure.

## Output format
- If asked for code: provide precise diffs with file paths.
- If asked for spec: provide structures, responsibilities, algorithms, and list of files to change/create.

## Terminology
- "profile" = local | prodlike | staging | production
- "hostingType" = mutualise | dedie
- "hostingProvider" = o2switch | ovh | ... (for now implement o2switch only)
- "stack" = wp | next (next later, do not break future extensibility)
- "dbMode" = managed | autonomous (autonomous => docker service in dev, managed => no db container in prod)