import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildExportDocument, isExportType } from "@/lib/exports/export-content";
import { renderPdf } from "@/lib/exports/pdf-export";
import { renderSynthesisDocx } from "@/lib/exports/docx-export";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ missionId: string; type: string }> }
) {
  const user = await requireUser();
  const { missionId, type } = await params;
  if (!isExportType(type)) {
    return NextResponse.json({ error: "Type d'export invalide." }, { status: 400 });
  }

  const format = request.nextUrl.searchParams.get("format") ?? "pdf";
  if (format !== "pdf" && format !== "docx") {
    return NextResponse.json({ error: "Format invalide." }, { status: 400 });
  }
  if (format === "docx" && type !== "synthesis") {
    return NextResponse.json({ error: "Le format DOCX est disponible pour la synthese." }, { status: 400 });
  }

  const document = await buildExportDocument(user.id, missionId, type);
  if (!document) {
    return NextResponse.json({ error: "Mission introuvable." }, { status: 404 });
  }

  if (format === "docx") {
    const docx = await renderSynthesisDocx(document);
    return new NextResponse(toArrayBuffer(docx), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename(document.title, "docx")}"`
      }
    });
  }

  const pdf = await renderPdf(document);
  return new NextResponse(toArrayBuffer(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename(document.title, "pdf")}"`
    }
  });
}

function filename(title: string, extension: string) {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.${extension}`;
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}
