"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient, createMission } from "@/lib/services/mission-service";
import { validateNeed, type NeedValidationState } from "@/lib/services/need-service";
import { createTheoreticalSource, deleteTheoreticalSource, markTheoreticalSourceUsed, seedTheoreticalModel } from "@/lib/services/theory-service";
import {
  deleteExtractionItem,
  deleteExtractionItems,
  runMockTheoreticalExtraction,
  updateExtractionItem,
  updateExtractionItems,
  validateTheoreticalModel,
  type OrganizationValidationState
} from "@/lib/services/theoretical-extraction-service";
import { runMockAnalysis } from "@/lib/analysis/mock-engine";
import { CanonicalRole, ExtractionIAStatus } from "@prisma/client";
import { deleteAllDemoData, loadDemoDatasetTemplate, loadJiraDemoDataset, loadRealisticJiraDemoDataset, resetActiveDemoDataset, saveJiraConnection, syncJira, testJiraConnection, updateJiraBoardClassification, type JiraActionState } from "@/lib/services/jira-service";

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

export async function saveNeedAction(missionId: string, _previousState: NeedValidationState, formData: FormData): Promise<NeedValidationState> {
  const user = await requireUser();
  const forceValidation = String(formData.get("forceValidation") ?? "") === "true";
  const result = await validateNeed(user.id, missionId, formData, forceValidation);
  revalidatePath(`/app/missions/${missionId}/need`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
  return result;
}

export async function seedTheoryAction(missionId: string) {
  const user = await requireUser();
  await seedTheoreticalModel(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function createTheoreticalSourceAction(missionId: string, formData: FormData) {
  const user = await requireUser();
  await createTheoreticalSource(user.id, missionId, formData);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function deleteTheoreticalSourceAction(missionId: string, sourceId: string) {
  const user = await requireUser();
  await deleteTheoreticalSource(user.id, missionId, sourceId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function markTheoreticalSourceUsedAction(missionId: string, sourceId: string) {
  const user = await requireUser();
  await markTheoreticalSourceUsed(user.id, missionId, sourceId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function runTheoreticalExtractionAction(missionId: string) {
  const user = await requireUser();
  await runMockTheoreticalExtraction(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function confirmExtractionItemAction(missionId: string, itemId: string, formData?: FormData) {
  const user = await requireUser();
  const correction = String(formData?.get("correction") ?? "").trim();
  const mappedCanonicalRole = String(formData?.get("mappedCanonicalRole") ?? "").trim() as CanonicalRole | "";
  await updateExtractionItem(user.id, missionId, itemId, {
    status: ExtractionIAStatus.CONFIRMED,
    correction: correction || null,
    mappedCanonicalRole: mappedCanonicalRole || null
  });
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function rejectExtractionItemAction(missionId: string, itemId: string) {
  const user = await requireUser();
  await updateExtractionItem(user.id, missionId, itemId, { status: ExtractionIAStatus.REJECTED });
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function deleteExtractionItemAction(missionId: string, itemId: string) {
  const user = await requireUser();
  await deleteExtractionItem(user.id, missionId, itemId);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function confirmExtractionItemsAction(missionId: string, itemIds: string, formData?: FormData) {
  const user = await requireUser();
  const correction = String(formData?.get("correction") ?? "").trim();
  const mappedCanonicalRole = String(formData?.get("mappedCanonicalRole") ?? "").trim() as CanonicalRole | "";
  await updateExtractionItems(user.id, missionId, parseItemIds(itemIds), {
    status: ExtractionIAStatus.CONFIRMED,
    correction: correction || null,
    mappedCanonicalRole: mappedCanonicalRole || null
  });
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function rejectExtractionItemsAction(missionId: string, itemIds: string) {
  const user = await requireUser();
  await updateExtractionItems(user.id, missionId, parseItemIds(itemIds), { status: ExtractionIAStatus.REJECTED });
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function deleteExtractionItemsAction(missionId: string, itemIds: string) {
  const user = await requireUser();
  await deleteExtractionItems(user.id, missionId, parseItemIds(itemIds));
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}`);
}

export async function validateTheoreticalModelAction(missionId: string, _previousState: OrganizationValidationState, formData: FormData): Promise<OrganizationValidationState> {
  const user = await requireUser();
  const forceValidation = String(formData.get("forceValidation") ?? "") === "true";
  const result = await validateTheoreticalModel(user.id, missionId, forceValidation);
  revalidatePath(`/app/missions/${missionId}/organization`);
  revalidatePath(`/app/missions/${missionId}/observed`);
  revalidatePath(`/app/missions/${missionId}`);
  return result;
}

export async function runMockAnalysisAction(missionId: string) {
  const user = await requireUser();
  await runMockAnalysis(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/observations`);
}

export async function saveJiraConnectionAction(missionId: string, _previousState: JiraActionState, formData: FormData): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await saveJiraConnection(user.id, missionId, formData);
  revalidatePath(`/app/missions/${missionId}`);
  return result;
}

export async function testJiraConnectionAction(missionId: string, _previousState: JiraActionState, formData: FormData): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await testJiraConnection(user.id, missionId, formData);
  revalidatePath(`/app/missions/${missionId}`);
  return result;
}

export async function syncJiraAction(missionId: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await syncJira(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function loadJiraDemoDatasetAction(missionId: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await loadJiraDemoDataset(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function loadRealisticJiraDemoDatasetAction(missionId: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await loadRealisticJiraDemoDataset(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function loadDemoDatasetTemplateAction(missionId: string, templateCode: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await loadDemoDatasetTemplate(user.id, missionId, templateCode);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function resetActiveDemoDatasetAction(missionId: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await resetActiveDemoDataset(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function deleteAllDemoDataAction(missionId: string, _previousState: JiraActionState): Promise<JiraActionState> {
  const user = await requireUser();
  const result = await deleteAllDemoData(user.id, missionId);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
  return result;
}

export async function updateJiraBoardClassificationAction(missionId: string, boardId: string, formData: FormData) {
  const user = await requireUser();
  await updateJiraBoardClassification(user.id, missionId, boardId, formData);
  revalidatePath(`/app/missions/${missionId}`);
  revalidatePath(`/app/missions/${missionId}/organization`);
}

function parseItemIds(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
