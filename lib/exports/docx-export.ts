import { AlignmentType, BorderStyle, Document, HeadingLevel, Packer, Paragraph, ShadingType, TextRun } from "docx";
import type { ExportDocument } from "@/lib/exports/export-content";

const NIGHT = "0B1F3A";
const GOLD = "C8A96B";
const IVORY = "F8F7F4";
const GREY = "6B7280";

export async function renderSynthesisDocx(document: ExportDocument) {
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "Normal",
          name: "Normal",
          run: { font: "Inter", size: 22, color: NIGHT },
          paragraph: { spacing: { after: 120, line: 300 } }
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { font: "Montserrat", bold: true, size: 30, color: NIGHT },
          paragraph: { spacing: { before: 280, after: 120 } }
        }
      ]
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 900, bottom: 900, left: 900 }
          }
        },
        children: [
          new Paragraph({
            shading: { type: ShadingType.CLEAR, color: "auto", fill: NIGHT },
            spacing: { after: 360 },
            children: [
              new TextRun({ text: "Diagnostic Flash IA", bold: true, color: "FFFFFF", size: 34, font: "Montserrat" }),
              new TextRun({ text: "\nSynthese d'investigation", color: "FFFFFF", size: 24, font: "Inter" })
            ]
          }),
          new Paragraph({ children: [new TextRun({ text: document.clientName, bold: true, size: 30, color: NIGHT, font: "Montserrat" })] }),
          new Paragraph({ children: [new TextRun({ text: document.missionName, size: 23, color: GREY, font: "Inter" })] }),
          meta(`Consultant : ${document.consultant}`),
          meta(`Statut mission : ${document.missionStatus}`),
          meta(`Date de generation : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(document.generatedAt)}`),
          divider(),
          callout(document.guardrail),
          ...document.sections.flatMap((section) => [
            new Paragraph({ text: section.title, heading: HeadingLevel.HEADING_1 }),
            ...section.rows.map((row) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: row, font: "Inter", color: NIGHT, size: 21 })]
              })
            )
          ])
        ]
      }
    ]
  });

  return Packer.toBuffer(doc);
}

function meta(text: string) {
  return new Paragraph({ children: [new TextRun({ text, color: GREY, size: 21, font: "Inter" })] });
}

function divider() {
  return new Paragraph({
    border: { bottom: { color: GOLD, space: 8, style: BorderStyle.SINGLE, size: 10 } },
    spacing: { before: 180, after: 180 }
  });
}

function callout(text: string) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, color: "auto", fill: IVORY },
    border: { left: { color: GOLD, style: BorderStyle.SINGLE, size: 16, space: 8 } },
    alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 220 },
    children: [new TextRun({ text, color: NIGHT, size: 21, font: "Inter" })]
  });
}
