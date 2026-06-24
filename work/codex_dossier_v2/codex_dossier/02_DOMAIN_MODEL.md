# 02_DOMAIN_MODEL.md — Diagnostic Flash IA

## 1. Objectif du document

Ce document décrit le modèle de domaine métier de l'application **Diagnostic Flash IA**.

Il décrit les objets manipulés par le consultant pendant un diagnostic :

- clients ;
- missions ;
- besoins ;
- sources ;
- modèle théorique ;
- modèle canonique ;
- modèle observé ;
- observations ;
- preuves ;
- écarts ;
- hypothèses ;
- plan d'investigation ;
- synthèse ;
- livrables.

Le modèle doit supporter un fonctionnement **multi-client** : un consultant peut accompagner plusieurs clients, et un même client peut demander plusieurs missions sur des périmètres ou périodes différents.

---

## 2. Principes structurants

### 2.1 Multi-client natif

```text
User
  ↓
Client
  ↓
Mission
```

Un utilisateur peut gérer plusieurs clients.  
Un client peut avoir plusieurs missions.  
Une mission appartient à un seul client.

### 2.2 Séparation entre données brutes, données canoniques et données d'analyse

```text
Données brutes
  ↓
Données canoniques
  ↓
Données d'analyse
```

Les données brutes sont conservées sans interprétation.  
Les données canoniques traduisent le langage local du client dans le modèle interne.  
Les données d'analyse produisent les métriques, phénomènes, observations, preuves, écarts et hypothèses.

---

## 3. Entités principales

### 3.1 User

Représente un utilisateur de l'application.

Champs :

```text
id
email
name
role
createdAt
updatedAt
```

Relations :

```text
User 1 ─── n Client
User 1 ─── n Mission
```

Pour le MVP, le rôle principal est `CONSULTANT`.

---

### 3.2 Client

Représente une organisation accompagnée.

Champs :

```text
id
userId
name
description
industry
createdAt
updatedAt
```

Relations :

```text
Client n ─── 1 User
Client 1 ─── n Mission
```

---

### 3.3 Mission

Représente un diagnostic réalisé pour un client.

Champs :

```text
id
clientId
userId
name
description
status
createdAt
updatedAt
investigationStartDate
investigationEndDate
```

Relations :

```text
Mission n ─── 1 Client
Mission 1 ─── 1 Need
Mission 1 ─── n Source
Mission 1 ─── n Role
Mission 1 ─── n Activity
Mission 1 ─── n TheoreticalFlow
Mission 1 ─── n RawData
Mission 1 ─── n CanonicalArtifact
Mission 1 ─── n Observation
Mission 1 ─── n Gap
Mission 1 ─── n Hypothesis
Mission 1 ─── n Person
Mission 1 ─── n Interview
Mission 1 ─── 1 InvestigationSynthesis
Mission 1 ─── n Deliverable
```

Status possibles :

```text
DRAFT
NEED_VALIDATED
THEORETICAL_MODEL_READY
DATA_IMPORTED
OBSERVED_MODEL_READY
GAPS_IDENTIFIED
INVESTIGATION_READY
SYNTHESIS_READY
COMPLETED
ARCHIVED
```

---

## 4. Cadrage du besoin

### 4.1 Need

Représente le besoin validé avec le sponsor.

Champs :

```text
id
missionId
rawNeed
validatedNeed
investigationPurpose
initialScope
observedScope
createdAt
updatedAt
validatedAt
```

Relations :

```text
Need 1 ─── 1 Mission
Need 1 ─── n Symptom
Need 1 ─── n AIClarification
```

Le besoin ne décrit pas une promesse de transformation. Il définit ce que le diagnostic cherche à comprendre.

---

### 4.2 Symptom

Représente un symptôme exprimé par le sponsor.

Champs :

```text
id
needId
missionId
label
description
source
createdAt
```

Exemples :

```text
Décisions lentes
Retards fréquents
Dépendance à certains experts
Turnover
Incidents récurrents
Manque de visibilité
```

---

### 4.3 AIClarification

Représente une clarification proposée par l'IA après analyse du besoin brut.

Champs :

