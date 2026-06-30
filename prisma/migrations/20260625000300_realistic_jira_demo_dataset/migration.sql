CREATE TABLE "JiraIssue" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "jiraProjectId" TEXT NOT NULL,
  "jiraBoardId" TEXT NOT NULL,
  "jiraWorkflowId" TEXT,
  "parentIssueId" TEXT,
  "externalId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "issueType" TEXT NOT NULL,
  "priority" TEXT,
  "status" TEXT NOT NULL,
  "assignee" TEXT,
  "reporter" TEXT,
  "createdAtJira" TIMESTAMP(3) NOT NULL,
  "updatedAtJira" TIMESTAMP(3) NOT NULL,
  "resolvedAtJira" TIMESTAMP(3),
  "storyPoints" DOUBLE PRECISION,
  "originalEstimate" INTEGER,
  "remainingEstimate" INTEGER,
  "timeSpent" INTEGER,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JiraIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraIssueTransition" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "jiraIssueId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  "author" TEXT,
  "transitionedAt" TIMESTAMP(3) NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JiraIssueTransition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraIssueComment" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "jiraIssueId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAtJira" TIMESTAMP(3) NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JiraIssueComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraIssueLink" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "sourceIssueId" TEXT NOT NULL,
  "targetIssueId" TEXT NOT NULL,
  "linkType" TEXT NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JiraIssueLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraSprint" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "jiraBoardId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "goal" TEXT,
  "state" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JiraSprint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraIssueSprint" (
  "id" TEXT NOT NULL,
  "jiraIssueId" TEXT NOT NULL,
  "jiraSprintId" TEXT NOT NULL,
  "addedAt" TIMESTAMP(3) NOT NULL,
  "addedAfterStart" BOOLEAN NOT NULL DEFAULT false,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  CONSTRAINT "JiraIssueSprint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraIssueEstimateHistory" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT NOT NULL,
  "jiraIssueId" TEXT NOT NULL,
  "externalId" TEXT NOT NULL,
  "previousStoryPoints" DOUBLE PRECISION,
  "newStoryPoints" DOUBLE PRECISION,
  "previousEstimate" INTEGER,
  "newEstimate" INTEGER,
  "changedBy" TEXT NOT NULL,
  "changedAt" TIMESTAMP(3) NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  CONSTRAINT "JiraIssueEstimateHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpectedPhenomenon" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "jiraInstanceId" TEXT,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "concernedData" JSONB NOT NULL,
  "expectedResult" TEXT NOT NULL,
  "investigationQuestions" JSONB NOT NULL,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "demoDatasetName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExpectedPhenomenon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JiraIssue_jiraInstanceId_externalId_key" ON "JiraIssue"("jiraInstanceId", "externalId");
