# Pipeline

1. Objectif

Le pipeline transforme des données hétérogènes issues de l'organisation en éléments exploitables pour le consultant :

observations
preuves
écarts
hypothèses
plan d'investigation

Le pipeline ne produit jamais de diagnostic.

Le diagnostic reste sous la responsabilité du consultant.

2. Vue d'ensemble
Besoin
↓
Sources
↓
Import brut
↓
Analyse configuration
↓
Mapping canonique
↓
Modèle observé
↓
Métriques
↓
Phénomènes
↓
Observations
↓
Écarts
↓
Hypothèses
↓
Plan d'investigation
↓
Synthèse
3. Étape 0 — Validation du besoin
Entrées
besoin brut
symptômes
périmètre initial
Traitements IA

Détection :

omissions
généralisations
nominalisations
ambiguïtés
manque de contexte
Sorties
Validated Need
Symptoms
Clarification Questions
4. Étape 1 — Import des sources
Sources supportées MVP
Jira

Import :

Issues
Changelog
Comments
Sprints
Boards
Workflows
Custom Fields
Organigramme

Import :

personnes
rôles
hiérarchie
SLA

Import :

délais
pénalités
règles d'escalade
Documentation

Import :

PDF
Word
PowerPoint
Sortie
RawData
5. Étape 2 — Analyse de configuration

Objectif :

Comprendre comment Jira est configuré.

Détection
Types

Exemples :

Epic
Initiative
Capability
Story
Task
Bug
Workflows

Détection :

Open
In Progress
Ready For UAT
Done
Champs

Détection :

Story Points
Business Value
WSJF
PI
Rôles

Extraction :

assignees
validateurs
commentateurs
Sorties
DetectedConfiguration
6. Étape 3 — Mapping canonique

Objectif :

Traduire le langage local vers le modèle interne.

Mapping des artefacts

Exemple :

Epic Jira
↓
Feature
Mapping des statuts

Exemple :

Ready For UAT
↓
VALIDATION
Mapping des rôles

Exemple :

Delivery Manager
↓
RTE
Validation consultant

Le consultant valide tous les mappings.

Sorties
ArtifactMapping
RoleMapping
StatusMapping
7. Étape 4 — Construction du modèle observé

Objectif :

Reconstruire le fonctionnement réel.

Construction du portefeuille
Initiative
↓
Epic
↓
Feature
Construction du delivery
Feature
↓
Story
↓
Task
Intégration
Technical Stories
Enablers
Bugs
Incidents
Reconstruction des événements

À partir du changelog :

création
transition
commentaire
validation
blocage
Sorties
CanonicalArtifact
CanonicalEvent
ObservedModel
8. Étape 5 — Calcul des métriques

Objectif :

Produire les indicateurs nécessaires au référentiel.

Flux

Calcul :

Lead Time
Cycle Time
Waiting Ratio
WIP
Prévisibilité

Calcul :

Velocity
Churn
Commitment Reliability
Gouvernance

Calcul :

Validation Concentration
Escalation Rate
Valeur

Calcul :

Feature Age
Run Ratio
Business Ratio
Mesure

Calcul :

SP/JH
Estimation Accuracy
Sorties
Metric
9. Étape 6 — Détection des phénomènes

Objectif :

Appliquer le référentiel.

Exemple
GOV-01

Concentration validation

Entrée :

Validation concentration = 72 %

Résultat :

Observation candidate
Niveau critique
Familles analysées
Flux
Prévisibilité
Gouvernance
Valeur
Documentation
Robustesse
Mesure
Dépendances
Dette technique
Readiness
Rôles
Sorties
PhenomenonDetection
10. Étape 7 — Génération des observations

Objectif :

Présenter les phénomènes sous forme exploitable.

Structure
Observation
↓
Preuves
↓
Questions
Exemple
72 % des validations
sont réalisées
par Pierre.
Sorties
Observation
Proof
11. Étape 8 — Génération des écarts

Objectif :

Comparer théorie et réalité.

Comparaison
Rôles
PO valide

vs

PM valide
Flux
Validation attendue

vs

Validation observée
Sorties
Gap
12. Étape 9 — Génération des hypothèses

Objectif :

Associer aux observations les hypothèses du référentiel.

Exemple

Observation :

Validation concentrée

Hypothèses :

expertise rare
surcharge
manque de délégation
Important

Les hypothèses ne sont pas des conclusions.

Sorties
Hypothesis
InvestigationQuestion
13. Étape 10 — Construction du plan d'investigation

Objectif :

Préparer les entretiens.

Identification des personnes

À partir :

commentaires
validations
dépendances
rôles
Couverture
Hypothèse
↓
Personnes pertinentes
Sorties
InterviewPlan
14. Étape 11 — Synthèse

Objectif :

Produire les livrables.

IA autorisée
reformulation
structuration
synthèse
IA interdite
diagnostic automatique
décision automatique
plan d'action automatique
Sorties
InvestigationSynthesis
Deliverables
15. Principes fondamentaux
Principe 1

Un phénomène n'est pas une cause.

Principe 2

Une observation n'est pas une conclusion.

Principe 3

Une hypothèse n'est pas un diagnostic.

Principe 4

Toute observation doit être reliée à une preuve.

Principe 5

Le consultant reste responsable de la compréhension.

