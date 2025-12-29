# 🧭 GitHub Copilot — Mode PLAN (règles strictes)

> 🔒 **Document interne**
>
> Ce document définit **l’usage autorisé du Mode PLAN de GitHub Copilot**.
> Il complète :
>
> - `copilot-instructions.md`
> - `copilot-checklist.md`
>
> Le Mode PLAN est un **outil de structuration**, jamais un générateur automatique.

---

## 🎯 Principe fondamental

> **PLAN sert à décider QUOI faire, jamais COMMENT tout coder.**

Toute sortie du Mode PLAN doit être :

- courte
- actionnable
- validée humainement avant toute génération de code

---

## 🟢 Catégorie 1 — Mode PLAN interdit

- ❌ Mode PLAN interdit
- seules les suggestions inline sont autorisées
- toute tentative de PLAN est refusée

👉 Catégorie 1 = exécution simple, pas de structuration.

---

## 🟠 Catégorie 2 — Mode PLAN court (obligatoire avant module)

**Autorisé uniquement si :**

- un module est ajouté
- le périmètre est fonctionnel (non métier)

**Contraintes strictes :**

- sortie limitée à **5–6 étapes maximum**
- aucun code généré
- aucune proposition d’outil non validé
- aucune refonte globale

**Format attendu :**

- liste d’étapes numérotées
- une phrase par étape
- pas de sous-sections

👉 Toute sortie dépassant ce cadre est invalide.

---

## 🔴 Catégorie 3 — Mode PLAN structurant

**PLAN obligatoire avant toute implémentation.**

**Autorisé :**

- découpage fonctionnel
- identification des risques
- dépendances explicites
- pseudo-code (optionnel)

**Interdictions absolues :**

- logique métier inventée
- interprétation réglementaire
- règles implicites

👉 Le PLAN doit être **validé par écrit** avant toute ligne de code.

---

## 🔵 Catégorie 4 — Mode PLAN architectural

Le Mode PLAN devient un outil de **revue et de cadrage**.

**Autorisé :**

- comparaison d’architectures
- identification des points critiques
- arbitrages documentés

**Interdit :**

- génération de code
- choix d’outils définitifs
- promesse de performance chiffrée

👉 Copilot agit comme un **consultant technique**, jamais comme implémenteur.

---

## 📉 Règles anti-dérive & quotas

- un PLAN = un objectif précis
- pas de reformulation en boucle
- pas de PLAN exploratoire
- si le problème est simple → **ne pas utiliser PLAN**

En cas de doute :
👉 revenir à `copilot-checklist.md`.

---

## 📌 Règle finale

> **Un PLAN non validé est un PLAN inutile.**
> Tout PLAN hors cadre entraîne une requalification ou un refus.

---

## 🧭 Utilisation de Copilot — Mode PLAN

Les règles complètes d’utilisation du Mode PLAN sont définies dans :  
👉 `copilot-plan.md`

Toute utilisation du Mode PLAN doit respecter :

- la catégorie du projet
- la check-list AVANT prompt
- les règles anti‑quota définies dans ce fichier
