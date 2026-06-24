CREATE TYPE "JiraConnectionStatus" AS ENUM ('NOT_CONFIGURED', 'SAVED', 'CONNECTED', 'ERROR');
CREATE TYPE "JiraWorkflowType" AS ENUM ('TRAIN', 'TEAM', 'UNKNOWN');

CREATE TABLE "JiraInstance" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "apiTokenEncrypted" TEXT,
    "instanceName" TEXT,
    "status" "JiraConnectionStatus" NOT NULL DEFAULT 'NOT_CONFIGURED',
    "lastTestedAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraProject" (
    "id" TEXT NOT NULL,
    "jiraInstanceId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraProject_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraBoard" (
    "id" TEXT NOT NULL,
    "jiraInstanceId" TEXT NOT NULL,
    "projectId" TEXT,
    "externalId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraBoard_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraWorkflow" (
    "id" TEXT NOT NULL,
    "jiraInstanceId" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "JiraWorkflowType" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraWorkflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraWorkflowStep" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraWorkflowStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JiraStatus" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "externalId" TEXT,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JiraStatus_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JiraInstance_missionId_key" ON "JiraInstance"("missionId");
CREATE INDEX "JiraInstance_status_idx" ON "JiraInstance"("status");
CREATE UNIQUE INDEX "JiraProject_jiraInstanceId_externalId_key" ON "JiraProject"("jiraInstanceId", "externalId");
CREATE UNIQUE INDEX "JiraProject_jiraInstanceId_key_key" ON "JiraProject"("jiraInstanceId", "key");
CREATE INDEX "JiraProject_jiraInstanceId_idx" ON "JiraProject"("jiraInstanceId");
CREATE UNIQUE INDEX "JiraBoard_jiraInstanceId_externalId_key" ON "JiraBoard"("jiraInstanceId", "externalId");
CREATE INDEX "JiraBoard_jiraInstanceId_idx" ON "JiraBoard"("jiraInstanceId");
CREATE INDEX "JiraBoard_projectId_idx" ON "JiraBoard"("projectId");
CREATE UNIQUE INDEX "JiraWorkflow_boardId_key" ON "JiraWorkflow"("boardId");
CREATE INDEX "JiraWorkflow_jiraInstanceId_idx" ON "JiraWorkflow"("jiraInstanceId");
CREATE INDEX "JiraWorkflow_type_idx" ON "JiraWorkflow"("type");
CREATE UNIQUE INDEX "JiraWorkflowStep_workflowId_order_key" ON "JiraWorkflowStep"("workflowId", "order");
CREATE INDEX "JiraWorkflowStep_workflowId_idx" ON "JiraWorkflowStep"("workflowId");
CREATE UNIQUE INDEX "JiraStatus_stepId_name_key" ON "JiraStatus"("stepId", "name");
CREATE INDEX "JiraStatus_stepId_idx" ON "JiraStatus"("stepId");
CREATE INDEX "JiraStatus_externalId_idx" ON "JiraStatus"("externalId");

ALTER TABLE "JiraInstance" ADD CONSTRAINT "JiraInstance_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraProject" ADD CONSTRAINT "JiraProject_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraBoard" ADD CONSTRAINT "JiraBoard_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraBoard" ADD CONSTRAINT "JiraBoard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "JiraProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JiraWorkflow" ADD CONSTRAINT "JiraWorkflow_jiraInstanceId_fkey" FOREIGN KEY ("jiraInstanceId") REFERENCES "JiraInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraWorkflow" ADD CONSTRAINT "JiraWorkflow_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "JiraBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraWorkflowStep" ADD CONSTRAINT "JiraWorkflowStep_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "JiraWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JiraStatus" ADD CONSTRAINT "JiraStatus_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "JiraWorkflowStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
