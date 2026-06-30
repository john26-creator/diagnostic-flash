CREATE TABLE "DemoDatasetTemplate" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "estimatedTickets" INTEGER NOT NULL,
  "estimatedProjects" INTEGER NOT NULL,
  "estimatedBoards" INTEGER NOT NULL,
  "expectedPhenomena" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DemoDatasetTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DemoDatasetLoaded" (
  "id" TEXT NOT NULL,
  "missionId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "loadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DemoDatasetLoaded_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DemoDatasetTemplate_code_key" ON "DemoDatasetTemplate"("code");
CREATE INDEX "DemoDatasetLoaded_missionId_idx" ON "DemoDatasetLoaded"("missionId");
CREATE INDEX "DemoDatasetLoaded_templateId_idx" ON "DemoDatasetLoaded"("templateId");
CREATE INDEX "DemoDatasetLoaded_isActive_idx" ON "DemoDatasetLoaded"("isActive");

ALTER TABLE "DemoDatasetLoaded" ADD CONSTRAINT "DemoDatasetLoaded_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DemoDatasetLoaded" ADD CONSTRAINT "DemoDatasetLoaded_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "DemoDatasetTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
