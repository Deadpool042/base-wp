# 📦 Module Sécurité renforcée

> 🔒 **Document interne**
>
> Ce module définit le cadre de **renforcement de la sécurité**
> au-delà du **socle technique commun**.
>
> Il s’applique à partir de la **Catégorie 2**.
> En **Catégorie 4**, la sécurité fait partie intégrante
> de l’architecture globale et n’est pas traitée comme un module isolé.

---

## 🧠 C’est quoi le module Sécurité renforcée ?

Le module Sécurité renforcée vise à **durcir WordPress**  
et à réduire les risques d’intrusion, de spam ou d’abus,  
lorsque le niveau de risque dépasse le socle standard.

👉 Le socle technique couvre déjà la sécurité de base.  
Ce module intervient uniquement en **renforcement ciblé**.

---

## ⚠️ Clarification — Catégorie 1

La **Catégorie 1** correspond au socle technique uniquement.  
Elle inclut les protections standards sans activation du module Sécurité renforcée.

Le socle technique comprend notamment :

- HTTPS / TLS
- Headers de sécurité standards
- Mises à jour régulières de WordPress et plugins
- Sauvegardes automatiques
- Protections basiques des formulaires (captcha simple, honeypot)
- Surveillance minimale

Aucun module de sécurité renforcée n’est appliqué en Catégorie 1.

---

## ⚙️ Ce que le socle technique commun couvre (Catégorie 1)

- HTTPS / TLS
- Headers de sécurité standards
- Mises à jour WordPress / plugins
- Sauvegardes automatiques
- Protections basiques des formulaires (captcha simple, honeypot)
- Surveillance minimale

👉 Le socle technique assure une sécurité de base adaptée aux risques faibles.

---

## ⚙️ Ce que WordPress gère (ou ne gère pas) nativement

WordPress gère nativement :

- Gestion des rôles et permissions
- Authentification par mot de passe
- Journalisation limitée

WordPress ne gère pas nativement :

- Protection avancée contre les attaques par force brute
- Surveillance comportementale
- Alertes de sécurité exploitables
- Durcissement fin de l’administration
- Protections ciblées par zone ou usage

Dès que le niveau d’exposition ou de risque augmente,  
le module Sécurité renforcée devient nécessaire.

---

## 🟢 Niveau 1 — Sécurité renforcée standard (Catégorie 2)

### Rôle - Niveau 1

Durcir WordPress et mettre en place une **surveillance renforcée**,  
sans complexité excessive.

### Inclus - Niveau 1

- Durcissement des accès administrateurs
- Limitation des tentatives de connexion
- Captcha avancé et conditionnel (au-delà du captcha simple du socle)
- Rate-limiting intelligent sur formulaires et accès sensibles
- Règles anti-bots ciblées (login, formulaires, checkout)
- Surveillance des fichiers critiques
- Alertes de sécurité basiques
- Journalisation renforcée

👉 Le captcha simple fait partie du socle technique.
Toute protection conditionnelle ou ciblée relève du module Sécurité renforcée.

### Exclus - Niveau 1

- SOC ou supervision 24/7 (Security Operations Center)
- Audits de sécurité complets
- Pentests
- Conformité réglementaire spécifique

### Contraintes - Niveau 1

- Périmètre standard uniquement
- Règles figées après validation

💰 **Prix fixe** : **700 € HT**  
📦 **Catégorie** : 2

---

## 🔴 Niveau 2 — Sécurité renforcée métier (Catégorie 3)

### Rôle

Renforcer la sécurité sur des projets présentant un **risque métier ou réglementaire accru**.

### Inclus

- Durcissement avancé de l’administration
- Règles spécifiques par rôle ou zone
- Surveillance étendue
- Alertes structurées
- Documentation de sécurité remise

### Exclus

- Hébergement sécurisé spécifique
- SOC externalisé
- Sécurité applicative sur mesure

### Contraintes

- Cadrage sécurité obligatoire
- Validation écrite du périmètre
- Responsabilité accrue

💰 **Prix fixe** : **1 500 € HT**  
📦 **Catégorie** : 3

---

## 🚫 Hors périmètre du module

- Hébergement sécurisé / infogérance
- Conformité légale (RGPD, ISO, PCI-DSS)
- Audits de sécurité complets
- Sécurité applicative sur mesure
- Projets sécurité globaux (Catégorie 4)

---

## 🧪 Checklist avant livraison

- [ ] Accès administrateurs sécurisés
- [ ] Protections anti-bots actives
- [ ] Alertes testées
- [ ] Journaux vérifiés
- [ ] Périmètre validé

---

## 📌 Règle non négociable

- Catégorie 1 = socle technique uniquement
- Toute demande de durcissement nécessite le module Sécurité renforcée
- La sécurité réduit les risques mais ne garantit jamais l’absence d’incident

---

## 📌 Règle finale

> Le module Sécurité renforcée **réduit les risques**,  
> mais ne garantit jamais une sécurité absolue.
>
> Toute demande hors périmètre  
> entraîne une **requalification**  
> ou un **devis spécifique**.
