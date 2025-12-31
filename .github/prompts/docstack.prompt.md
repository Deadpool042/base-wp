---
name: docstack
description: Documenter une stack infra BaseWP (compose, env, Traefik, certs) en français
---

Analyse le contenu sélectionné (docker compose, scripts, env, traefik) et génère une documentation en FRANÇAIS.

Règles :

- Ne pas modifier le code.
- Ne pas inventer des fichiers qui n’existent pas.
- Si une info manque, l’indiquer clairement.

Sortie attendue (Markdown) :

# Vue d’ensemble

- But de la stack
- Composants (services, reverse-proxy, DB, etc.)

# Convention de nommage

- STACK_PREFIX, STACK_NAME, COMPOSE_PROJECT_NAME
- Règles de slug et impacts

# Réseau / domaines

- SITE_DOMAIN / SITE_DOMAIN_WWW
- /etc/hosts (quand, comment)
- certificats (mkcert vs letsencrypt)

# Environnements

- dev / prod / default
- ordre de résolution des env files
- secrets (où ils vivent, comment éviter de les committer)

# Procédures (pas à pas)

- créer un projet
- sélectionner un projet
- démarrer / stopper
- régénérer env
- sync hosts / certs
- supprimer proprement

# Dépannage

- erreurs fréquentes (docker, env, certs)
- commandes utiles
