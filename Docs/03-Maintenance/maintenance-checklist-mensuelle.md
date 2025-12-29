# Checklist de maintenance mensuelle

Ce document définit la **checklist opérationnelle mensuelle** de maintenance.  
Objectif : maintenir les sites **sécurisés, stables et conformes** en un temps maîtrisé.

⏱️ Temps cible :

- Catégorie 1 : **15–20 min / site**
- Catégorie 2 : **20–30 min / site**
- Catégorie 3 : **30–45 min / site**
- Catégorie 4 : **selon contrat**

---

## 🧠 Règles générales

- Toujours intervenir sur un site **sauvegardé**
- Aucune évolution fonctionnelle pendant la maintenance
- Toute anomalie hors périmètre = **ticket / devis**
- La checklist fait foi (si ce n’est pas dedans, ce n’est pas inclus)

---

## 🔐 1️⃣ Sécurité (toutes catégories)

- [ ] Certificat HTTPS valide
- [ ] Redirection HTTP → HTTPS OK
- [ ] Accès admin sécurisé (pas de comptes inconnus)
- [ ] Tentatives de connexion suspectes vérifiées
- [ ] Headers de sécurité toujours actifs
- [ ] Aucun avertissement critique serveur

🎯 Objectif : conformité continue avec la **Base technique commune**

---

## 🔄 2️⃣ Mises à jour

### WordPress / Plugins / Thème

- [ ] Sauvegarde complète effectuée
- [ ] WordPress à jour
- [ ] Plugins à jour
- [ ] Thème à jour
- [ ] Aucune erreur après mise à jour

### Vérifications post-update

- [ ] Site accessible (front)
- [ ] Admin accessible
- [ ] Fonctionnalités clés OK
- [ ] Articles du blog affichés correctement
- [ ] Pages de catégories / archives du blog accessibles

---

## ⚡ 3️⃣ Performance & stabilité

- [ ] Cache actif
- [ ] Aucun ralentissement anormal
- [ ] Pas d’erreurs JS visibles
- [ ] Pas d’erreurs PHP critiques
- [ ] Consommation ressources normale
- [ ] Chargement des pages du blog normal
- [ ] Aucune erreur spécifique sur les articles récents

---

## 📝 3️⃣bis Vérifications spécifiques Blog (si présent)

- [ ] Articles accessibles (front-office)
- [ ] Catégories et tags fonctionnels
- [ ] Pagination du blog opérationnelle
- [ ] Recherche sur le blog fonctionnelle (si activée)
- [ ] Aucune erreur d’affichage liée au contenu

---

## 🛒 4️⃣ Vérifications spécifiques WooCommerce (si applicable)

### Catégorie 1 / 2

- [ ] Tunnel commande fonctionnel
- [ ] Paiement test OK
- [ ] Emails transactionnels OK

### Catégorie 3

- [ ] Règles fiscales inchangées
- [ ] Calculs métier cohérents
- [ ] Cas limites testés

---

## 🤖 5️⃣ Module IA (si actif)

- [ ] Service IA actif
- [ ] Consommation normale
- [ ] Pas de réponses aberrantes signalées
- [ ] Prompts toujours conformes

---

## 🔎 6️⃣ Logs & monitoring

- [ ] Logs erreurs consultés
- [ ] Aucun pic anormal
- [ ] Uptime OK
- [ ] Alertes traitées

---

## 📝 7️⃣ Reporting interne (rapide)

- [ ] Maintenance effectuée
- [ ] Incidents détectés (oui / non)
- [ ] Actions correctives réalisées
- [ ] Points à surveiller

⏱️ Temps cible : **2–3 minutes**

---

## 🚫 Ce que cette checklist NE couvre PAS

- Ajout ou modification de contenu
- Changements design
- Nouvelles fonctionnalités
- Optimisations SEO éditoriales
- Changements réglementaires
- correction ou optimisation du contenu éditorial (articles, titres, textes)
- stratégie de contenu ou de publication

---

## 📌 Principe fondamental

> **La maintenance est un acte technique, pas une prestation créative.**  
> Cette checklist garantit la qualité sans dérive.

---
