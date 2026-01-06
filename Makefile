SHELL := /bin/bash

# --------------------------------------------------
# Site Factory – Infra / Tooling Makefile
# --------------------------------------------------

# ✅ Uniquement les scripts versionnés sous lib/
SHELL_GLOBS := ':(glob)lib/**/*.sh' ':(glob)lib/**/*.bash' ':(glob)lib/**/*.zsh'

# Helper: liste NUL-separated (robuste espaces)
SHELL_FILES_Z := git ls-files -z -- $(SHELL_GLOBS)

# Helper: liste “human” (debug/menu éventuel)
SHELL_FILES := $(shell git ls-files -- $(SHELL_GLOBS))

.PHONY: help menu \
	doc-sh doc-env doc-meta audit-shell \
	shell-fmt shell-check shell-check-style shell-watch shell-check-watch shell-check-style-watch \
	dev-shared dev-ui dev-all \
	test-deploy-fixture

help: menu

menu:
	@echo "📚 Site Factory – Commandes disponibles"
	@echo "----------------------------------------"
	@echo ""
	@echo "📖 Documentation (Copilot Chat)"
	@echo "----------------------------------------"
	@echo " make doc-sh                 👉 Doc pour scripts Bash"
	@echo " make doc-env                👉 Doc pour fichiers .env"
	@echo " make doc-meta               👉 Doc pour meta.json"
	@echo ""
	@echo "🔍 Audit / Qualité Shell (lib/ uniquement)"
	@echo "----------------------------------------"
	@echo " make shell-fmt              👉 shfmt (one-shot) [lib/]"
	@echo " make shell-check            👉 shellcheck (warning) [lib/]"
	@echo " make shell-check-style      👉 shellcheck (style) [lib/]"
	@echo " make shell-watch            👉 shfmt (watch) [lib/]"
	@echo " make shell-check-watch      👉 shellcheck warning (watch) [lib/]"
	@echo " make shell-check-style-watch👉 shellcheck style (watch) [lib/]"
	@echo ""
	@echo "🚀 Dev"
	@echo "----------------------------------------"
	@echo " make dev-shared             👉 Shared build:watch"
	@echo " make dev-ui                 👉 UI dev"
	@echo " make dev-all                👉 Shared + UI (parallèle)"
	@echo ""
	@echo " make help                   👉 Afficher ce menu"
	@echo "----------------------------------------"

doc-sh:
	@echo "👉 Sélectionne du code Bash puis Copilot Chat : /docsh"

doc-env:
	@echo "👉 Sélectionne un fichier .env puis Copilot Chat : /docenv"

doc-meta:
	@echo "👉 Sélectionne meta.json puis Copilot Chat : /docmeta"

audit-shell:
	@echo "👉 Sélectionne un script Bash puis Copilot Chat : /auditshell"

shell-fmt:
	@command -v shfmt >/dev/null 2>&1 || { echo "❌ shfmt manquant (brew install shfmt)"; exit 1; }
	@$(SHELL_FILES_Z) | xargs -0 -r shfmt -w -i 2 -ci -sr

shell-check:
	@command -v shellcheck >/dev/null 2>&1 || { echo "❌ shellcheck manquant (brew install shellcheck)"; exit 1; }
	@$(SHELL_FILES_Z) | xargs -0 -r shellcheck -x -S warning -s bash

shell-check-style:
	@command -v shellcheck >/dev/null 2>&1 || { echo "❌ shellcheck manquant (brew install shellcheck)"; exit 1; }
	@$(SHELL_FILES_Z) | xargs -0 -r shellcheck -x -S style -s bash

shell-watch:
	@command -v watchexec >/dev/null 2>&1 || { echo "❌ watchexec manquant (brew install watchexec)"; exit 1; }
	@watchexec -e sh,bash,zsh \
		--watch lib \
		--ignore .git \
		--ignore .vscode \
		-- lib/tools/shfmt-watch.sh

shell-check-watch:
	@command -v watchexec >/dev/null 2>&1 || { echo "❌ watchexec manquant (brew install watchexec)"; exit 1; }
	@watchexec -e sh,bash,zsh \
		--watch lib \
		--ignore .git \
		--ignore .vscode \
		-- env SHELLCHECK_SEVERITY=warning lib/tools/shellcheck-watch.sh

shell-check-style-watch:
	@command -v watchexec >/dev/null 2>&1 || { echo "❌ watchexec manquant (brew install watchexec)"; exit 1; }
	@watchexec -e sh,bash,zsh \
		--watch lib \
		--ignore .git \
		--ignore .vscode \
		-- env SHELLCHECK_SEVERITY=style lib/tools/shellcheck-watch.sh

dev-shared:
	@pnpm --filter @sf/shared build:watch

dev-ui:
	@pnpm --filter site-factory-ui dev

dev-all:
	@echo "🚀 Démarrage dev shared + ui"
	@pnpm --filter @sf/shared build:watch & \
	pnpm --filter site-factory-ui dev & \
	wait

test-deploy-fixture:
	@lib/tools/test-deploy-fixture.sh