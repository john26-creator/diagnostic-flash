ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'ORGANIGRAMME';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'FICHE_POSTE';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'PROCESSUS';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'MODE_OPERATOIRE';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'WORKFLOW_JIRA';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'AUTRE';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'INCIDENT';

CREATE TYPE "SourceStatut" AS ENUM ('IMPORTEE', 'ANALYSEE', 'UTILISEE', 'ERREUR');

CREATE TABLE "SourceDocumentaire" (
    "id" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "fichierNom" TEXT,
    "fichierPath" TEXT,
    "fichierTaille" INTEGER,
    "referenceUrl" TEXT,
    "statut" "SourceStatut" NOT NULL DEFAULT 'IMPORTEE',
    "dateAjout" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceDocumentaire_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SourceDocumentaire_missionId_idx" ON "SourceDocumentaire"("missionId");
CREATE INDEX "SourceDocumentaire_type_idx" ON "SourceDocumentaire"("type");
CREATE INDEX "SourceDocumentaire_statut_idx" ON "SourceDocumentaire"("statut");
CREATE INDEX "SourceDocumentaire_dateAjout_idx" ON "SourceDocumentaire"("dateAjout");

ALTER TABLE "SourceDocumentaire" ADD CONSTRAINT "SourceDocumentaire_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
