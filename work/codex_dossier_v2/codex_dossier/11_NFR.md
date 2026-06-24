# 11_NFR.md — Non Functional Requirements

## 1. Sécurité

- Toutes les données doivent être isolées par utilisateur et par client.
- Toute requête serveur doit vérifier le `userId` de l'utilisateur authentifié.
- Aucun accès direct à une mission par ID ne doit exposer des données d'un autre utilisateur.
- Les secrets API ne doivent jamais être exposés côté client.

---

## 2. Confidentialité et RGPD

- Les données importées peuvent contenir des noms, emails, tickets, commentaires et informations organisationnelles sensibles.
- L'application doit permettre la suppression d'une mission et de ses données associées.
- Les exports doivent être générés uniquement à la demande du consultant.
- Les logs ne doivent pas contenir de payloads complets issus des documents client.
- Les données envoyées à l'IA doivent être limitées au strict nécessaire.

---

## 3. Principe IA

- L'IA ne produit jamais de conclusion diagnostique automatique.
- L'IA peut produire : clarifications, observations, indices, preuves, hypothèses, questions.
- Le consultant valide ou rejette les hypothèses.
- Les compréhensions retenues et plans d'action sont manuels.

---

## 4. Auditabilité

- Toute observation affichée doit être reliée à au moins une preuve.
- Les preuves doivent pouvoir être consultées depuis l'écran d'observation.
- Les données brutes importées doivent être conservées pour recalcul.
- Les décisions manuelles du consultant doivent être persistées.

---

## 5. Performance MVP

Objectifs indicatifs :

- Chargement dashboard mission : < 2 secondes sur données MVP.
- Import CSV/Jira mock jusqu'à 5 000 tickets : < 2 minutes.
- Calcul métriques jusqu'à 5 000 artefacts : < 60 secondes.
- Génération PDF standard : < 30 secondes.

Ces valeurs sont des cibles MVP, non des SLA contractuels.

---

## 6. Volumétrie MVP

Hypothèses de dimensionnement initial :

- 1 consultant.
- 10 clients.
- 50 missions.
- 5 000 tickets par mission.
- 50 000 événements par mission.
- 200 observations maximum par mission.

---

## 7. Résilience

- Une erreur sur une source ne doit pas bloquer toute la mission.
- Une erreur IA ne doit pas supprimer les données calculées.
- Les imports et analyses doivent être relançables.
- Les traitements longs doivent produire un statut visible.

---

## 8. Maintenabilité

- Les moteurs doivent être séparés : import, mapping, canonicalisation, métriques, phénomènes, observations, exports.
- Les composants UI doivent être réutilisables.
- Les règles métier critiques doivent être testées.
- Les définitions de phénomènes doivent être seedables et extensibles.

---

## 9. Accessibilité et UX

- Toujours distinguer faits, hypothèses et compréhensions retenues.
- Toujours afficher les preuves.
- Ne jamais masquer les incertitudes.
- Les actions destructrices doivent demander confirmation.
- Les états vides doivent expliquer la prochaine action utile.
