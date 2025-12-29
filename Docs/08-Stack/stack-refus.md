# 🚫 Stack — Refus & exclusions techniques

> 🔒 **Document interne — PRIORITAIRE**
>
> Ce document définit **les exclusions techniques non négociables**
> applicables à **tous les projets**, toutes catégories confondues.
>
> Il prévaut sur :
>
> - les préférences client
> - la white-list
> - les choix ponctuels de projet
>
> Objectifs :
>
> - protéger la maintenabilité long terme
> - éviter les dépendances à risque
> - prévenir le lock‑in et les effets freemium
> - garantir la cohérence de la stack agence

---

## 🧠 Principe fondamental

Tout ce qui figure dans ce document est **refusé par principe**.

👉 Une exception n’est possible **que** si :

- elle est documentée
- elle est validée explicitement
- elle entraîne, si nécessaire, une **requalification de catégorie**

⚠️ Toute exception :

- augmente la dette technique
- doit être tracée dans la documentation projet
- engage la responsabilité technique de l’agence

---

## 🚫 Plugins & outils refusés (liste noire)

### Page builders lourds

- Elementor (toutes versions)
- WPBakery / Visual Composer
- Divi Builder (hors thème verrouillé)

📌 Raisons :

- surcharge front‑end
- dépendance forte à l’éditeur
- dette technique élevée
- incompatibilité fréquente avec une architecture modulaire

---

### Plugins freemium ou à pression commerciale

- plugins nécessitant une version payante pour des fonctions critiques
- plugins imposant des limitations artificielles
- plugins affichant des upsells en back‑office client

📌 Raisons :

- imprévisibilité
- pression commerciale
- maintenance difficile
- perte de contrôle sur l’évolution fonctionnelle

---

### Extensions « tout‑en‑un » opaques ou fermées

- sécurité tout‑en‑un non auditables
- performance / cache non configurables finement
- SEO « magique » sans contrôle réel

📌 Raisons :

- comportement non maîtrisé
- conflits internes
- debug complexe

---

## 🚫 Pratiques techniques refusées

### Surcharge du core WordPress / WooCommerce

- modification directe des fichiers core
- hacks non documentés
- overrides non versionnés

👉 Toute personnalisation autorisée doit impérativement passer par :

- hooks
- plugins dédiés
- code versionné

---

### Empilement excessif de plugins

- ajout de plugins redondants
- empilement sans justification fonctionnelle
- plugins ajoutés “pour tester” en production

📌 Règle : **un besoin = une solution claire**.

---

### Tracking sans consentement

Statut : ❌ non négociable (conformité légale)

- scripts marketing chargés sans accord explicite
- pixels injectés hors CMP

👉 Refus systématique (non négociable).

---

## 🚫 IA & automatisation hors cadre

- IA sans plafond de coûts ou de volume
- automatisations non auditables ou non explicables
- promesses de résultats (SEO, conversion, juridique)
- dépendance à un fournisseur IA non substituable

📌 Toute IA doit être :

- limitée
- contrôlée
- documentée

---

## 🚫 Connecteurs critiques non maîtrisés

- dépendance à une API tierce non contractuelle
- synchronisation bidirectionnelle non tolérante aux erreurs
- absence de logs ou de mécanisme de reprise

👉 Ces cas relèvent obligatoirement de la **Catégorie 4** ou entraînent un refus pur et simple.

---

## 🚫 Hébergement non conforme

- absence de HTTPS
- PHP obsolète
- pas d’accès cron
- sauvegardes inexistantes ou non testées

👉 Hébergement à mettre à niveau ou projet refusé.

Statut : ❌ non négociable

---

## 📌 Règle finale

> Ce qui est refusé ici ne peut pas être contourné,
> requalifié implicitement ou validé à la volée.
>
> Toute tentative de contournement entraîne :
>
> - un **refus technique immédiat**
> - ou une **requalification complète du projet**

---

## 🔁 Documents de référence

- `Docs/08-Stack/README.md` — socle technique
- `stack-whitelist.md` — plugins autorisés (gouvernance)
- `flux-decisionnel.md` — arbitrage & requalification
