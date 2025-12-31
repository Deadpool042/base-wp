SHELL := /bin/bash

# --------------------------------------------------
# Base WP – Infra Makefile
# --------------------------------------------------

.PHONY: help menu up down restart ps logs wp install reset open mailpit check \
        build-wp rebuild-wp doctor clean \
        host-add host-rm certs certs-clean \
        project project-list project-edit \
				docsh docenv docmeta auditshell

help:
	@echo "Base WP – Infra commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  help         Show this help"
	@echo "  menu         Open interactive infra menu (fzf)"
	@echo "  check        Run infra diagnostics"
	@echo ""
	@echo "Project management:"
	@echo "  project       Open project menu (fzf)"
	@echo "  project-list  List available projects"
	@echo "  project-edit  Edit a project (fzf)"
	@echo ""
	@echo "Infra:"
	@echo "  up           Start infrastructure"
	@echo "  down         Stop infrastructure"
	@echo "  restart      Restart infrastructure"
	@echo "  ps           Show services status"
	@echo "  logs         Show logs (interactive)"
	@echo ""
	@echo "WordPress:"
	@echo "  wp           WP-CLI interactive menu"
	@echo "  install      Install WordPress (core install)"
	@echo ""
	@echo "Images/diagnostic:"
	@echo "  build-wp     Build WordPress image"
	@echo "  rebuild-wp   Rebuild WordPress image (no-cache)"
	@echo "  doctor       Print versions/diagnostics"
	@echo "  clean        Clean project containers/volumes"
	@echo ""
	@echo "Local TLS / hosts:"
	@echo "  host-add     Add project domains to /etc/hosts"
	@echo "  host-rm      Remove project domains from /etc/hosts"
	@echo "  certs        Ensure local SSL certificates"
	@echo "  certs-clean  Remove local SSL certificates"
	@echo ""
	@echo "Convenience:"
	@echo "  open         Open WordPress in browser"
	@echo "  mailpit      Open Mailpit in browser"
	@echo ""
	@echo "Code documentation with Copilot Chat:"
	@echo "  docsh        Documenter du code Bash avec Copilot Chat"
	@echo "  docenv       Documenter un fichier .env avec Copilot Chat"
	@echo "  docmeta      Documenter un fichier meta.json avec Copilot Chat"
	@echo "  auditshell   Auditer un script Bash avec Copilot Chat"

	
	@echo ""
	@echo "Danger:"
	@echo "  reset        Reset infra (⚠️ deletes volumes)"

menu:
	@bash infra/scripts/menu.sh

check:
	@bash infra/scripts/check.sh

up:
	@bash infra/scripts/up.sh

down:
	@bash infra/scripts/down.sh

restart:
	@bash infra/scripts/down.sh
	@bash infra/scripts/up.sh

ps:
	@bash infra/scripts/ps.sh

logs:
	@bash infra/scripts/logs.sh

wp:
	@bash infra/scripts/wp.sh

install:
	@bash infra/scripts/wp-install.sh

reset:
	@bash infra/scripts/reset.sh

open:
	@bash infra/scripts/menu.sh open

mailpit:
	@bash infra/scripts/menu.sh mailpit

build-wp:
	@BASEWP_NO_PROMPT=1 bash infra/scripts/wp.sh build-image

rebuild-wp:
	@BASEWP_NO_PROMPT=1 bash infra/scripts/wp.sh rebuild-image

doctor:
	@BASEWP_NO_PROMPT=1 bash infra/scripts/wp.sh doctor

clean:
	@bash infra/scripts/clean.sh

host-add:
	@bash infra/scripts/host.sh add

host-rm:
	@bash infra/scripts/host.sh remove

certs:
	@bash infra/scripts/certs.sh ensure

certs-clean:
	@bash infra/scripts/certs.sh clean

project:
	@bash infra/scripts/project.sh

project-list:
	@bash infra/scripts/project.sh list

project-edit:
	@bash infra/scripts/project.sh edit

docsh:
	@echo "👉 Sélectionne du code Bash puis lance Copilot Chat avec /docsh"

docenv:
	@echo "👉 Sélectionne un .env puis Copilot Chat /docenv"

docmeta:
	@echo "👉 Sélectionne meta.json puis Copilot Chat /docmeta"

auditshell:
	@echo "👉 Sélectionne un script Bash puis Copilot Chat /auditshell"