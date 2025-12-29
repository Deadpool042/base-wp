# Base hébergement compatible — Socle obligatoire

Ce document définit les **exigences d’hébergement minimales** pour tous les projets de l’agence.  
Il conditionne l’application de la **Base technique commune** et donc l’éligibilité aux **Catégories 1 à 4**.

⚠️ Sans hébergement compatible, **le projet est requalifié ou refusé**.

---

## 🎯 Objectifs

- Garantir la **sécurité mesurable** (ex. Mozilla Observatory)
- Assurer des **performances stables**
- Permettre une **maintenance fiable**
- Éviter les environnements non maîtrisables

---

## ✅ Exigences techniques minimales (obligatoires)

L’hébergement doit permettre **toutes** les capacités suivantes :

### Sécurité & réseau

- HTTPS avec certificat valide (Let’s Encrypt ou équivalent)
- Redirection HTTP → HTTPS
- Configuration des **headers de sécurité** (CSP, HSTS, etc.)
- Accès aux logs (au minimum erreurs)
- Protection basique contre brute-force / DDoS (natif ou via CDN)

### Serveur & runtime

- PHP **maintenu** (≥ 8.1 recommandé)
- Possibilité de choisir la version PHP
- Extensions PHP standards activables
- Accès à la configuration (php.ini ou équivalent)
- Cron système ou planificateur fiable

### Fichiers & accès

- Accès SFTP/SSH (au moins SFTP)
- Droits d’écriture contrôlables
- Espace disque suffisant et évolutif

### Performance

- Cache serveur ou possibilité de cache applicatif
- HTTP/2 (a minima)
- Compression (Gzip/Brotli)

---

## 🧪 Tests de conformité

L’hébergement doit permettre :

- Mozilla Observatory **≥ A** (objectif Cat.1)
- Fonctionnement stable après mises à jour
- Restauration depuis sauvegarde

---

## 🟢 Hébergements généralement compatibles (indicatif)

> La compatibilité dépend de la **configuration**, pas seulement du fournisseur.

- VPS (OVH, Scaleway, Hetzner, etc.)
- Hébergement WordPress managé **configurable**
- Serveurs mutualisés **haut de gamme** (si accès suffisant)

---

## 🟠 Hébergements compatibles sous conditions

- Mutualisé d’entrée de gamme
- Offres “WordPress simplifié”

⚠️ Acceptés **uniquement si** :

- headers de sécurité configurables
- HTTPS + cache possibles
- accès techniques suffisants

👉 Sinon : **requalification**.

---

## 🔴 Hébergements non compatibles (refus Cat.1 / 2)

- Offres sans accès aux headers
- Hébergement imposant des plugins non maintenus
- Environnements figés (pas de PHP configurable)
- Accès FTP uniquement sans logs
- Offres “site builder” fermées

👉 Ces cas sortent du cadre standard.

---

## 🧭 Cas particuliers — Headless / Premium (Cat.4)

Pour les projets Catégorie 4 :

- Front et back peuvent être hébergés séparément
- CDN recommandé
- Hébergement défini **au cas par cas**
- SLA possible via contrat spécifique

---

## 🔁 Responsabilités & limites

- L’agence/le partenaire **n’est pas responsable** des limites imposées par l’hébergement
- Toute contrainte bloquante = **requalification ou devis**
- Le client reste responsable de son hébergement s’il est imposé

---

## 📌 Règle fondamentale

> **L’hébergement conditionne la qualité du site.**  
> Sans hébergement compatible, il n’y a pas de Catégorie 1.

---
