# build-project.prompt

Tu es un agent “Architect + UI/UX + DevOps” sur le repo **Site Factory**.
Objectif : refactor le **wizard de configuration d’un project** + la page `projects/(project)/client/site/view` pour rendre l’expérience **claire, scalable** et alignée avec le workflow réel :
- **Docker est TOUJOURS utilisé en local** pour dev + prodlike.
- Le déploiement en ligne dépend de la **cible** (mutualisé o2switch vs VPS/OVH, etc.)
- On veut un cycle de MAJ simple : local → staging → prod.

---

## Contexte & contraintes clés

### 1) Docker est un runtime local fixe
- On ne “choisit” pas docker dans l’UI : **local = docker** systématique.
- On génère une config docker **dev prodlike** (services simulant la prod) + toggles “providers”.

### 2) La “vérité prod” est le **Deployment Target**
Le choix structurant est la cible :
- `mutualized:o2switch` (pas de docker en prod, déploiement par artifacts)
- `vps:ovh` (docker possible en staging/prod)
- extensible à d’autres plus tard

### 3) Le wizard doit être **conditionnel** selon le stack
- Stack WP : valeur issue de `create project` => **non editable**
- Next : à venir (préparer l’architecture pour l’ajouter sans casser le modèle)
- WP Headless (plus tard) : dépendances Next autorisées uniquement si `wp-headless=true`

### 4) Environnements = local / staging / prod
- local : docker dev/prodlike
- staging : environnement en ligne de test
- prod : environnement en ligne final
Le `deploymentTarget` détermine le mode de déploiement staging/prod :
- o2switch => upload/build artifacts (rsync/zip + env)
- vps => docker compose (env staging/prod)

### 5) Providers & services : toggles par environnement
Exemple essentiel :
- Mail :
  - local par défaut => `mailpit`
  - staging/prod => `smtp` (o2switch/cPanel) OU provider externe plus tard
- DB :
  - local => container (mysql/mariadb)
  - staging/prod => managée (o2switch) ou docker/managed (vps)
L’UI doit exposer un **switch user-friendly** :
- “Mail provider” : mailpit | smtp (| brevo/mailgun plus tard)
- “DB provider” : managed | docker (selon target)

---

## Livrables attendus

### A) Modèle de config unifié (scalable)
Créer/mettre à jour un modèle clair pour un project, idéalement dans un fichier type:
- `lib/site-factory/schemas/*.schema.json`
- + un fichier de config projet (ex: `projects/<id>/data/site_config_meta.json` + `environment_meta.json`)

Proposition attendue (à adapter à l’existant) :
- `stack`: "wp" | "next" | "wp-headless"
- `deploymentTarget`: "mutualized:o2switch" | "vps:ovh" | "other"
- `environments`:
  - `local`: { providers: { mail: "mailpit", db: "docker" }, services: {...} }
  - `staging`: { providers: { mail: "smtp", db: "managed" }, services: {...} }
  - `prod`: { providers: { mail: "smtp", db: "managed" }, services: {...} }

Règles :
- `local.providers.mail` default = `mailpit`
- Si `deploymentTarget=mutualized:o2switch` alors staging/prod => mail smtp cpanel + db managed (sauf override)
- Le modèle doit permettre des overrides `--set key=value` via CLI (déjà existant ou à consolider)

### B) Générateurs (docker + env) pilotés par env + target
Implémenter/structurer des fonctions (ou modules) pour générer :
1. `compose.local.yml` (dev/prodlike) + services : db, mailpit, redis (optionnel), etc.
2. `.env.local`, `.env.staging`, `.env.prod` (ou fichiers équivalents) selon providers
3. Un “deploy adapter” :
   - o2switch: build artifacts + upload (staging/prod)
   - vps: docker compose up (staging/prod)

Objectif : pouvoir faire
- `site-factory projects env generate --env local|staging|prod`
- `site-factory projects deploy --env staging|prod`

### C) UI/UX : refactor page `projects/(project)/client/site/view`
Objectif : réduire le côté “brouillon” en séparant les responsabilités.

#### Layout recommandé (3 tabs ou 3 sections claires)
1) **Overview** (read-only)
- stack, deploymentTarget, environments status

2) **Config Wizard** (edit)
- Step 1: Deployment Target (mutualized/vps) + provider defaults
- Step 2: Environment configs (local/staging/prod) -> accordéon ou tabs
- Step 3: Providers (mail/db) + toggles services autorisés selon target
- Validation inline + champs required

3) **Actions**
- Generate local docker config
- Generate env files
- Deploy staging
- Deploy prod
- “Update flow” (local->staging->prod) guidé

#### Champs conditionnels (IMPORTANT)
- Si stack=wp (non editable)
- Si target=o2switch :
  - staging/prod : db managed + smtp (cpanel)
  - masquer options docker prod
- Si target=vps :
  - permettre docker staging/prod
- Si mail provider = smtp :
  - afficher host/port/user/pass/from (required)
- Si mail provider = mailpit :
  - masquer creds, afficher url interne mailpit
- Toujours SSL :
  - local: via reverse proxy dev (traefik/caddy) OU mkcert (à choisir, proposer une base)
  - staging/prod: via target (cpanel ssl / reverse proxy)

### D) Validation : UI + CLI cohérentes
- UI : required fields selon provider/target/env
- CLI : revalider au minimum les champs critiques warnings->errors (UUID, slug, providers required)
- Utiliser des validate helpers existants (`core/validate.sh`) et compléter si besoin

---

## Où modifier dans le repo (guidelines)
- CLI / Lib:
  - `lib/site-factory/core/*`
  - `lib/site-factory/modules/projects/*`
  - `lib/site-factory/modules/clients/*`
  - `lib/site-factory/schemas/*`
- UI:
  - `apps/site-factory-ui/...` (ou équivalent)
  - page: `projects/(project)/client/site/view`

Ne casse pas l’existant : préfère une migration progressive (v1 compatible).
Ajoute des exemples dans les json générés.

---

## Acceptance criteria (à respecter)
- Wizard clair, étapes lisibles, champs conditionnels corrects
- Config générée stable et versionnée (`version: 1`)
- Local = docker toujours
- Target o2switch => staging/prod sans docker (artifacts), providers adaptés
- Target vps => staging/prod docker possible
- Switch provider mail (mailpit/smtp) fonctionnel + env générés
- Commands/Actions cohérentes (generate env, deploy staging, deploy prod)
- Code propre (pas d’eval), shellcheck propre si scripts bash touchés

---

## Tâches à exécuter maintenant
1) Proposer la structure JSON cible (schemas + exemple)
2) Proposer le flow UI (tabs/steps + champs conditionnels)
3) Lister les modifications minimales côté CLI pour générer docker/env/deploy adapters
4) Implémenter ou stubber les fonctions nécessaires (avec TODO clairs)
5) Mettre à jour/ajouter les commandes `projects env generate` et `projects deploy`

Commence par un plan de refactor (bullet list), puis applique les modifications.