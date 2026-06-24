1. Objectif

Le modèle canonique constitue la représentation interne utilisée par le moteur de diagnostic.

Tous les artefacts, rôles et workflows clients sont mappés vers ce modèle avant analyse.

2. Artefacts Canoniques
Portfolio
Initiative

Regroupement stratégique de plusieurs Epics.

Epic

Regroupement fonctionnel de plusieurs Features.

Feature

Élément de valeur planifié dans un PI.

Delivery Métier
User Story

Unité de travail métier.

Task

Sous-tâche associée à une User Story.

Delivery Technique
Technical Story

Travail technique sans valeur métier directe.

Exemples :

refactoring
mise à jour framework
optimisation performance
Enabler

Travail préparatoire permettant une future Feature.

Exemples :

architecture
infrastructure
sécurité
Maintenance
Bug

Défaut identifié.

Incident

Incident de production.

3. États Canoniques
Idea

Travail identifié mais non préparé.

Ready

Travail prêt à être démarré.

In Progress

Travail en cours.

Waiting

Travail bloqué ou en attente.

Exemples :

validation
dépendance
réponse métier
Validation

Travail terminé en attente d'approbation.

Done

Travail terminé et accepté.

4. Rôles Canoniques
Sponsor

Porteur stratégique.

PM

Gestion portefeuille.

PO

Responsable du backlog.

RTE

Coordination ART.

Architecte

Responsable cohérence technique.

Scrum Master

Facilitateur équipe.

BA

Analyse métier.

Développeur

Construction solution.

QA

Validation qualité.

Manager

Responsabilité hiérarchique.

5. Relations Canoniques
Initiative
  ↓
Epic
  ↓
Feature
  ↓
User Story
  ↓
Task

Relations alternatives :

Feature
  ↓
Technical Story
Feature
  ↓
Enabler
Incident
  ↓
Bug
6. Mapping Jira

Le système doit permettre le mapping de :

Types

Exemple :

Epic Jira
=
Feature Canonique
Statuts

Exemple :

Ready For UAT
=
Validation
Rôles

Exemple :

Delivery Manager
=
RTE
7. Validation du Mapping

Le consultant valide :

types
statuts
rôles

avant tout calcul.

8. Utilisation dans le Pipeline
Jira Client
↓
Scan Configuration
↓
Mapping Canonique
↓
Modèle Observé
↓
Métriques
↓
Phénomènes