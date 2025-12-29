SHELL := /bin/bash

# --------------------------------------------------
# Base WP – Infra Makefile
# --------------------------------------------------

.PHONY: help menu up down restart ps logs wp install reset open mailpit check

help:
	@echo "Base WP – Infra commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  help       Show this help"
	@echo "  menu       Open interactive infra menu (fzf)"
	@echo "  check      Run infra diagnostics"
	@echo ""
	@echo "  up         Start infrastructure"
	@echo "  down       Stop infrastructure"
	@echo "  restart    Restart infrastructure"
	@echo "  ps         Show services status"
	@echo "  logs       Show logs (interactive)"
	@echo ""
	@echo "  wp         WP-CLI interactive menu"
	@echo "  install    Install WordPress (core install)"
	@echo ""
	@echo "  open       Open WordPress in browser"
	@echo "  mailpit    Open Mailpit in browser"
	@echo ""
	@echo "  reset      Reset infra (⚠️ deletes volumes)"

menu:
	@infra/scripts/menu.sh

check:
	@infra/scripts/check.sh

up:
	@infra/scripts/up.sh

down:
	@infra/scripts/down.sh

restart:
	@infra/scripts/down.sh
	@infra/scripts/up.sh

ps:
	@docker compose ps

logs:
	@infra/scripts/logs.sh

wp:
	@infra/scripts/wp.sh

install:
	@infra/scripts/wp.sh install

reset:
	@infra/scripts/reset.sh

open:
	@infra/scripts/menu.sh open

mailpit:
	@infra/scripts/menu.sh mailpit