```text
id
needId
type
sourceText
question
status
createdAt
```

Types :

```text
OMISSION
GENERALISATION
NOMINALISATION
DISTORSION
AMBIGUITY
LACK_OF_CONTEXT
```

Status :

```text
PROPOSED
ACCEPTED
REJECTED
RESOLVED
```

---

## 5. Sources

### 5.1 Source

Représente une source importée ou connectée.

Champs :

```text
id
missionId
type
name
status
connectionInfo
filePath
importedAt
createdAt
updatedAt
```

Types :

```text
JIRA
ORGANIGRAM
RACI
SLA
CONFLUENCE
DOCUMENT
CSV
MANUAL
```

Status :

```text
PENDING
CONNECTED
IMPORTED
FAILED
ARCHIVED
```

---

### 5.2 RawData

Stocke les données brutes importées.

Champs :

```text
id
missionId
sourceId
type
externalId
payloadJson
createdAt
```

Types :

```text
RAW_JIRA_ISSUE
RAW_JIRA_COMMENT
RAW_JIRA_CHANGELOG
RAW_JIRA_SPRINT
RAW_JIRA_BOARD
RAW_JIRA_WORKFLOW
RAW_DOCUMENT
RAW_ORGANIGRAM
RAW_SLA
```

Les données brutes doivent être conservées pour auditabilité et recalcul.

---

## 6. Analyse de configuration & mapping

### 6.1 DetectedConfiguration

Résultat du scan automatique de la configuration locale.

Champs :

```text
id
missionId
sourceId
type
name
rawValue
metadataJson
createdAt
```

Types :

```text
ISSUE_TYPE
STATUS
WORKFLOW
CUSTOM_FIELD
ROLE_LABEL
SPRINT_FIELD
PI_FIELD
```

---

### 6.2 ArtifactMapping

Mappe un type local vers un artefact canonique.

Champs :

```text
id
missionId
localName
canonicalArtifactType
confidence
validatedByConsultant
createdAt
updatedAt
```

Exemples :

```text
Epic Jira = Feature canonique
Initiative Jira = Epic canonique
```

---

### 6.3 StatusMapping

Mappe un statut local vers un statut canonique.

Champs :

```text
id
missionId
localStatus
canonicalStatus
meaning
validatedByConsultant
createdAt
updatedAt
```

Statuts canoniques :

```text
IDEA
READY
IN_PROGRESS
WAITING
VALIDATION
DONE
CANCELLED
```

---

### 6.4 RoleMapping

Mappe un rôle local entreprise vers un rôle canonique.

Champs :

```text
id
missionId
localRole
canonicalRole
validatedByConsultant
createdAt
updatedAt
```

---

## 7. Organisation théorique

### 7.1 Role

Rôle théorique ou canonique utilisé dans la mission.

Champs :

```text
id
missionId
name
canonicalRole
description
createdAt
updatedAt
```

CanonicalRole :

```text
SPONSOR
PM
PO
RTE
ARCHITECT
SCRUM_MASTER
BA
DEV
QA
MANAGER
OTHER
```

---

### 7.2 Person

Personne identifiée dans l'organisation ou dans Jira.

Champs :

```text
id
missionId
name
email
roleId
team
department
managerId
source
createdAt
updatedAt
```

Relations :

```text
Person n ─── 1 Role
Person n ─── 1 Person manager
Person 1 ─── n Interview
```

---

### 7.3 Activity

Activité théorique du processus.

Champs :

```text
id
missionId
name
description
createdAt
updatedAt
```

---

### 7.4 RaciAssignment

Relation entre un rôle et une activité.

Champs :

```text
id
missionId
activityId
roleId
level
createdAt
updatedAt
```

Level :

```text
R
A
C
I
```

---

### 7.5 TheoreticalFlow

Flux théorique attendu.

Champs :

```text
id
missionId
name
description
createdAt
updatedAt
```

Relations :

```text
TheoreticalFlow 1 ─── n TheoreticalFlowStep
```

---

### 7.6 TheoreticalFlowStep

Étape du flux théorique.

Champs :

```text
id
flowId
order
name
description
responsibleRoleId
validatorRoleId
expectedDuration
createdAt
updatedAt
```

