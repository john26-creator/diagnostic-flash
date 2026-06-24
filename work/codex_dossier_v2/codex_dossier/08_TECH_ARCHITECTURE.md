1. Objectif

Le système est une plateforme SaaS multi-clients permettant à un consultant de réaliser des diagnostics organisationnels augmentés par IA.

Le MVP doit :

supporter plusieurs clients
supporter plusieurs missions par client
importer et analyser des données Jira
produire des observations, hypothèses et plans d'investigation
rester simple à maintenir
2. Architecture retenue
Type

Monolithe modulaire.

Justification

Le MVP privilégie :

simplicité
rapidité de développement
faible coût d'exploitation
Stack
Frontend
NextJS 15
TypeScript
Tailwind
Shadcn UI
Backend
NextJS Route Handlers
Server Actions
Base de données
PostgreSQL
ORM
Prisma
Authentification
NextAuth
IA
OpenAI API

Utilisation limitée à :

clarification du besoin
génération des questions
synthèse d'investigation

Les calculs et détections restent déterministes.

3. Architecture logique
Client Web
      ↓
NextJS
      ↓
Services Métier
      ↓
Prisma
      ↓
PostgreSQL
4. Modules métier
MissionService

Responsabilités :

création mission
mise à jour mission
progression mission
ImportService

Responsabilités :

import Jira
import documents
stockage brut
MappingService

Responsabilités :

mapping artefacts
mapping rôles
mapping statuts
CanonicalModelService

Responsabilités :

construction du modèle canonique
AnalysisService

Responsabilités :

calcul métriques
détection phénomènes
InvestigationService

Responsabilités :

hypothèses
questions
plan d'échantillonnage
ReportingService

Responsabilités :

synthèse
export PDF
export Word
5. Modèle multi-clients
Hiérarchie
User
 ↓
Client
 ↓
Mission
Règles

Un utilisateur peut gérer plusieurs clients.

Un client peut posséder plusieurs missions.

Une mission appartient à un seul client.

6. Entités principales
User
id
email
name
role
createdAt
Client
id
name
description
createdAt
Mission
id
clientId
name
description
startDate
endDate
status
Source
id
missionId
type
filePath
Observation
id
missionId
phenomenonId
description
severity
Hypothesis
id
missionId
description
status
7. Pipeline technique
Étape 1

Import brut.

Tables :

RawIssue
RawComment
RawTransition
RawSprint
RawDocument
Étape 2

Analyse configuration.

Tables :

DetectedWorkflow
DetectedIssueType
DetectedStatus
Étape 3

Mapping.

Tables :

ArtifactMapping
RoleMapping
StatusMapping
Étape 4

Construction canonique.

Tables :

CanonicalArtifact
CanonicalRole
CanonicalStatus
Étape 5

Calcul métriques.

Tables :

Metric
Étape 6

Détection phénomènes.

Tables :

PhenomenonDetection
Observation
Proof
Étape 7

Investigation.

Tables :

Hypothesis
InterviewPlan
8. API
Missions
POST /api/missions
GET /api/missions
GET /api/missions/:id
PUT /api/missions/:id
Import
POST /api/import/jira
POST /api/import/document
Mapping
POST /api/mapping
GET /api/mapping
Analyse
POST /api/analysis/run
GET /api/observations
GET /api/hypotheses
Reporting
GET /api/report/pdf
GET /api/report/docx
9. Sécurité
Authentification

NextAuth.

Autorisations

Chaque utilisateur ne peut accéder qu'à :

ses clients
ses missions
ses observations
Chiffrement
HTTPS obligatoire
secrets stockés dans variables d'environnement
10. Déploiement
MVP
Vercel
+
Supabase PostgreSQL
Sauvegarde

Sauvegarde quotidienne base PostgreSQL.

11. Évolutions futures
V2
Workers d'analyse asynchrones
Analyse Confluence native
Connecteur Azure DevOps
Connecteur ServiceNow
V3
Moteur probabiliste
Pondération automatique des hypothèses
Base de connaissance des diagnostics passés