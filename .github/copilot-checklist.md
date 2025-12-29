# ✅ Check-list AVANT prompt Copilot

> 🔒 **Document interne**
>
> Cette check-list doit être parcourue **avant toute utilisation non triviale**
> de GitHub Copilot (Chat ou Plan).
>
> Objectifs :
>
> - limiter la consommation de quotas premium
> - éviter les dérives techniques
> - garantir la cohérence avec la stack et la grille de qualification

---

## 1️⃣ Catégorie du projet identifiée

La catégorie du projet est **obligatoirement définie** avant tout prompt.

- ⬜ Catégorie 1 — Site standard
- ⬜ Catégorie 2 — Modules standards
- ⬜ Catégorie 3 — Métier / réglementé
- ⬜ Catégorie 4 — Premium / headless

👉 Si la catégorie n’est pas claire → **STOP**  
👉 La catégorie conditionne le droit de génération de Copilot.

---

## 2️⃣ Emplacement du code clairement identifié

Le code demandé à Copilot doit appartenir **à un seul périmètre** :

- ⬜ Plugin **Agence** (socle commun, réutilisable)
- ⬜ Plugin **Client** (logique métier spécifique)
- ⬜ Plugin **Webmaster** (UI, contenu, personnalisation)

👉 Si l’emplacement n’est pas clair → **ne pas générer de code**.

---

## 3️⃣ Vérification du natif WordPress / WooCommerce

Avant tout développement :

- ⬜ la fonctionnalité existe-t-elle nativement ?
- ⬜ les limites du natif sont-elles identifiées ?
- ⬜ la justification du custom est-elle claire ?

👉 Si le natif suffit → **Copilot ne doit rien générer**.

---

## 4️⃣ Mode Copilot réellement nécessaire

Choisir **le mode le plus léger possible** :

- ⬜ Inline (snippet, correction locale)
- ⬜ Plan court (Cat.2)
- ⬜ Plan structurant (Cat.3 / Cat.4)

👉 Le mode **Plan n’est jamais utilisé par défaut**.

---

## 5️⃣ Cadrage explicite du prompt

Un prompt valide doit contenir **au minimum** :

- catégorie du projet
- plugin cible (Agence / Client / Webmaster)
- contraintes de stack (WP / Woo / thème / éditeur)
- éléments explicitement exclus
- type de sortie attendue (plan / explication / code ciblé)

👉 Sans ces éléments, le prompt est **refusé**.

---

## 6️⃣ Risque métier ou réglementaire identifié

- ⬜ Aucun risque → génération encadrée possible
- ⬜ Risque métier / réglementaire → **Catégorie 3 minimum**

👉 Copilot ne doit **jamais inventer** :

- règle fiscale
- logique juridique
- comportement métier implicite

---

## 7️⃣ Peut-on résoudre sans IA ?

- ⬜ Oui → faire sans Copilot
- ⬜ Non → prompt autorisé

👉 Copilot est un **accélérateur**, pas un réflexe.

---

## 📌 Règle finale

> **Si tu ne peux pas valider ces 7 points,  
> tu n’es pas prêt à interroger Copilot.**

---

## ℹ️ Rappel important

- La catégorie du projet **prime toujours**
- Plus la catégorie est élevée :
  - plus Copilot doit expliquer
  - moins il doit générer de code
- Toute ambiguïté entraîne une **requalification**

---
