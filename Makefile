SHELL := /bin/bash

# Docker compose wrappers
ENV_FILE := infra/docker/env/.env
COMPOSE_FILE := infra/docker/compose.yml

.PHONY: help menu up down restart ps logs wp reset install open mailpit db check

help:
	@echo "Targets:"
	@echo "  make menu      - menu interactif (fzf)"
	@echo "  make up        - démarrer l'infra"
	@echo "  make down      - arrêter l'infra"
	@echo "  make restart   - redémarrer l'infra"
	@echo "  make ps        - status services"
	@echo "  make logs      - logs interactifs"
	@echo "  make wp        - WP-CLI interactif"
	@echo "  make install   - installer WP (si non installé)"
	@echo "  make reset     - reset complet (⚠️ supprime volumes)"
	@echo "  make mailpit   - ouvrir Mailpit (url)"
	@echo "  make open      - ouvrir WP (url)"

menu:
	@infra/scripts/menu.sh

up:
	@infra/scripts/up.sh

down:
	@infra/scripts/down.sh

restart:
	@infra/scripts/down.sh
	@infra/scripts/up.sh

ps:
	@docker compose --env-file $(ENV_FILE) -f $(COMPOSE_FILE) ps

logs:
	@infra/scripts/logs.sh

wp:
	@infra/scripts/wp.sh

install:
	@infra/scripts/wp.sh install

reset:
	@infra/scripts/reset.sh

mailpit:
	@infra/scripts/menu.sh mailpit

open:
	@infra/scripts/menu.sh open

check:
	@infra/scripts/check.sh
	