---

## 8. Modèle canonique observé

### 8.1 CanonicalArtifact

Objet de travail après mapping canonique.

Champs :

```text
id
missionId
sourceId
externalId
key
title
description
artifactType
status
parentId
creatorPersonId
assigneePersonId
createdAtExternal
updatedAtExternal
resolvedAtExternal
createdAt
updatedAt
```

ArtifactType :

```text
INITIATIVE
EPIC
FEATURE
USER_STORY
TECHNICAL_STORY
ENABLER
TASK
BUG
INCIDENT
```

Relations :

```text
CanonicalArtifact n ─── 1 CanonicalArtifact parent
CanonicalArtifact 1 ─── n CanonicalEvent
CanonicalArtifact 1 ─── n Proof
```

---

### 8.2 CanonicalEvent

Événement normalisé issu du changelog, des commentaires ou des transitions.

Champs :

```text
id
missionId
artifactId
personId
eventType
field
fromValue
toValue
content
occurredAt
sourceRawDataId
createdAt
```

EventType :

```text
CREATED
STATUS_CHANGED
COMMENTED
DESCRIPTION_CHANGED
ASSIGNEE_CHANGED
PRIORITY_CHANGED
STORY_POINTS_CHANGED
SPRINT_CHANGED
PARENT_CHANGED
VALIDATED
BLOCKED
UNBLOCKED
MENTIONED
```

Les validations peuvent être déduites des transitions, commentaires ou statuts mappés en `VALIDATION`.

---

### 8.3 Sprint

Sprint canonique.

Champs :

```text
id
missionId
externalId
name
goal
startDate
endDate
state
createdAt
updatedAt
```

---

### 8.4 PI

Program Increment canonique.

Champs :

```text
id
missionId
name
startDate
endDate
createdAt
updatedAt
```

---

## 9. Analyse

### 9.1 Metric

Métrique calculée par le pipeline.

Champs :

```text
id
missionId
code
family
label
value
unit
scope
periodStart
periodEnd
metadataJson
createdAt
```

Exemples :

```text
waiting_ratio
validation_concentration
sprint_churn
feature_readiness_delay
story_multi_sprint_ratio
```

---

### 9.2 PhenomenonDefinition

Définition d'un phénomène du référentiel.

Champs :

```text
id
code
family
name
description
calculationDescription
defaultThresholdInfo
defaultThresholdWarning
defaultThresholdCritical
createdAt
updatedAt
```

---

### 9.3 PhenomenonDetection

Instance détectée d'un phénomène sur une mission.

Champs :

```text
id
missionId
phenomenonDefinitionId
metricId
level
summary
details
createdAt
```

Level :

```text
INFORMATION
ATTENTION
CRITICAL
```

---

### 9.4 Observation

Observation présentée au consultant.

Champs :

```text
id
missionId
phenomenonDetectionId
family
title
description
observedValue
unit
level
status
createdAt
updatedAt
```

Status :

```text
PROPOSED
ACCEPTED
REJECTED
TO_INVESTIGATE
```

Une observation est un fait remarquable. Elle ne constitue pas une conclusion.

---

### 9.5 Proof

Preuve associée à une observation.

Champs :

```text
id
missionId
observationId
artifactId
eventId
type
reference
description
payloadJson
createdAt
```

Types :

```text
TICKET
COMMENT
STATUS_CHANGE
FIELD_CHANGE
SPRINT_CHANGE
DOCUMENT
METRIC
```

---

### 9.6 Gap

Écart entre modèle théorique et modèle observé.

Champs :

```text
id
missionId
observationId
theoreticalElement
observedElement
classification
description
createdAt
updatedAt
```

Classification :

```text
COHERENT
LOCAL_VARIANT
SURPRISING
VERY_SURPRISING
```

---

### 9.7 Hypothesis

Hypothèse proposée ou retenue.

Champs :

```text
id
missionId
observationId
description
status
confidenceLabel
createdAt
updatedAt
```

Status :

```text
SUGGESTED
RETAINED
DISCARDED
VALIDATED
INVALIDATED
```

ConfidenceLabel :

