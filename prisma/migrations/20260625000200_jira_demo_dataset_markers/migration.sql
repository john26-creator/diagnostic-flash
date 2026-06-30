ALTER TABLE "JiraProject"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demoDatasetName" TEXT;

ALTER TABLE "JiraBoard"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demoDatasetName" TEXT;

ALTER TABLE "JiraWorkflow"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demoDatasetName" TEXT;

ALTER TABLE "JiraWorkflowStep"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demoDatasetName" TEXT;

ALTER TABLE "JiraStatus"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "demoDatasetName" TEXT;

CREATE INDEX "JiraProject_isDemo_idx" ON "JiraProject"("isDemo");
CREATE INDEX "JiraProject_demoDatasetName_idx" ON "JiraProject"("demoDatasetName");
CREATE INDEX "JiraBoard_isDemo_idx" ON "JiraBoard"("isDemo");
CREATE INDEX "JiraBoard_demoDatasetName_idx" ON "JiraBoard"("demoDatasetName");
CREATE INDEX "JiraWorkflow_isDemo_idx" ON "JiraWorkflow"("isDemo");
CREATE INDEX "JiraWorkflow_demoDatasetName_idx" ON "JiraWorkflow"("demoDatasetName");
CREATE INDEX "JiraWorkflowStep_isDemo_idx" ON "JiraWorkflowStep"("isDemo");
CREATE INDEX "JiraWorkflowStep_demoDatasetName_idx" ON "JiraWorkflowStep"("demoDatasetName");
CREATE INDEX "JiraStatus_isDemo_idx" ON "JiraStatus"("isDemo");
CREATE INDEX "JiraStatus_demoDatasetName_idx" ON "JiraStatus"("demoDatasetName");
