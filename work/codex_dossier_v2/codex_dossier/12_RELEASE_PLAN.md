# 12_RELEASE_PLAN.md — Release Plan MVP

## Objectif

Découper la réalisation en incréments testables.

---

## Release 0 — Socle technique

### Contenu

- Initialisation NextJS.
- Tailwind + Shadcn.
- Prisma + PostgreSQL.
- Authentification.
- Layout applicatif.

### Résultat attendu

Un utilisateur authentifié peut accéder à l'application vide.

---

## Release 1 — Mission cockpit

### Contenu

- CRUD Client.
- CRUD Mission.
- Écran 1 Mission.
- Statut d'avancement.
- Actions principales : modifier mission, ajouter source.

### Résultat attendu

Le consultant peut créer et piloter une mission.

---

## Release 2 — Besoin validé

### Contenu

- Écran 2 Besoin Validé.
- Saisie besoin brut.
- Symptômes.
- Clarifications IA mockées puis réelles.
- Besoin reformulé.

### Résultat attendu

Le consultant peut transformer une demande brute en besoin clarifié.

---

## Release 3 — Organisation théorique

### Contenu

- Rôles.
- Personnes.
- Activités.
- RACI.
- Flux théorique.
- Mapping rôles.

### Résultat attendu

Le consultant peut construire le modèle attendu.

---

## Release 4 — Sources et modèle canonique

### Contenu

- Import source CSV/Jira mock.
- RawData.
- DetectedConfiguration.
- ArtifactMapping.
- StatusMapping.
- CanonicalArtifact.
- CanonicalEvent.

### Résultat attendu

Les données brutes sont transformées en modèle canonique exploitable.

---

## Release 5 — Modèle observé

### Contenu

- Écran 4 Modèle Observé.
- Flux observé.
- Organisation observée.
- Activité des rôles.
- Dépendances simples.

### Résultat attendu

Le consultant voit ce que les données montrent factuellement.

---

## Release 6 — Écarts

### Contenu

- Écran 5 Carte des Écarts.
- Comparaison théorie / observé.
- Classification des écarts.
- Actions : accepter, investiguer.

### Résultat attendu

Le consultant identifie les écarts entre modèle attendu et réalité observée.

---

## Release 7 — Observations & hypothèses

### Contenu

- Moteur de métriques.
- Moteur de phénomènes.
- Observations.
- Preuves.
- Hypothèses.
- Questions d'investigation.

### Résultat attendu

Le référentiel Diagnostic Flash produit des observations auditables et des pistes d'enquête.

---

## Release 8 — Plan d'investigation

### Contenu

- Écran 7 Plan d'Investigation.
- Association hypothèses / personnes.
- Fiches entretien.
- Questions proposées.

### Résultat attendu

Le consultant peut préparer les entretiens terrain.

---

## Release 9 — Synthèse & exports

### Contenu

- Écran 8 Synthèse.
- Faits observés.
- Compréhensions retenues.
- Incertitudes.
- Plan d'action manuel.
- Exports PDF / Word.

### Résultat attendu

Le consultant peut produire les livrables finaux du diagnostic.
