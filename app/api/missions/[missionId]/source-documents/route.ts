import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { createSourceDocumentaire, listSourceDocumentaires } from "@/lib/services/source-documentaire-service";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ missionId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId } = await params;
    const documents = await listSourceDocumentaires(user.id, missionId);
    return NextResponse.json({ documents });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ missionId: string }> }) {
  try {
    const user = await requireUser();
    const { missionId } = await params;
    const formData = await request.formData();
    const document = await createSourceDocumentaire(user.id, missionId, formData);
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

function jsonError(error: unknown) {
  const message = error instanceof Error ? error.message : "Erreur serveur.";
  const status = message === "AUTH_REQUIRED" ? 401 : message.includes("introuvable") ? 404 : 400;
  return NextResponse.json({ error: message }, { status });
}
