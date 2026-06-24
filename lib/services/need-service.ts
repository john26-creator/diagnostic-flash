import { MissionStatus, NeedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { analyzeClarifications } from "@/lib/services/clarification-engine";

export type NeedValidationState = {
  status: "idle" | "validated" | "needs_confirmation" | "validated_with_open_questions" | "error";
  message?: string;
  questionCount?: number;
};

export async function upsertNeed(userId: string, missionId: string, formData: FormData) {
  return validateNeed(userId, missionId, formData, false);
}

export async function validateNeed(userId: string, missionId: string, formData: FormData, forceValidation: boolean): Promise<NeedValidationState> {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, include: { need: true } });
  if (!mission) throw new Error("Mission introuvable.");
  const rawNeed = String(formData.get("rawNeed") ?? "");
  const validatedNeed = String(formData.get("validatedNeed") ?? "");
  const investigationPurpose = String(formData.get("investigationPurpose") ?? "");
  const initialScope = String(formData.get("initialScope") ?? "");
  const observedScope = String(formData.get("observedScope") ?? "");
  const symptoms = String(formData.get("symptoms") ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const clarificationCandidates = analyzeClarifications({
    rawNeed,
    investigationPurpose,
    initialScope,
    observedScope,
    validatedNeed,
    symptoms: symptoms.join("\n")
  });
  const hasOpenQuestions = clarificationCandidates.length > 0;
  const needStatus = hasOpenQuestions
    ? forceValidation
      ? NeedStatus.VALIDATED_WITH_OPEN_QUESTIONS
      : NeedStatus.NEEDS_CLARIFICATION
    : NeedStatus.VALIDATED;
  const shouldValidate = !hasOpenQuestions || forceValidation;

  const need = await prisma.need.upsert({
    where: { missionId },
    update: {
      rawNeed,
      validatedNeed,
      investigationPurpose: investigationPurpose || null,
      initialScope: initialScope || null,
      observedScope: observedScope || null,
      status: needStatus,
      validatedAt: shouldValidate ? new Date() : null
    },
    create: {
      missionId,
      rawNeed,
      validatedNeed,
      investigationPurpose: investigationPurpose || null,
      initialScope: initialScope || null,
      observedScope: observedScope || null,
      status: needStatus,
      validatedAt: shouldValidate ? new Date() : null
    }
  });

  await prisma.symptom.deleteMany({ where: { needId: need.id } });
  if (symptoms.length) {
    await prisma.symptom.createMany({
      data: symptoms.map((label) => ({ needId: need.id, missionId, label, source: "Saisie consultant" }))
    });
  }
  await prisma.aIClarification.deleteMany({ where: { needId: need.id } });
  if (clarificationCandidates.length) {
    await prisma.aIClarification.createMany({
      data: clarificationCandidates.map(({ type, sourceText, question }) => ({ type, sourceText, question, needId: need.id, status: "PROPOSED" }))
    });
  }

  if (shouldValidate) {
    if (mission.status === "DRAFT" || mission.status === "NEED_VALIDATED") {
      await prisma.mission.update({ where: { id: missionId }, data: { status: MissionStatus.NEED_VALIDATED } });
    }
    return {
      status: hasOpenQuestions ? "validated_with_open_questions" : "validated",
      message: hasOpenQuestions ? "Besoin validé avec questions ouvertes." : "Besoin validé.",
      questionCount: clarificationCandidates.length
    };
  }

  if (mission.status === "NEED_VALIDATED") {
    await prisma.mission.update({ where: { id: missionId }, data: { status: MissionStatus.DRAFT } });
  }
  return {
    status: "needs_confirmation",
    message: "Quelques questions subsistent, souhaitez-vous valider quand même le besoin ?",
    questionCount: clarificationCandidates.length
  };
}
