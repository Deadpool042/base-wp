---
name: docmeta
description: Documenter un meta.json de projet BaseWP (champs, exemples, règles) en français
---

Analyse le JSON sélectionné (ou le code qui le génère) et produis une documentation en FRANÇAIS.

Règles :

- Ne pas modifier le code.
- Décrire uniquement les champs réellement présents/inférés du code.
- Donner des exemples JSON minimaux.

Sortie attendue :

# meta.json — Schéma

## Champs

- client.name, client.slug
- site.name, site.slug
- slug
- domains.local, domains.prod, domains.prod_www
- traefik.email
- wp.locale, wp.admin_user, wp.admin_email

## Règles

- slug stable / fallback
- domaines .local vs prod
- liens avec env generation

## Exemple complet

```json
{ ... }
```

---

## 6) `.github/prompts/docenv.prompt.md` (documenter `.env.dev` / `.env.prod`)

```md
---
name: docenv
description: Documenter un fichier .env BaseWP (variables, rôles, exemples) en français
---

Analyse le contenu sélectionné (.env, template, génération) et produit une documentation en FRANÇAIS.

Règles :

- Ne pas modifier le code.
- Ne pas exposer de secrets réels : si une valeur ressemble à un secret, la masquer (ex: "**\*\*\*\***").

Sortie attendue :

# Variables .env

## Identité projet

- STACK_PREFIX
- PROJECT_REF
- PROJECT_SLUG
- STACK_ENV
- STACK_NAME
- COMPOSE_PROJECT_NAME

## Domaines / Traefik

- SITE_DOMAIN
- SITE_DOMAIN_WWW
- TRAEFIK_EMAIL
- TRAEFIK_TLS_RESOLVER

## WordPress

- WP_SITE_URL
- WP_LOCALE
- WP_TABLE_PREFIX
- WP_ADMIN_PASSWORD (sensibilité)

## Base de données

- DB_IMAGE
- DB_HOST
- DB_NAME
- DB_USER
- DB_PASSWORD (sensibilité)
- DB_ROOT_PASSWORD (sensibilité)

# Bonnes pratiques

- où stocker les secrets
- éviter le commit
- rotation prod
```
