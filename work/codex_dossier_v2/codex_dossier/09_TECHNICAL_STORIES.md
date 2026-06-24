# 09_TECHNICAL_STORIES.md — Diagnostic Flash IA

## Objectif

Ce document découpe les fondations techniques du MVP en Technical Stories.

Les Technical Stories ne décrivent pas des fonctionnalités utilisateur finales. Elles décrivent les briques nécessaires pour rendre les User Stories réalisables, maintenables et testables.

---

## TS-001 — Initialiser le projet NextJS

En tant qu'équipe technique,
je veux initialiser une application NextJS TypeScript,
afin de disposer d'une base applicative propre pour le MVP.

### Critères d'acceptation

- Le projet utilise NextJS App Router.
- Le projet utilise TypeScript strict.
- Tailwind CSS est configuré.
- Shadcn UI est installé.
- Une page d'accueil temporaire s'affiche.
- Les scripts `dev`, `build`, `lint` fonctionnent.

---

## TS-002 — Configurer Prisma et PostgreSQL

En tant qu'équipe technique,
je veux connecter l'application à PostgreSQL via Prisma,
afin de persister les missions, sources, observations et livrables.

### Critères d'acceptation

- Le fichier `prisma/schema.prisma` est présent.
- La variable `DATABASE_URL` est utilisée.
- Les migrations Prisma peuvent être générées.
- Le client Prisma est accessible côté serveur.
- Les relations multi-client sont correctement modélisées.

---

## TS-003 — Implémenter l'authentification

En tant qu'équipe technique,
je veux une authentification utilisateur,
afin d'isoler les données de chaque consultant.

### Critères d'acceptation

- NextAuth est configuré.
- Un utilisateur authentifié peut accéder à ses clients et missions.
- Un utilisateur non authentifié est redirigé.
- Les requêtes serveur filtrent toujours par `userId`.

---

## TS-004 — Implémenter le layout applicatif

En tant qu'équipe technique,
je veux un layout commun,
afin de structurer les 8 écrans du MVP.

### Critères d'acceptation

- Navigation principale : Mission, Besoin, Organisation, Observé, Écarts, Observations, Investigation, Synthèse.
- Breadcrumb client > mission > écran.
- Indicateur d'avancement mission.
- Composants réutilisables : PageHeader, StatusBadge, EvidenceList, EmptyState.

---

## TS-005 — Créer les services Mission / Client

En tant qu'équipe technique,
je veux des services serveur pour clients et missions,
afin d'éviter de dupliquer la logique métier dans les écrans.

### Critères d'acceptation

- CRUD Client.
- CRUD Mission.
- Mise à jour du statut mission.
- Contrôle d'accès par `userId`.
- Tests unitaires sur les règles principales.

---

## TS-006 — Créer le moteur d'import Source

En tant qu'équipe technique,
je veux un service générique d'import de sources,
afin de stocker les fichiers et données brutes sans interprétation.

### Critères d'acceptation

- Création d'une Source.
- Upload fichier ou saisie manuelle.
- Stockage RawData.
- Statuts PENDING / IMPORTED / FAILED.
- Journalisation des erreurs d'import.

---

## TS-007 — Créer l'adaptateur Jira MVP mockable

En tant qu'équipe technique,
je veux un adaptateur Jira isolé,
afin de pouvoir développer le pipeline sans dépendre immédiatement d'une connexion réelle.

### Critères d'acceptation

- Interface `JiraAdapter` définie.
- Implémentation mock à partir de JSON/CSV.
- Import issues, changelogs, sprints.
- Conversion en RawData.
- Aucune logique de diagnostic dans l'adaptateur.

---

## TS-008 — Créer le moteur de configuration détectée

En tant qu'équipe technique,
je veux détecter les types de tickets, statuts, workflows et champs,
afin de préparer le mapping canonique.

### Critères d'acceptation

- Scan des RawData.
- Création de DetectedConfiguration.
- Détection issue types.
- Détection statuts.
- Détection champs utiles : sprint, points, parent, assignee, creator.

---

## TS-009 — Créer le moteur de mapping canonique

En tant qu'équipe technique,
je veux mapper les données locales vers le modèle canonique,
afin de rendre les analyses indépendantes du vocabulaire client.

### Critères d'acceptation

- ArtifactMapping, StatusMapping, RoleMapping sont utilisés.
- Le consultant peut valider ou corriger un mapping.
- Les artefacts canoniques sont générés uniquement après validation ou mapping par défaut explicite.
- Bugs et Technical Stories sont supportés.

---

## TS-010 — Générer les CanonicalArtifacts

En tant qu'équipe technique,
je veux transformer les tickets importés en CanonicalArtifacts,
afin de disposer d'un modèle observé exploitable.

### Critères d'acceptation

