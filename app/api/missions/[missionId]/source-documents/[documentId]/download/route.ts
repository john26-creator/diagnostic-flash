import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSourceDocumentaireDownload } from "@/lib/services/source-documentaire-service";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ missionId: string; documentId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId, documentId } = await params;
    const { document, bytes } = await getSourceDocumentaireDownload(user.id, missionId, documentId);

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType(document.fichierNom ?? ""),
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.fichierNom ?? "document")}"`
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur.";
    const status = message === "AUTH_REQUIRED" ? 401 : message.includes("introuvable") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

function contentType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg"
  };
  return types[extension ?? ""] ?? "application/octet-stream";
}