```text
LOW
MEDIUM
HIGH
```

En MVP, les hypothèses ne sont pas pondérées par un moteur probabiliste. Elles sont proposées via le référentiel.

---

### 9.8 InvestigationQuestion

Question d'investigation liée à une hypothèse ou observation.

Champs :

```text
id
missionId
observationId
hypothesisId
question
createdAt
```

---

## 10. Plan d'investigation

### 10.1 HypothesisPerson

Table de liaison entre hypothèses et personnes recommandées.

Champs :

```text
id
hypothesisId
personId
reason
priority
createdAt
```

Priority :

```text
LOW
MEDIUM
HIGH
```

---

### 10.2 Interview

Entretien mené avec une personne.

Champs :

```text
id
missionId
personId
plannedAt
completedAt
status
notes
createdAt
updatedAt
```

Status :

```text
PLANNED
DONE
CANCELLED
```

---

## 11. Synthèse et livrables

### 11.1 InvestigationSynthesis

Synthèse d'investigation.

Champs :

```text
id
missionId
observedFacts
convergingElements
retainedUnderstandings
remainingUncertainties
createdAt
updatedAt
```

Relations :

```text
InvestigationSynthesis n ─── n Observation via SynthesisObservation
InvestigationSynthesis n ─── n Hypothesis via SynthesisHypothesis
```

---

### 11.2 SynthesisObservation

Lien entre synthèse et observation.

Champs :

```text
id
synthesisId
observationId
createdAt
```

---

### 11.3 SynthesisHypothesis

Lien entre synthèse et hypothèse.

Champs :

```text
id
synthesisId
hypothesisId
createdAt
```

---

### 11.4 Deliverable

Livrable généré.

Champs :

```text
id
missionId
type
version
status
filePath
generatedAt
createdAt
```

Type :

```text
VALIDATED_NEED
THEORETICAL_MODEL
OBSERVED_MODEL
GAP_MAP
PRE_DIAGNOSTIC
INVESTIGATION_PLAN
INVESTIGATION_SYNTHESIS
```

Status :

```text
DRAFT
GENERATED
VALIDATED
EXPORTED
```

---

## 12. Cardinalités principales

```text
User 1 ─── n Client
Client 1 ─── n Mission

Mission 1 ─── 1 Need
Need 1 ─── n Symptom
Need 1 ─── n AIClarification

Mission 1 ─── n Source
Source 1 ─── n RawData

Mission 1 ─── n Role
Mission 1 ─── n Person
Mission 1 ─── n Activity
Role n ─── n Activity via RaciAssignment

Mission 1 ─── n TheoreticalFlow
TheoreticalFlow 1 ─── n TheoreticalFlowStep

Mission 1 ─── n CanonicalArtifact
CanonicalArtifact 1 ─── n CanonicalEvent
CanonicalArtifact n ─── 1 CanonicalArtifact parent

Mission 1 ─── n Metric
Metric 1 ─── n PhenomenonDetection

PhenomenonDetection 1 ─── n Observation
Observation 1 ─── n Proof
Observation 1 ─── n Gap
Observation 1 ─── n Hypothesis

Hypothesis n ─── n Person via HypothesisPerson

Person 1 ─── n Interview

Mission 1 ─── 1 InvestigationSynthesis
InvestigationSynthesis n ─── n Observation
InvestigationSynthesis n ─── n Hypothesis

Mission 1 ─── n Deliverable
```

---

## 13. Notes de conception

### 13.1 Le modèle est volontairement extensible

Les entités `RawData`, `CanonicalEvent`, `Metric`, `PhenomenonDefinition` et `Proof` permettent d'ajouter de nouvelles sources et de nouveaux phénomènes sans refondre le modèle.

### 13.2 L'auditabilité est centrale

Toute observation doit pouvoir être reliée à ses preuves.

### 13.3 Le consultant reste maître

Les observations et hypothèses sont proposées, mais le consultant peut les accepter, les rejeter ou les reformuler.

### 13.4 Le modèle doit supporter plusieurs missions par client

Un même client peut demander plusieurs diagnostics, sur des périmètres différents ou à des dates différentes.
