"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient, createMission } from "@/lib/services/mission-service";
import { upsertNeed } from "@/lib/services/need-service";
import { seedTheoreticalModel } from "@/lib/services/theory-service";
import { runMockAnalysis } from "@/lib/analysis/mock-engine";

export async function createClientAction(formData: FormData) {
  const user = await requireUser();
  await createClient(user.id, formData);
  revalidatePath("/app");
}

export async function createMissionAction(formData: FormData) {
  const user = await requireUser();
  const mission = await createMission(user.id, formData);
  redirect(`/app/missions/${mission.id}`);
}

export async function saveNeedAction(missionId: string, formData: FormData) {
  const user = await requireUser();
  await upsertNeed(user.id, missionId, formData);
  revalidatePath(`/app/missions/${missionId}/need`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function seedTheoryAction(missionId: string) {
  const user = await requireUser();
  await seedTheoreticalModel(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function runMockAnalysisAction(missionId: string) {
  const user = await requireUser();
  await runMockAnalysis(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/observations`);
}
