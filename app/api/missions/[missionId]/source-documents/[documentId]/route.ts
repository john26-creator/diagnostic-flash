import { NextRequest, NextResponse } from "next/server";
import { SourceStatut } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { deleteSourceDocumentaire, getSourceDocumentaire, updateSourceDocumentaireStatut } from "@/lib/services/source-documentaire-service";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ missionId: string; documentId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId, documentId } = await params;
    const document = await getSourceDocumentaire(user.id, missionId, documentId);
    return NextResponse.json({ document });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ missionId: string; documentId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId, documentId } = await params;
    const body = (await request.json()) as { statut?: SourceStatut };
    if (!body.statut) throw new Error("Le statut est obligatoire.");
    await updateSourceDocumentaireStatut(user.id, missionId, documentId, body.statut);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ missionId: string; documentId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId, documentId } = await params;
    await deleteSourceDocumentaire(user.id, missionId, documentId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erreur serveur.";
  const status = message === "AUTH_REQUIRED" ? 401 : message.includes("introuvable") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
