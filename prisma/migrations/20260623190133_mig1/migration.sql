-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CONSULTANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'NEED_VALIDATED', 'THEORETICAL_MODEL_READY', 'DATA_IMPORTED', 'OBSERVED_MODEL_READY', 'GAPS_IDENTIFIED', 'INVESTIGATION_READY', 'SYNTHESIS_READY', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ClarificationType" AS ENUM ('OMISSION', 'GENERALISATION', 'NOMINALISATION', 'DISTORSION', 'AMBIGUITY', 'LACK_OF_CONTEXT');

-- CreateEnum
CREATE TYPE "ClarificationStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('JIRA', 'ORGANIGRAM', 'RACI', 'SLA', 'CONFLUENCE', 'DOCUMENT', 'CSV', 'MANUAL');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'CONNECTED', 'IMPORTED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RawDataType" AS ENUM ('RAW_JIRA_ISSUE', 'RAW_JIRA_COMMENT', 'RAW_JIRA_CHANGELOG', 'RAW_JIRA_SPRINT', 'RAW_JIRA_BOARD', 'RAW_JIRA_WORKFLOW', 'RAW_DOCUMENT', 'RAW_ORGANIGRAM', 'RAW_SLA');

-- CreateEnum
CREATE TYPE "DetectedConfigurationType" AS ENUM ('ISSUE_TYPE', 'STATUS', 'WORKFLOW', 'CUSTOM_FIELD', 'ROLE_LABEL', 'SPRINT_FIELD', 'PI_FIELD');

