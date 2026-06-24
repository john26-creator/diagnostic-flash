import { ClarificationType, MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function upsertNeed(userId: string, missionId: string, formData: FormData) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, include: { need: true } });
  if (!mission) throw new Error("Mission introuvable.");
  const rawNeed = String(formData.get("rawNeed") ?? "");
  const validatedNeed = String(formData.get("validatedNeed") ?? "");
  const symptoms = String(formData.get("symptoms") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const need = await prisma.need.upsert({
    where: { missionId },
    update: {
      rawNeed,
      validatedNeed,
      investigationPurpose: String(formData.get("investigationPurpose") ?? "") || null,
      initialScope: String(formData.get("initialScope") ?? "") || null,
      observedScope: String(formData.get("observedScope") ?? "") || null,
      validatedAt: validatedNeed ? new Date() : null
    },
    create: {
      missionId,
      rawNeed,
      validatedNeed,
      investigationPurpose: String(formData.get("investigationPurpose") ?? "") || null,
      initialScope: String(formData.get("initialScope") ?? "") || null,
      observedScope: String(formData.get("observedScope") ?? "") || null,
      validatedAt: validatedNeed ? new Date() : null
    }
  });

  await prisma.symptom.deleteMany({ where: { needId: need.id } });
  if (symptoms.length) {
    await prisma.symptom.createMany({
      data: symptoms.map((label) => ({ needId: need.id, missionId, label, source: "Saisie consultant" }))
    });
  }
  await prisma.aIClarification.deleteMany({ where: { needId: need.id, status: "PROPOSED" } });
  await prisma.aIClarification.createMany({
    data: buildClarifications(rawNeed).map((item) => ({ ...item, needId: need.id }))
  });
  await prisma.mission.update({ where: { id: missionId }, data: { status: MissionStatus.NEED_VALIDATED } });
}

function buildClarifications(rawNeed: string) {
  const sourceText = rawNeed.slice(0, 240) || "Besoin initial";
  return [
    { type: ClarificationType.AMBIGUITY, sourceText, question: "Quels retards sont observes, sur quels flux et depuis quand ?" },
    { type: ClarificationType.LACK_OF_CONTEXT, sourceText, question: "Quel perimetre doit etre inclus ou exclu de l'investigation ?" },
    { type: ClarificationType.OMISSION, sourceText, question: "Quelles preuves factuelles existent deja : tickets, incidents, SLA, organigramme ?" }
  ];
}
