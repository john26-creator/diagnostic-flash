CREATE TABLE "DemoDataset" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DemoDataset_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "JiraProject" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraBoard" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraWorkflow" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraWorkflowStep" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraStatus" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssue" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssueTransition" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssueComment" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssueLink" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraSprint" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssueSprint" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "JiraIssueEstimateHistory" ADD COLUMN "datasetId" TEXT;
ALTER TABLE "ExpectedPhenomenon" ADD COLUMN "datasetId" TEXT;

CREATE UNIQUE INDEX "DemoDataset_missionId_name_version_key" ON "DemoDataset"("missionId", "name", "version");
CREATE INDEX "DemoDataset_missionId_idx" ON "DemoDataset"("missionId");
CREATE INDEX "DemoDataset_isActive_idx" ON "DemoDataset"("isActive");
CREATE INDEX "JiraProject_datasetId_idx" ON "JiraProject"("datasetId");
CREATE INDEX "JiraBoard_datasetId_idx" ON "JiraBoard"("datasetId");
CREATE INDEX "JiraWorkflow_datasetId_idx" ON "JiraWorkflow"("datasetId");
CREATE INDEX "JiraWorkflowStep_datasetId_idx" ON "JiraWorkflowStep"("datasetId");
CREATE INDEX "JiraStatus_datasetId_idx" ON "JiraStatus"("datasetId");
CREATE INDEX "JiraIssue_datasetId_idx" ON "JiraIssue"("datasetId");
CREATE INDEX "JiraIssueTransition_datasetId_idx" ON "JiraIssueTransition"("datasetId");
CREATE INDEX "JiraIssueComment_datasetId_idx" ON "JiraIssueComment"("datasetId");
CREATE INDEX "JiraIssueLink_datasetId_idx" ON "JiraIssueLink"("datasetId");
CREATE INDEX "JiraSprint_datasetId_idx" ON "JiraSprint"("datasetId");
CREATE INDEX "JiraIssueSprint_datasetId_idx" ON "JiraIssueSprint"("datasetId");
CREATE INDEX "JiraIssueEstimateHistory_datasetId_idx" ON "JiraIssueEstimateHistory"("datasetId");
CREATE INDEX "ExpectedPhenomenon_datasetId_idx" ON "ExpectedPhenomenon"("datasetId");

ALTER TABLE "DemoDataset" ADD CONSTRAINT "DemoDataset_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
