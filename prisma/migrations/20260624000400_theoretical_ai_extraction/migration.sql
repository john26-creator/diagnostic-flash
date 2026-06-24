CREATE TYPE "ExtractionIAStatus" AS ENUM ('DETECTED', 'CONFIRMED', 'REJECTED');
CREATE TYPE "ExtractionIAKind" AS ENUM ('ROLE', 'RESPONSIBILITY', 'WORKFLOW_STEP', 'AMBIGUITY', 'QUESTION');

CREATE TABLE "TheoreticalExtraction" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "sourceDocumentaireId" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoreticalExtraction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TheoreticalExtractionItem" (
    "id" TEXT NOT NULL,
    "extractionId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "sourceDocumentaireId" TEXT,
    "kind" "ExtractionIAKind" NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "detectedRole" TEXT,
    "detectedActivity" TEXT,
    "workflowOrder" INTEGER,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "status" "ExtractionIAStatus" NOT NULL DEFAULT 'DETECTED',
    "correction" TEXT,
    "mappedCanonicalRole" "CanonicalRole",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TheoreticalExtractionItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TheoreticalExtraction_missionId_idx" ON "TheoreticalExtraction"("missionId");
CREATE INDEX "TheoreticalExtraction_sourceDocumentaireId_idx" ON "TheoreticalExtraction"("sourceDocumentaireId");
CREATE INDEX "TheoreticalExtractionItem_extractionId_idx" ON "TheoreticalExtractionItem"("extractionId");
CREATE INDEX "TheoreticalExtractionItem_missionId_idx" ON "TheoreticalExtractionItem"("missionId");
CREATE INDEX "TheoreticalExtractionItem_sourceDocumentaireId_idx" ON "TheoreticalExtractionItem"("sourceDocumentaireId");
CREATE INDEX "TheoreticalExtractionItem_kind_idx" ON "TheoreticalExtractionItem"("kind");
CREATE INDEX "TheoreticalExtractionItem_status_idx" ON "TheoreticalExtractionItem"("status");

ALTER TABLE "TheoreticalExtraction" ADD CONSTRAINT "TheoreticalExtraction_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TheoreticalExtraction" ADD CONSTRAINT "TheoreticalExtraction_sourceDocumentaireId_fkey" FOREIGN KEY ("sourceDocumentaireId") REFERENCES "SourceDocumentaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TheoreticalExtractionItem" ADD CONSTRAINT "TheoreticalExtractionItem_extractionId_fkey" FOREIGN KEY ("extractionId") REFERENCES "TheoreticalExtraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TheoreticalExtractionItem" ADD CONSTRAINT "TheoreticalExtractionItem_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TheoreticalExtractionItem" ADD CONSTRAINT "TheoreticalExtractionItem_sourceDocumentaireId_fkey" FOREIGN KEY ("sourceDocumentaireId") REFERENCES "SourceDocumentaire"("id") ON DELETE SET NULL ON UPDATE CASCADE;