-- CreateEnum
CREATE TYPE "CanonicalStatus" AS ENUM ('IDEA', 'READY', 'IN_PROGRESS', 'WAITING', 'VALIDATION', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CanonicalRole" AS ENUM ('SPONSOR', 'PM', 'PO', 'RTE', 'ARCHITECT', 'SCRUM_MASTER', 'BA', 'DEV', 'QA', 'MANAGER', 'OTHER');

-- CreateEnum
CREATE TYPE "RaciLevel" AS ENUM ('R', 'A', 'C', 'I');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('INITIATIVE', 'EPIC', 'FEATURE', 'USER_STORY', 'TECHNICAL_STORY', 'ENABLER', 'TASK', 'BUG', 'INCIDENT');

-- CreateEnum
CREATE TYPE "CanonicalEventType" AS ENUM ('CREATED', 'STATUS_CHANGED', 'COMMENTED', 'DESCRIPTION_CHANGED', 'ASSIGNEE_CHANGED', 'PRIORITY_CHANGED', 'STORY_POINTS_CHANGED', 'SPRINT_CHANGED', 'PARENT_CHANGED', 'VALIDATED', 'BLOCKED', 'UNBLOCKED', 'MENTIONED');

-- CreateEnum
CREATE TYPE "DetectionLevel" AS ENUM ('INFORMATION', 'ATTENTION', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ObservationStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'REJECTED', 'TO_INVESTIGATE');

-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('TICKET', 'COMMENT', 'STATUS_CHANGE', 'FIELD_CHANGE', 'SPRINT_CHANGE', 'DOCUMENT', 'METRIC');

-- CreateEnum
CREATE TYPE "GapClassification" AS ENUM ('COHERENT', 'LOCAL_VARIANT', 'SURPRISING', 'VERY_SURPRISING');

-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('SUGGESTED', 'RETAINED', 'DISCARDED', 'VALIDATED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "ConfidenceLabel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliverableType" AS ENUM ('VALIDATED_NEED', 'THEORETICAL_MODEL', 'OBSERVED_MODEL', 'GAP_MAP', 'PRE_DIAGNOSTIC', 'INVESTIGATION_PLAN', 'INVESTIGATION_SYNTHESIS');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('DRAFT', 'GENERATED', 'VALIDATED', 'EXPORTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CONSULTANT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mission" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "investigationStartDate" TIMESTAMP(3),
    "investigationEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Need" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "rawNeed" TEXT,
    "validatedNeed" TEXT,
    "investigationPurpose" TEXT,
    "initialScope" TEXT,
    "observedScope" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Need_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" TEXT NOT NULL,
    "needId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIClarification" (
    "id" TEXT NOT NULL,
    "needId" TEXT NOT NULL,
    "type" "ClarificationType" NOT NULL,
    "sourceText" TEXT,
    "question" TEXT NOT NULL,
    "status" "ClarificationStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIClarification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "connectionInfo" JSONB,
    "filePath" TEXT,
    "importedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawData" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "RawDataType" NOT NULL,
    "externalId" TEXT,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetectedConfiguration" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "DetectedConfigurationType" NOT NULL,
    "name" TEXT NOT NULL,
    "rawValue" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DetectedConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtifactMapping" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "localName" TEXT NOT NULL,
    "canonicalArtifactType" "ArtifactType" NOT NULL,
    "confidence" DOUBLE PRECISION,
    "validatedByConsultant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtifactMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusMapping" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "localStatus" TEXT NOT NULL,
    "canonicalStatus" "CanonicalStatus" NOT NULL,
    "meaning" TEXT,
    "validatedByConsultant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleMapping" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "localRole" TEXT NOT NULL,
    "canonicalRole" "CanonicalRole" NOT NULL,
    "validatedByConsultant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoleMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonicalRole" "CanonicalRole" NOT NULL DEFAULT 'OTHER',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "roleId" TEXT,
    "team" TEXT,
    "department" TEXT,
    "managerId" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaciAssignment" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "level" "RaciLevel" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaciAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoreticalFlow" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoreticalFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TheoreticalFlowStep" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "responsibleRoleId" TEXT,
    "validatorRoleId" TEXT,
    "expectedDuration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoreticalFlowStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonicalArtifact" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "sourceId" TEXT,
    "externalId" TEXT,
    "key" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "artifactType" "ArtifactType" NOT NULL,
    "status" "CanonicalStatus" NOT NULL DEFAULT 'IDEA',
    "parentId" TEXT,
    "creatorPersonId" TEXT,
    "assigneePersonId" TEXT,
    "createdAtExternal" TIMESTAMP(3),
    "updatedAtExternal" TIMESTAMP(3),
    "resolvedAtExternal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CanonicalArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanonicalEvent" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "personId" TEXT,
    "eventType" "CanonicalEventType" NOT NULL,
    "field" TEXT,
    "fromValue" TEXT,
    "toValue" TEXT,
    "content" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "sourceRawDataId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CanonicalEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "goal" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PI" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "scope" TEXT,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Metric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhenomenonDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "calculationDescription" TEXT,
    "defaultThresholdInfo" DOUBLE PRECISION,
    "defaultThresholdWarning" DOUBLE PRECISION,
    "defaultThresholdCritical" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhenomenonDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhenomenonDetection" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "phenomenonDefinitionId" TEXT NOT NULL,
    "metricId" TEXT,
    "level" "DetectionLevel" NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PhenomenonDetection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "phenomenonDetectionId" TEXT,
    "family" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "observedValue" DOUBLE PRECISION,
    "unit" TEXT,
    "level" "DetectionLevel" NOT NULL DEFAULT 'INFORMATION',
    "status" "ObservationStatus" NOT NULL DEFAULT 'PROPOSED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "artifactId" TEXT,
    "eventId" TEXT,
    "type" "ProofType" NOT NULL,
    "reference" TEXT,
    "description" TEXT,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gap" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "observationId" TEXT,
    "theoreticalElement" TEXT NOT NULL,
    "observedElement" TEXT NOT NULL,
    "classification" "GapClassification" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hypothesis" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "observationId" TEXT,
    "description" TEXT NOT NULL,
    "status" "HypothesisStatus" NOT NULL DEFAULT 'SUGGESTED',
    "confidenceLabel" "ConfidenceLabel" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hypothesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationQuestion" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "observationId" TEXT,
    "hypothesisId" TEXT,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestigationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HypothesisPerson" (
    "id" TEXT NOT NULL,
    "hypothesisId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "reason" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HypothesisPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "plannedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "InterviewStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestigationSynthesis" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "observedFacts" TEXT,
    "convergingElements" TEXT,
    "retainedUnderstandings" TEXT,
    "remainingUncertainties" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestigationSynthesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SynthesisObservation" (
    "id" TEXT NOT NULL,
    "synthesisId" TEXT NOT NULL,
    "observationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SynthesisObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SynthesisHypothesis" (
    "id" TEXT NOT NULL,
    "synthesisId" TEXT NOT NULL,
    "hypothesisId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SynthesisHypothesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "type" "DeliverableType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "filePath" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- CreateIndex
CREATE INDEX "Mission_clientId_idx" ON "Mission"("clientId");

-- CreateIndex
CREATE INDEX "Mission_userId_idx" ON "Mission"("userId");

-- CreateIndex
CREATE INDEX "Mission_status_idx" ON "Mission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Need_missionId_key" ON "Need"("missionId");

-- CreateIndex
CREATE INDEX "Symptom_needId_idx" ON "Symptom"("needId");

-- CreateIndex
CREATE INDEX "Symptom_missionId_idx" ON "Symptom"("missionId");

-- CreateIndex
CREATE INDEX "AIClarification_needId_idx" ON "AIClarification"("needId");

-- CreateIndex
CREATE INDEX "AIClarification_type_idx" ON "AIClarification"("type");

-- CreateIndex
CREATE INDEX "Source_missionId_idx" ON "Source"("missionId");

-- CreateIndex
CREATE INDEX "Source_type_idx" ON "Source"("type");

-- CreateIndex
CREATE INDEX "Source_status_idx" ON "Source"("status");

-- CreateIndex
CREATE INDEX "RawData_missionId_idx" ON "RawData"("missionId");

-- CreateIndex
CREATE INDEX "RawData_sourceId_idx" ON "RawData"("sourceId");

-- CreateIndex
CREATE INDEX "RawData_externalId_idx" ON "RawData"("externalId");

-- CreateIndex
CREATE INDEX "DetectedConfiguration_missionId_idx" ON "DetectedConfiguration"("missionId");

-- CreateIndex
CREATE INDEX "DetectedConfiguration_sourceId_idx" ON "DetectedConfiguration"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ArtifactMapping_missionId_localName_key" ON "ArtifactMapping"("missionId", "localName");

-- CreateIndex
CREATE UNIQUE INDEX "StatusMapping_missionId_localStatus_key" ON "StatusMapping"("missionId", "localStatus");

-- CreateIndex
CREATE UNIQUE INDEX "RoleMapping_missionId_localRole_key" ON "RoleMapping"("missionId", "localRole");

-- CreateIndex
CREATE INDEX "Role_missionId_idx" ON "Role"("missionId");

-- CreateIndex
CREATE INDEX "Person_missionId_idx" ON "Person"("missionId");

-- CreateIndex
CREATE INDEX "Person_roleId_idx" ON "Person"("roleId");

-- CreateIndex
CREATE INDEX "Person_managerId_idx" ON "Person"("managerId");

-- CreateIndex
CREATE INDEX "Activity_missionId_idx" ON "Activity"("missionId");

-- CreateIndex
CREATE INDEX "RaciAssignment_missionId_idx" ON "RaciAssignment"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "RaciAssignment_activityId_roleId_level_key" ON "RaciAssignment"("activityId", "roleId", "level");

-- CreateIndex
CREATE INDEX "TheoreticalFlow_missionId_idx" ON "TheoreticalFlow"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "TheoreticalFlowStep_flowId_order_key" ON "TheoreticalFlowStep"("flowId", "order");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_missionId_idx" ON "CanonicalArtifact"("missionId");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_sourceId_idx" ON "CanonicalArtifact"("sourceId");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_externalId_idx" ON "CanonicalArtifact"("externalId");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_key_idx" ON "CanonicalArtifact"("key");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_artifactType_idx" ON "CanonicalArtifact"("artifactType");

-- CreateIndex
CREATE INDEX "CanonicalArtifact_status_idx" ON "CanonicalArtifact"("status");

-- CreateIndex
CREATE INDEX "CanonicalEvent_missionId_idx" ON "CanonicalEvent"("missionId");

-- CreateIndex
CREATE INDEX "CanonicalEvent_artifactId_idx" ON "CanonicalEvent"("artifactId");

-- CreateIndex
CREATE INDEX "CanonicalEvent_personId_idx" ON "CanonicalEvent"("personId");

-- CreateIndex
CREATE INDEX "CanonicalEvent_eventType_idx" ON "CanonicalEvent"("eventType");

-- CreateIndex
CREATE INDEX "CanonicalEvent_occurredAt_idx" ON "CanonicalEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "Sprint_missionId_idx" ON "Sprint"("missionId");

-- CreateIndex
CREATE INDEX "PI_missionId_idx" ON "PI"("missionId");

-- CreateIndex
CREATE INDEX "Metric_missionId_idx" ON "Metric"("missionId");

-- CreateIndex
CREATE INDEX "Metric_code_idx" ON "Metric"("code");

-- CreateIndex
CREATE INDEX "Metric_family_idx" ON "Metric"("family");

-- CreateIndex
CREATE UNIQUE INDEX "PhenomenonDefinition_code_key" ON "PhenomenonDefinition"("code");

-- CreateIndex
CREATE INDEX "PhenomenonDetection_missionId_idx" ON "PhenomenonDetection"("missionId");

-- CreateIndex
CREATE INDEX "PhenomenonDetection_phenomenonDefinitionId_idx" ON "PhenomenonDetection"("phenomenonDefinitionId");

-- CreateIndex
CREATE INDEX "PhenomenonDetection_metricId_idx" ON "PhenomenonDetection"("metricId");

-- CreateIndex
CREATE INDEX "Observation_missionId_idx" ON "Observation"("missionId");

-- CreateIndex
CREATE INDEX "Observation_family_idx" ON "Observation"("family");

-- CreateIndex
CREATE INDEX "Observation_status_idx" ON "Observation"("status");

-- CreateIndex
CREATE INDEX "Proof_missionId_idx" ON "Proof"("missionId");

-- CreateIndex
CREATE INDEX "Proof_observationId_idx" ON "Proof"("observationId");

-- CreateIndex
CREATE INDEX "Proof_artifactId_idx" ON "Proof"("artifactId");

-- CreateIndex
CREATE INDEX "Proof_eventId_idx" ON "Proof"("eventId");

-- CreateIndex
CREATE INDEX "Gap_missionId_idx" ON "Gap"("missionId");

-- CreateIndex
CREATE INDEX "Gap_classification_idx" ON "Gap"("classification");

-- CreateIndex
CREATE INDEX "Hypothesis_missionId_idx" ON "Hypothesis"("missionId");

-- CreateIndex
CREATE INDEX "Hypothesis_observationId_idx" ON "Hypothesis"("observationId");

-- CreateIndex
CREATE INDEX "Hypothesis_status_idx" ON "Hypothesis"("status");

-- CreateIndex
CREATE INDEX "InvestigationQuestion_missionId_idx" ON "InvestigationQuestion"("missionId");

-- CreateIndex
CREATE INDEX "InvestigationQuestion_observationId_idx" ON "InvestigationQuestion"("observationId");

-- CreateIndex
CREATE INDEX "InvestigationQuestion_hypothesisId_idx" ON "InvestigationQuestion"("hypothesisId");

-- CreateIndex
CREATE UNIQUE INDEX "HypothesisPerson_hypothesisId_personId_key" ON "HypothesisPerson"("hypothesisId", "personId");

-- CreateIndex
CREATE INDEX "Interview_missionId_idx" ON "Interview"("missionId");

-- CreateIndex
CREATE INDEX "Interview_personId_idx" ON "Interview"("personId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InvestigationSynthesis_missionId_key" ON "InvestigationSynthesis"("missionId");

-- CreateIndex
CREATE UNIQUE INDEX "SynthesisObservation_synthesisId_observationId_key" ON "SynthesisObservation"("synthesisId", "observationId");

-- CreateIndex
CREATE UNIQUE INDEX "SynthesisHypothesis_synthesisId_hypothesisId_key" ON "SynthesisHypothesis"("synthesisId", "hypothesisId");

-- CreateIndex
CREATE INDEX "Deliverable_missionId_idx" ON "Deliverable"("missionId");

-- CreateIndex
CREATE INDEX "Deliverable_type_idx" ON "Deliverable"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Deliverable_missionId_type_version_key" ON "Deliverable"("missionId", "type", "version");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mission" ADD CONSTRAINT "Mission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Need" ADD CONSTRAINT "Need_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Symptom" ADD CONSTRAINT "Symptom_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIClarification" ADD CONSTRAINT "AIClarification_needId_fkey" FOREIGN KEY ("needId") REFERENCES "Need"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawData" ADD CONSTRAINT "RawData_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawData" ADD CONSTRAINT "RawData_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedConfiguration" ADD CONSTRAINT "DetectedConfiguration_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetectedConfiguration" ADD CONSTRAINT "DetectedConfiguration_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtifactMapping" ADD CONSTRAINT "ArtifactMapping_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusMapping" ADD CONSTRAINT "StatusMapping_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMapping" ADD CONSTRAINT "RoleMapping_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaciAssignment" ADD CONSTRAINT "RaciAssignment_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaciAssignment" ADD CONSTRAINT "RaciAssignment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaciAssignment" ADD CONSTRAINT "RaciAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoreticalFlow" ADD CONSTRAINT "TheoreticalFlow_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoreticalFlowStep" ADD CONSTRAINT "TheoreticalFlowStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "TheoreticalFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoreticalFlowStep" ADD CONSTRAINT "TheoreticalFlowStep_responsibleRoleId_fkey" FOREIGN KEY ("responsibleRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoreticalFlowStep" ADD CONSTRAINT "TheoreticalFlowStep_validatorRoleId_fkey" FOREIGN KEY ("validatorRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalArtifact" ADD CONSTRAINT "CanonicalArtifact_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalArtifact" ADD CONSTRAINT "CanonicalArtifact_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalArtifact" ADD CONSTRAINT "CanonicalArtifact_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CanonicalArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalArtifact" ADD CONSTRAINT "CanonicalArtifact_creatorPersonId_fkey" FOREIGN KEY ("creatorPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalArtifact" ADD CONSTRAINT "CanonicalArtifact_assigneePersonId_fkey" FOREIGN KEY ("assigneePersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalEvent" ADD CONSTRAINT "CanonicalEvent_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalEvent" ADD CONSTRAINT "CanonicalEvent_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "CanonicalArtifact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalEvent" ADD CONSTRAINT "CanonicalEvent_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CanonicalEvent" ADD CONSTRAINT "CanonicalEvent_sourceRawDataId_fkey" FOREIGN KEY ("sourceRawDataId") REFERENCES "RawData"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PI" ADD CONSTRAINT "PI_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Metric" ADD CONSTRAINT "Metric_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhenomenonDetection" ADD CONSTRAINT "PhenomenonDetection_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhenomenonDetection" ADD CONSTRAINT "PhenomenonDetection_phenomenonDefinitionId_fkey" FOREIGN KEY ("phenomenonDefinitionId") REFERENCES "PhenomenonDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhenomenonDetection" ADD CONSTRAINT "PhenomenonDetection_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_phenomenonDetectionId_fkey" FOREIGN KEY ("phenomenonDetectionId") REFERENCES "PhenomenonDetection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "CanonicalArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "CanonicalEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gap" ADD CONSTRAINT "Gap_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gap" ADD CONSTRAINT "Gap_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hypothesis" ADD CONSTRAINT "Hypothesis_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationQuestion" ADD CONSTRAINT "InvestigationQuestion_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationQuestion" ADD CONSTRAINT "InvestigationQuestion_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationQuestion" ADD CONSTRAINT "InvestigationQuestion_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HypothesisPerson" ADD CONSTRAINT "HypothesisPerson_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HypothesisPerson" ADD CONSTRAINT "HypothesisPerson_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestigationSynthesis" ADD CONSTRAINT "InvestigationSynthesis_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisObservation" ADD CONSTRAINT "SynthesisObservation_synthesisId_fkey" FOREIGN KEY ("synthesisId") REFERENCES "InvestigationSynthesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisObservation" ADD CONSTRAINT "SynthesisObservation_observationId_fkey" FOREIGN KEY ("observationId") REFERENCES "Observation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisHypothesis" ADD CONSTRAINT "SynthesisHypothesis_synthesisId_fkey" FOREIGN KEY ("synthesisId") REFERENCES "InvestigationSynthesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SynthesisHypothesis" ADD CONSTRAINT "SynthesisHypothesis_hypothesisId_fkey" FOREIGN KEY ("hypothesisId") REFERENCES "Hypothesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
