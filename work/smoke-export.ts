import { renderPdf } from "../lib/exports/pdf-export";
import { renderSynthesisDocx } from "../lib/exports/docx-export";
import type { ExportDocument } from "../lib/exports/export-content";

const document: ExportDocument = {
  type: "synthesis",
  title: "Synthese d'investigation",
  clientName: "Client Demo",
  missionName: "Mission Demo",
  consultant: "Consultant Demo",
  generatedAt: new Date("2026-06-24T08:00:00Z"),
  missionStatus: "SYNTHESIS_READY",
  guardrail: "Aucun diagnostic automatique.",
  sections: [
    { title: "Faits observes avec preuves", rows: ["Observation A", "Preuve : METRIC validation_concentration"] },
    { title: "Hypotheses", rows: ["Hypothese possible, non concluante"] }
  ]
};

async function main() {
  const pdf = await renderPdf(document);
  const docx = await renderSynthesisDocx(document);

  console.log(JSON.stringify({ pdfBytes: pdf.byteLength, docxBytes: docx.byteLength }));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