CREATE UNIQUE INDEX "JiraIssue_jiraInstanceId_key_key" ON "JiraIssue"("jiraInstanceId", "key");
CREATE INDEX "JiraIssue_missionId_idx" ON "JiraIssue"("missionId");
CREATE INDEX "JiraIssue_jiraInstanceId_idx" ON "JiraIssue"("jiraInstanceId");
CREATE INDEX "JiraIssue_jiraProjectId_idx" ON "JiraIssue"("jiraProjectId");
CREATE INDEX "JiraIssue_jiraBoardId_idx" ON "JiraIssue"("jiraBoardId");
CREATE INDEX "JiraIssue_jiraWorkflowId_idx" ON "JiraIssue"("jiraWorkflowId");
CREATE INDEX "JiraIssue_parentIssueId_idx" ON "JiraIssue"("parentIssueId");
CREATE INDEX "JiraIssue_issueType_idx" ON "JiraIssue"("issueType");
CREATE INDEX "JiraIssue_status_idx" ON "JiraIssue"("status");
CREATE INDEX "JiraIssue_isDemo_idx" ON "JiraIssue"("isDemo");
CREATE INDEX "JiraIssue_demoDatasetName_idx" ON "JiraIssue"("demoDatasetName");
CREATE UNIQUE INDEX "JiraIssueTransition_jiraIssueId_externalId_key" ON "JiraIssueTransition"("jiraIssueId", "externalId");
CREATE INDEX "JiraIssueTransition_missionId_idx" ON "JiraIssueTransition"("missionId");
CREATE INDEX "JiraIssueTransition_jiraInstanceId_idx" ON "JiraIssueTransition"("jiraInstanceId");
CREATE INDEX "JiraIssueTransition_jiraIssueId_idx" ON "JiraIssueTransition"("jiraIssueId");
CREATE INDEX "JiraIssueTransition_transitionedAt_idx" ON "JiraIssueTransition"("transitionedAt");
CREATE INDEX "JiraIssueTransition_isDemo_idx" ON "JiraIssueTransition"("isDemo");
CREATE INDEX "JiraIssueTransition_demoDatasetName_idx" ON "JiraIssueTransition"("demoDatasetName");
CREATE UNIQUE INDEX "JiraIssueComment_jiraIssueId_externalId_key" ON "JiraIssueComment"("jiraIssueId", "externalId");
CREATE INDEX "JiraIssueComment_missionId_idx" ON "JiraIssueComment"("missionId");
CREATE INDEX "JiraIssueComment_jiraInstanceId_idx" ON "JiraIssueComment"("jiraInstanceId");
CREATE INDEX "JiraIssueComment_jiraIssueId_idx" ON "JiraIssueComment"("jiraIssueId");
CREATE INDEX "JiraIssueComment_author_idx" ON "JiraIssueComment"("author");
CREATE INDEX "JiraIssueComment_isDemo_idx" ON "JiraIssueComment"("isDemo");
CREATE INDEX "JiraIssueComment_demoDatasetName_idx" ON "JiraIssueComment"("demoDatasetName");
CREATE UNIQUE INDEX "JiraIssueLink_sourceIssueId_targetIssueId_linkType_key" ON "JiraIssueLink"("sourceIssueId", "targetIssueId", "linkType");
CREATE INDEX "JiraIssueLink_missionId_idx" ON "JiraIssueLink"("missionId");
CREATE INDEX "JiraIssueLink_jiraInstanceId_idx" ON "JiraIssueLink"("jiraInstanceId");
CREATE INDEX "JiraIssueLink_sourceIssueId_idx" ON "JiraIssueLink"("sourceIssueId");
CREATE INDEX "JiraIssueLink_targetIssueId_idx" ON "JiraIssueLink"("targetIssueId");
CREATE INDEX "JiraIssueLink_isDemo_idx" ON "JiraIssueLink"("isDemo");
CREATE INDEX "JiraIssueLink_demoDatasetName_idx" ON "JiraIssueLink"("demoDatasetName");
CREATE UNIQUE INDEX "JiraSprint_jiraInstanceId_externalId_key" ON "JiraSprint"("jiraInstanceId", "externalId");
CREATE INDEX "JiraSprint_missionId_idx" ON "JiraSprint"("missionId");
CREATE INDEX "JiraSprint_jiraInstanceId_idx" ON "JiraSprint"("jiraInstanceId");
CREATE INDEX "JiraSprint_jiraBoardId_idx" ON "JiraSprint"("jiraBoardId");
CREATE INDEX "JiraSprint_isDemo_idx" ON "JiraSprint"("isDemo");
CREATE INDEX "JiraSprint_demoDatasetName_idx" ON "JiraSprint"("demoDatasetName");
CREATE UNIQUE INDEX "JiraIssueSprint_jiraIssueId_jiraSprintId_key" ON "JiraIssueSprint"("jiraIssueId", "jiraSprintId");
CREATE INDEX "JiraIssueSprint_jiraIssueId_idx" ON "JiraIssueSprint"("jiraIssueId");
CREATE INDEX "JiraIssueSprint_jiraSprintId_idx" ON "JiraIssueSprint"("jiraSprintId");
CREATE INDEX "JiraIssueSprint_isDemo_idx" ON "JiraIssueSprint"("isDemo");
CREATE INDEX "JiraIssueSprint_demoDatasetName_idx" ON "JiraIssueSprint"("demoDatasetName");
CREATE UNIQUE INDEX "JiraIssueEstimateHistory_jiraIssueId_externalId_key" ON "JiraIssueEstimateHistory"("jiraIssueId", "externalId");
CREATE INDEX "JiraIssueEstimateHistory_missionId_idx" ON "JiraIssueEstimateHistory"("missionId");
CREATE INDEX "JiraIssueEstimateHistory_jiraInstanceId_idx" ON "JiraIssueEstimateHistory"("jiraInstanceId");
CREATE INDEX "JiraIssueEstimateHistory_jiraIssueId_idx" ON "JiraIssueEstimateHistory"("jiraIssueId");
CREATE INDEX "JiraIssueEstimateHistory_changedAt_idx" ON "JiraIssueEstimateHistory"("changedAt");
CREATE INDEX "JiraIssueEstimateHistory_isDemo_idx" ON "JiraIssueEstimateHistory"("isDemo");
CREATE INDEX "JiraIssueEstimateHistory_demoDatasetName_idx" ON "JiraIssueEstimateHistory"("demoDatasetName");
CREATE UNIQUE INDEX "ExpectedPhenomenon_missionId_demoDatasetName_code_key" ON "ExpectedPhenomenon"("missionId", "demoDatasetName", "code");
CREATE INDEX "ExpectedPhenomenon_missionId_idx" ON "ExpectedPhenomenon"("missionId");
CREATE INDEX "ExpectedPhenomenon_jiraInstanceId_idx" ON "ExpectedPhenomenon"("jiraInstanceId");
CREATE INDEX "ExpectedPhenomenon_code_idx" ON "ExpectedPhenomenon"("code");
CREATE INDEX "ExpectedPhenomenon_isDemo_idx" ON "ExpectedPhenomenon"("isDemo");
CREATE INDEX "ExpectedPhenomenon_demoDatasetName_idx" ON "ExpectedPhenomenon"("demoDatasetName");

ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_jiraProjectId_fkey" FOREIGN KEY ("jiraProjectId") REFERENCES "JiraProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_jiraBoardId_fkey" FOREIGN KEY ("jiraBoardId") REFERENCES "JiraBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_jiraWorkflowId_fkey" FOREIGN KEY ("jiraWorkflowId") REFERENCES "JiraWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JiraIssue" ADD CONSTRAINT "JiraIssue_parentIssueId_fkey" FOREIGN KEY ("parentIssueId") REFERENCES "JiraIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JiraIssueTransition" ADD CONSTRAINT "JiraIssueTransition_jiraIssueId_fkey" FOREIGN KEY ("jiraIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueComment" ADD CONSTRAINT "JiraIssueComment_jiraIssueId_fkey" FOREIGN KEY ("jiraIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueLink" ADD CONSTRAINT "JiraIssueLink_sourceIssueId_fkey" FOREIGN KEY ("sourceIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueLink" ADD CONSTRAINT "JiraIssueLink_targetIssueId_fkey" FOREIGN KEY ("targetIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraSprint" ADD CONSTRAINT "JiraSprint_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraSprint" ADD CONSTRAINT "JiraSprint_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraSprint" ADD CONSTRAINT "JiraSprint_jiraBoardId_fkey" FOREIGN KEY ("jiraBoardId") REFERENCES "JiraBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueSprint" ADD CONSTRAINT "JiraIssueSprint_jiraIssueId_fkey" FOREIGN KEY ("jiraIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueSprint" ADD CONSTRAINT "JiraIssueSprint_jiraSprintId_fkey" FOREIGN KEY ("jiraSprintId") REFERENCES "JiraSprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraIssueEstimateHistory" ADD CONSTRAINT "JiraIssueEstimateHistory_jiraIssueId_fkey" FOREIGN KEY ("jiraIssueId") REFERENCES "JiraIssue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpectedPhenomenon" ADD CONSTRAINT "ExpectedPhenomenon_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExpectedPhenomenon" ADD CONSTRAINT "ExpectedPhenomenon_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
