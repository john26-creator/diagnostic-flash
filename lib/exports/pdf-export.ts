import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { ExportDocument } from "@/lib/exports/export-content";

const NIGHT = rgb(11 / 255, 31 / 255, 58 / 255);
const GOLD = rgb(200 / 255, 169 / 255, 107 / 255);
const GREY = rgb(107 / 255, 114 / 255, 128 / 255);
const IVORY = rgb(248 / 255, 247 / 255, 244 / 255);
const WHITE = rgb(1, 1, 1);

export async function renderPdf(document: ExportDocument) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ctx = { pdf, regular, bold, page: pdf.addPage(), y: 0 };
  drawCover(ctx, document);
  newPage(ctx);
  drawPageHeader(ctx, document.title);
  drawParagraph(ctx, document.guardrail, 10, GREY);
  gap(ctx, 14);

  for (const section of document.sections) {
    ensureSpace(ctx, 90);
    drawHeading(ctx, section.title);
    for (const row of section.rows) {
      drawBullet(ctx, row);
    }
    gap(ctx, 8);
  }

  return pdf.save();
}

function drawCover(ctx: DrawContext, document: ExportDocument) {
  const { page, bold, regular } = ctx;
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: 0, width, height, color: IVORY });
  page.drawRectangle({ x: 0, y: height - 118, width, height: 118, color: NIGHT });
  page.drawRectangle({ x: 56, y: height - 132, width: 170, height: 5, color: GOLD });
  page.drawText("Diagnostic Flash IA", { x: 56, y: height - 70, size: 22, font: bold, color: WHITE });
  page.drawText(document.title, { x: 56, y: height - 210, size: 25, font: bold, color: NIGHT });
  page.drawText(document.clientName, { x: 56, y: height - 252, size: 16, font: bold, color: NIGHT });
  page.drawText(document.missionName, { x: 56, y: height - 278, size: 12, font: regular, color: GREY });
  const meta = [
    `Consultant : ${document.consultant}`,
    `Statut mission : ${document.missionStatus}`,
    `Date de generation : ${formatDate(document.generatedAt)}`
  ];
  meta.forEach((line, index) => page.drawText(line, { x: 56, y: height - 340 - index * 20, size: 11, font: regular, color: NIGHT }));
  page.drawText("Aucun diagnostic automatique. Les hypotheses restent des pistes d'investigation.", {
    x: 56,
    y: 86,
    size: 10,
    font: regular,
    color: GREY
  });
}

function newPage(ctx: DrawContext) {
  ctx.page = ctx.pdf.addPage();
  ctx.y = ctx.page.getSize().height - 58;
  ctx.page.drawRectangle({ x: 0, y: 0, width: ctx.page.getSize().width, height: ctx.page.getSize().height, color: IVORY });
}

function drawPageHeader(ctx: DrawContext, title: string) {
  const { page, bold } = ctx;
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 46, width, height: 46, color: NIGHT });
  page.drawText(title, { x: 42, y: height - 29, size: 13, font: bold, color: WHITE });
  page.drawRectangle({ x: 42, y: height - 51, width: width - 84, height: 2, color: GOLD });
}

function drawHeading(ctx: DrawContext, text: string) {
  drawParagraph(ctx, text, 13, NIGHT, ctx.bold);
  ctx.page.drawRectangle({ x: 42, y: ctx.y + 5, width: 120, height: 1.4, color: GOLD });
  gap(ctx, 5);
}

function drawBullet(ctx: DrawContext, text: string) {
  const lines = wrap(text, ctx.regular, 10, 88);
  ensureSpace(ctx, lines.length * 13 + 6);
  ctx.page.drawText("-", { x: 50, y: ctx.y, size: 10, font: ctx.bold, color: GOLD });
  lines.forEach((line, index) => {
    ctx.page.drawText(line, { x: 66, y: ctx.y - index * 13, size: 10, font: ctx.regular, color: NIGHT });
  });
  ctx.y -= lines.length * 13 + 5;
}

function drawParagraph(ctx: DrawContext, text: string, size: number, color = NIGHT, font = ctx.regular) {
  const lines = wrap(text, font, size, 92);
  ensureSpace(ctx, lines.length * (size + 4) + 4);
  lines.forEach((line, index) => ctx.page.drawText(line, { x: 42, y: ctx.y - index * (size + 4), size, font, color }));
  ctx.y -= lines.length * (size + 4) + 4;
}

function ensureSpace(ctx: DrawContext, needed: number) {
  if (ctx.y - needed < 54) {
    newPage(ctx);
    drawPageHeader(ctx, "Diagnostic Flash IA");
  }
}

function gap(ctx: DrawContext, value: number) {
  ctx.y -= value;
}

function wrap(text: string, font: PDFFont, size: number, maxChars: number) {
  const words = sanitize(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars || font.widthOfTextAtSize(candidate, size) > 512) {
      if (line) lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ["Non renseigne"];
}

function sanitize(value: string) {
  return value.replace(/[•→↓]/g, "-").replace(/[“”]/g, '"').replace(/[’]/g, "'");
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(date);
}

type DrawContext = {
  pdf: PDFDocument;
  regular: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  y: number;
};