- Les artefacts ont un type canonique.
- Les statuts sont canoniques.
- Les relations parent/enfant sont conservées.
- Les personnes créateur / assigné sont reliées quand possible.
- Les dates externes sont conservées.

---

## TS-011 — Générer les CanonicalEvents

En tant qu'équipe technique,
je veux transformer les changelogs et commentaires en événements canoniques,
afin d'analyser les transitions, validations et blocages.

### Critères d'acceptation

- Transitions de statut créées.
- Changements d'assigné créés.
- Changements de sprint créés.
- Commentaires créés.
- Validations déductibles depuis statuts ou commentaires.

---

## TS-012 — Créer le moteur de métriques

En tant qu'équipe technique,
je veux calculer les métriques MVP,
afin d'alimenter le moteur de phénomènes.

### Critères d'acceptation

- waiting_ratio.
- lead_time.
- validation_concentration.
- sprint_churn.
- story_multi_sprint_ratio.
- technical_debt_ratio.
- Les métriques sont persistées.
- Les calculs sont relançables sans doublons incohérents.

---

## TS-013 — Créer le moteur de phénomènes

En tant qu'équipe technique,
je veux transformer les métriques en détections de phénomènes,
afin de produire des observations actionnables.

### Critères d'acceptation

- PhenomenonDefinition peut être seedé.
- Chaque Metric peut produire zéro ou plusieurs PhenomenonDetection.
- Les niveaux INFORMATION / ATTENTION / CRITICAL sont calculés.
- Le moteur n'écrit aucune conclusion diagnostique.

---

## TS-014 — Créer le moteur d'observations

En tant qu'équipe technique,
je veux générer des observations à partir des phénomènes,
afin de présenter des faits remarquables au consultant.

### Critères d'acceptation

- Une Observation contient title, description, observedValue, level.
- Une Observation est reliée à des preuves.
- Le consultant peut accepter, rejeter ou marquer à investiguer.
- Les observations rejetées restent auditables.

---

## TS-015 — Créer le moteur de preuves

En tant qu'équipe technique,
je veux relier chaque observation à ses éléments sources,
afin de garantir l'auditabilité.

### Critères d'acceptation

- Preuves de type ticket, commentaire, transition, métrique.
- Affichage lisible des références.
- Lien vers artefact ou événement quand disponible.
- Aucune observation critique sans preuve.

---

## TS-016 — Créer le moteur d'écarts

En tant qu'équipe technique,
je veux comparer modèle théorique et observé,
afin de produire une carte des écarts.

### Critères d'acceptation

- Création de Gap.
- Classification : COHERENT, LOCAL_VARIANT, SURPRISING, VERY_SURPRISING.
- Un écart peut être relié à une observation.
- Le consultant peut accepter ou marquer à investiguer.

---

## TS-017 — Créer le moteur d'hypothèses

En tant qu'équipe technique,
je veux proposer des hypothèses à partir du catalogue,
afin de préparer l'investigation terrain.

### Critères d'acceptation

- Hypothèses suggérées depuis PhenomenonDefinition.
- Statuts : suggested, retained, discarded, validated, invalidated.
- Niveau de confiance simple : low, medium, high.
- Aucune hypothèse ne devient diagnostic automatiquement.

---

## TS-018 — Créer le générateur de questions d'investigation

En tant qu'équipe technique,
je veux générer des questions reliées aux observations et hypothèses,
afin d'aider le consultant à préparer les entretiens.

### Critères d'acceptation

- Questions reliées à Observation et/ou Hypothesis.
- Questions éditables.
- Questions exportables dans le plan d'investigation.

---

## TS-019 — Créer le plan d'investigation

En tant qu'équipe technique,
je veux relier hypothèses, personnes et questions,
afin de produire un plan d'entretien exploitable.

### Critères d'acceptation

- HypothesisPerson permet d'associer personnes et hypothèses.
- Priorité par personne.
- Fiche entretien générée.
- Statuts d'entretien : planned, done, cancelled.

---

## TS-020 — Créer l'export PDF / Word MVP

En tant qu'équipe technique,
je veux générer les livrables MVP,
afin que le consultant puisse restituer son travail.

### Critères d'acceptation

- Export Besoin Validé.
- Export Modèle Théorique.
- Export Modèle Observé.
- Export Carte des Écarts.
- Export Pré-Diagnostic.
- Export Plan d'Investigation.
- Export Synthèse.
- Les exports distinguent faits, hypothèses et compréhensions retenues.

---

## TS-021 — Créer les seeds de référentiel

En tant qu'équipe technique,
je veux charger les définitions de phénomènes,
afin d'initialiser l'application avec le référentiel Diagnostic Flash.

### Critères d'acceptation

- Seed PhenomenonDefinition.
- Seed mappings canoniques courants.
- Seed exemples de données démo.
- Commande npm dédiée.
