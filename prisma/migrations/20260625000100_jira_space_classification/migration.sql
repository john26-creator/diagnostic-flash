CREATE TYPE "JiraBoardLevel" AS ENUM ('PORTFOLIO', 'TRAIN', 'TEAM', 'SUPPORT_OPS', 'UNKNOWN');

CREATE TYPE "JiraClassificationStatus" AS ENUM ('DETECTED', 'CONFIRMED', 'CORRECTED', 'REJECTED');

ALTER TABLE "JiraBoard"
  ADD COLUMN "parentBoardId" TEXT,
  ADD COLUMN "level" "JiraBoardLevel" NOT NULL DEFAULT 'UNKNOWN',
  ADD COLUMN "correctedLevel" "JiraBoardLevel",
  ADD COLUMN "classificationStatus" "JiraClassificationStatus" NOT NULL DEFAULT 'DETECTED';

CREATE INDEX "JiraBoard_parentBoardId_idx" ON "JiraBoard"("parentBoardId");
CREATE INDEX "JiraBoard_level_idx" ON "JiraBoard"("level");
CREATE INDEX "JiraBoard_classificationStatus_idx" ON "JiraBoard"("classificationStatus");

ALTER TABLE "JiraBoard"
  ADD CONSTRAINT "JiraBoard_parentBoardId_fkey"
  FOREIGN KEY ("parentBoardId") REFERENCES "JiraBoard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
