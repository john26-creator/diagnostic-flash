import { randomUUID } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { SourceStatut, SourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const allowedExtensions = new Set(["pdf", "docx", "pptx", "xlsx", "csv", "png", "jpg", "jpeg"]);

export const sourceDocumentaireTypes: SourceType[] = [
  SourceType.ORGANIGRAMME,
  SourceType.RACI,
  SourceType.FICHE_POSTE,
  SourceType.PROCESSUS,
  SourceType.MODE_OPERATOIRE,
  SourceType.WORKFLOW_JIRA,
  SourceType.SLA,
  SourceType.CONFLUENCE,
  SourceType.INCIDENT,
  SourceType.AUTRE
];

export async function listSourceDocumentaires(userId: string, missionId: string) {
  await assertMissionAccess(userId, missionId);
  return prisma.sourceDocumentaire.findMany({
    where: { missionId },
    orderBy: { dateAjout: "desc" }
  });
}

export async function createSourceDocumentaire(userId: string, missionId: string, formData: FormData) {
  await assertMissionAccess(userId, missionId);

  const type = String(formData.get("type") ?? "") as SourceType;
  const nom = String(formData.get("nom") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const referenceUrl = String(formData.get("referenceUrl") ?? "").trim();
  const file = readUploadedFile(formData.get("file"));

  if (!sourceDocumentaireTypes.includes(type)) throw new Error("Type de source documentaire invalide.");
  if (!nom) throw new Error("Le nom de la source est obligatoire.");

  const stored = file ? await storeFile(missionId, file) : null;

  return prisma.sourceDocumentaire.create({
    data: {
      missionId,
      type,
      nom,
      description: description || null,
      referenceUrl: referenceUrl || null,
      fichierNom: stored?.originalName ?? null,
      fichierPath: stored?.relativePath ?? null,
      fichierTaille: stored?.size ?? null,
      statut: SourceStatut.IMPORTEE
    }
  });
}

export async function getSourceDocumentaire(userId: string, missionId: string, documentId: string) {
  await assertMissionAccess(userId, missionId);
  const document = await prisma.sourceDocumentaire.findFirst({ where: { id: documentId, missionId } });
  if (!document) throw new Error("Source documentaire introuvable.");
  return document;
}

export async function getSourceDocumentaireDownload(userId: string, missionId: string, documentId: string) {
  const document = await getSourceDocumentaire(userId, missionId, documentId);
  if (!document.fichierPath || !document.fichierNom) throw new Error("Aucun fichier n'est associe a cette source documentaire.");

  const absolutePath = resolveUploadPath(document.fichierPath);
  await stat(absolutePath);
  return {
    document,
    bytes: await readFile(absolutePath)
  };
}

export async function updateSourceDocumentaireStatut(userId: string, missionId: string, documentId: string, statut: SourceStatut) {
  await assertMissionAccess(userId, missionId);
  if (!Object.values(SourceStatut).includes(statut)) throw new Error("Statut de source documentaire invalide.");

  const updated = await prisma.sourceDocumentaire.updateMany({
    where: { id: documentId, missionId },
    data: { statut }
  });
  if (!updated.count) throw new Error("Source documentaire introuvable.");
}

export async function deleteSourceDocumentaire(userId: string, missionId: string, documentId: string) {
  const document = await getSourceDocumentaire(userId, missionId, documentId);
  if (document.fichierPath) {
    await unlink(resolveUploadPath(document.fichierPath)).catch(() => undefined);
  }
  await prisma.sourceDocumentaire.delete({ where: { id: document.id } });
}

async function assertMissionAccess(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, select: { id: true } });
  if (!mission) throw new Error("Mission introuvable.");
}

function readUploadedFile(value: FormDataEntryValue | null) {
  if (!value || typeof value === "string") return null;
  if (!value.name || value.size === 0) return null;
  return value;
}

async function storeFile(missionId: string, file: File) {
  validateFile(file);
  const uploadDir = path.join(process.cwd(), "uploads", missionId);
  await mkdir(uploadDir, { recursive: true });

  const safeName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name)}`;
  const absolutePath = path.join(uploadDir, safeName);
  await writeFile(absolutePath, Buffer.from(await file.arrayBuffer()));

  return {
    originalName: file.name,
    relativePath: path.join("uploads", missionId, safeName).replace(/\\/g, "/"),
    size: file.size
  };
}

function validateFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !allowedExtensions.has(extension)) {
    throw new Error("Format de fichier non autorise. Formats acceptes : PDF, DOCX, PPTX, XLSX, CSV, PNG, JPG, JPEG.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Fichier trop volumineux. Taille maximale autorisee : 20 Mo.");
  }
}

function sanitizeFileName(fileName: string) {
  const parsed = path.parse(fileName);
  const base = parsed.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${base || "document"}${parsed.ext.toLowerCase()}`;
}

function resolveUploadPath(relativePath: string) {
  const uploadsRoot = path.resolve(process.cwd(), "uploads");
  const absolutePath = path.resolve(process.cwd(), relativePath);
  if (!absolutePath.startsWith(uploadsRoot + path.sep)) throw new Error("Chemin de fichier invalide.");
  return absolutePath;
}
