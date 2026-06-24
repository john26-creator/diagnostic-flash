import { CanonicalRole, ExtractionIAKind, ExtractionIAStatus, OrganizationStatus, SourceStatut, TheoreticalWorkflowType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const AI_MARKER = "[IA-022B]";
const AI_FLOW_NAME = "Workflow detecte IA";

export type OrganizationValidationState = {
  status: "idle" | "validated" | "needs_confirmation" | "validated_with_open_questions" | "error";
  message?: string;
  ambiguityCount?: number;
  ambiguities?: string[];
};

export type ConsolidatedPersonRole = {
  key: string;
  itemIds: string[];
  personName: string;
  detectedRoles: string[];
  mappedCanonicalRoles: CanonicalRole[];
  sources: string[];
  confidence: number;
  status: ExtractionIAStatus;
  conflicts: string[];
};

export type ConsolidatedWorkflow = {
  key: string;
  itemIds: string[];
  name: string;
  type: TheoreticalWorkflowType;
  steps: string[];
  sources: string[];
  confidence: number;
  status: ExtractionIAStatus;
  ambiguities: string[];
};

export async function runMockTheoreticalExtraction(userId: string, missionId: string) {
  await assertMissionAccess(userId, missionId);
  const sources = await prisma.sourceDocumentaire.findMany({ where: { missionId }, orderBy: { dateAjout: "asc" } });

  await prisma.$transaction(async (tx) => {
    await tx.theoreticalExtraction.deleteMany({ where: { missionId } });

    const extractionSources = sources.length ? sources : [null];
    for (const source of extractionSources) {
      const extraction = await tx.theoreticalExtraction.create({
        data: {
          missionId,
          sourceDocumentaireId: source?.id,
          summary: source ? `Extraction mockee depuis ${source.nom}.` : "Extraction mockee sans document source."
        }
      });

      await tx.theoreticalExtractionItem.createMany({
        data: mockItems(missionId, extraction.id, source?.id)
      });
    }

    if (sources.length) {
      await tx.sourceDocumentaire.updateMany({
        where: { missionId, id: { in: sources.map((source) => source.id) } },
        data: { statut: SourceStatut.ANALYSEE }
      });
    }
  });
}

export async function updateExtractionItems(
  userId: string,
  missionId: string,
  itemIds: string[],
  data: {
    status?: ExtractionIAStatus;
    correction?: string | null;
    mappedCanonicalRole?: CanonicalRole | null;
  }
) {
  await assertMissionAccess(userId, missionId);
  await prisma.theoreticalExtractionItem.updateMany({
    where: { id: { in: itemIds }, missionId },
    data: {
      status: data.status,
      correction: data.correction,
      mappedCanonicalRole: data.mappedCanonicalRole
    }
  });
  await consolidateConfirmedExtractionItems(userId, missionId);
}

export async function deleteExtractionItems(userId: string, missionId: string, itemIds: string[]) {
  await assertMissionAccess(userId, missionId);
  await prisma.theoreticalExtractionItem.deleteMany({ where: { id: { in: itemIds }, missionId } });
  await consolidateConfirmedExtractionItems(userId, missionId);
}

export async function updateExtractionItem(
  userId: string,
  missionId: string,
  itemId: string,
  data: {
    status?: ExtractionIAStatus;
    correction?: string | null;
    mappedCanonicalRole?: CanonicalRole | null;
  }
) {
  await assertMissionAccess(userId, missionId);
  await prisma.theoreticalExtractionItem.updateMany({
    where: { id: itemId, missionId },
    data: {
      status: data.status,
      correction: data.correction,
      mappedCanonicalRole: data.mappedCanonicalRole
    }
  });
  await consolidateConfirmedExtractionItems(userId, missionId);
}

export async function deleteExtractionItem(userId: string, missionId: string, itemId: string) {
  await assertMissionAccess(userId, missionId);
  await prisma.theoreticalExtractionItem.deleteMany({ where: { id: itemId, missionId } });
  await consolidateConfirmedExtractionItems(userId, missionId);
}

export async function consolidateConfirmedExtractionItems(userId: string, missionId: string) {
  await assertMissionAccess(userId, missionId);
  const items = await prisma.theoreticalExtractionItem.findMany({
    where: { missionId, status: ExtractionIAStatus.CONFIRMED },
    orderBy: [{ kind: "asc" }, { workflowOrder: "asc" }, { createdAt: "asc" }]
  });

  await prisma.$transaction(async (tx) => {
    await tx.theoreticalFlow.deleteMany({ where: { missionId, name: AI_FLOW_NAME } });
    await tx.activity.deleteMany({ where: { missionId, description: { startsWith: AI_MARKER } } });
    await tx.role.deleteMany({ where: { missionId, description: { startsWith: AI_MARKER } } });

    const roleByName = new Map<string, string>();
    for (const item of items.filter((item) => item.kind === ExtractionIAKind.ROLE)) {
      const roleName = displayValue(item);
      if (roleByName.has(normalize(roleName))) continue;
      const role = await tx.role.create({
        data: {
          missionId,
          name: roleName,
          canonicalRole: item.mappedCanonicalRole ?? inferCanonicalRole(roleName),
          description: `${AI_MARKER} Role confirme depuis l'extraction IA mockee.`
        }
      });
      roleByName.set(normalize(role.name), role.id);
    }

    for (const item of items.filter((item) => item.kind === ExtractionIAKind.RESPONSIBILITY)) {
      const activityName = item.correction?.trim() || item.detectedActivity || item.label;
      const roleName = item.detectedRole?.trim() || "Role a preciser";
      const roleId = await ensureRole(tx, missionId, roleName, roleByName, item.mappedCanonicalRole);
      const activity = await tx.activity.create({
        data: {
          missionId,
          name: activityName,
          description: `${AI_MARKER} Responsabilite confirmee depuis l'extraction IA mockee.`
        }
      });
      await tx.raciAssignment.create({
        data: {
          missionId,
          activityId: activity.id,
          roleId,
          level: "R"
        }
      });
    }

    for (const workflow of buildWorkflowConsolidation(items, [])) {
      const flow = await tx.theoreticalFlow.create({
        data: {
          missionId,
          name: `${AI_FLOW_NAME} - ${workflow.name}`,
          description: `${AI_MARKER} Workflow consolide depuis les propositions confirmees.`
        }
      });
      await tx.theoreticalFlowStep.createMany({
        data: workflow.steps.map((step, index) => ({
          flowId: flow.id,
          order: index + 1,
          name: step
        }))
      });
    }
  });
}

export async function validateTheoreticalModel(userId: string, missionId: string, forceValidation: boolean): Promise<OrganizationValidationState> {
  await assertMissionAccess(userId, missionId);
  const items = await prisma.theoreticalExtractionItem.findMany({ where: { missionId } });
  const ambiguities = getOpenTheoreticalModelAmbiguities(items);
  const hasOpenQuestions = ambiguities.length > 0;

  if (hasOpenQuestions && !forceValidation) {
    await prisma.mission.update({
      where: { id: missionId },
      data: { organizationStatus: OrganizationStatus.ORGANIZATION_NEEDS_REVIEW }
    });
    return {
      status: "needs_confirmation",
      message: "Des questions subsistent, souhaitez-vous valider malgre tout le modele theorique ?",
      ambiguityCount: ambiguities.length,
      ambiguities
    };
  }

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      organizationStatus: hasOpenQuestions
        ? OrganizationStatus.ORGANIZATION_VALIDATED_WITH_OPEN_QUESTIONS
        : OrganizationStatus.ORGANIZATION_VALIDATED,
      status: "THEORETICAL_MODEL_READY"
    }
  });
  return {
    status: hasOpenQuestions ? "validated_with_open_questions" : "validated",
    message: hasOpenQuestions ? "Modele theorique valide avec questions ouvertes." : "Modele theorique valide.",
    ambiguityCount: ambiguities.length,
    ambiguities
  };
}

export function buildPersonRoleConsolidation(
  items: Array<{
    id: string;
    kind: ExtractionIAKind;
    label: string;
    detail: string | null;
    detectedRole: string | null;
    personName: string | null;
    confidence: number;
    status: ExtractionIAStatus;
    correction: string | null;
    mappedCanonicalRole: CanonicalRole | null;
    sourceDocumentaireId: string | null;
  }>,
  sources: Array<{ id: string; nom: string }>
): ConsolidatedPersonRole[] {
  const sourceNames = new Map(sources.map((source) => [source.id, source.nom]));
  const grouped = new Map<string, ConsolidatedPersonRole>();

  for (const item of items.filter((item) => item.kind === ExtractionIAKind.ROLE)) {
    const personName = item.personName?.trim() || "Personne non identifiee";
    const roleName = displayValue(item);
    const key = normalize(personName);
    const existing = grouped.get(key) ?? {
      key,
      itemIds: [],
      personName,
      detectedRoles: [],
      mappedCanonicalRoles: [],
      sources: [],
      confidence: 0,
      status: item.status,
      conflicts: []
    };

    existing.itemIds.push(item.id);
    existing.detectedRoles = addUnique(existing.detectedRoles, roleName);
    if (item.mappedCanonicalRole) existing.mappedCanonicalRoles = addUnique(existing.mappedCanonicalRoles, item.mappedCanonicalRole);
    if (item.sourceDocumentaireId) existing.sources = addUnique(existing.sources, sourceNames.get(item.sourceDocumentaireId) ?? "Source documentaire");
    existing.confidence = Math.max(existing.confidence, item.confidence);
    existing.status = mergeStatus(existing.status, item.status);
    grouped.set(key, existing);
  }

  for (const person of grouped.values()) {
    if (person.personName === "Personne non identifiee") person.conflicts.push("Role sans personne associee");
    if (person.detectedRoles.length > 1) person.conflicts.push("Une personne porte plusieurs roles detectes");
    if (person.mappedCanonicalRoles.includes(CanonicalRole.PO) && person.mappedCanonicalRoles.includes(CanonicalRole.PM)) {
      person.conflicts.push("Cumul Product Owner / Product Manager potentiellement problematique");
    }
    if (person.mappedCanonicalRoles.includes(CanonicalRole.OTHER)) person.conflicts.push("Mapping SAFe a confirmer");
    if (!person.sources.length) person.sources.push("Extraction mockee");
  }

  return Array.from(grouped.values()).sort((a, b) => a.personName.localeCompare(b.personName));
}

export function buildWorkflowConsolidation(
  items: Array<{
    id: string;
    kind: ExtractionIAKind;
    label: string;
    detail: string | null;
    workflowOrder: number | null;
    workflowType: TheoreticalWorkflowType | null;
    confidence: number;
    status: ExtractionIAStatus;
    correction: string | null;
    sourceDocumentaireId: string | null;
  }>,
  sources: Array<{ id: string; nom: string }>
): ConsolidatedWorkflow[] {
  const sourceNames = new Map(sources.map((source) => [source.id, source.nom]));
  const grouped = new Map<TheoreticalWorkflowType, { items: typeof items; sourceNames: string[] }>();

  for (const item of items.filter((item) => item.kind === ExtractionIAKind.WORKFLOW_STEP)) {
    const type = item.workflowType ?? TheoreticalWorkflowType.TRAIN;
    const existing = grouped.get(type) ?? { items: [], sourceNames: [] };
    existing.items.push(item);
    if (item.sourceDocumentaireId) existing.sourceNames = addUnique(existing.sourceNames, sourceNames.get(item.sourceDocumentaireId) ?? "Source documentaire");
    grouped.set(type, existing);
  }

  return Array.from(grouped.entries()).map(([type, group]) => {
    const ordered = deduplicateWorkflowItems(group.items);
    const steps = ordered.map((item) => displayValue(item));
    const ambiguities = new Set<string>();
    if (!steps.includes("Done") && !steps.includes("Cloture")) ambiguities.add("Etape finale a confirmer");
    if (steps.includes("Validation") && !steps.some((step) => normalize(step).includes("ready"))) ambiguities.add("Sequence de validation potentiellement incomplete");
    for (const item of group.items) {
      if (item.detail) ambiguities.add(item.detail);
    }
    return {
      key: type,
      itemIds: group.items.map((item) => item.id),
      name: workflowTypeLabel(type),
      type,
      steps,
      sources: group.sourceNames.length ? group.sourceNames : ["Extraction mockee"],
      confidence: Math.max(...group.items.map((item) => item.confidence)),
      status: group.items.reduce((status, item) => mergeStatus(status, item.status), group.items[0]?.status ?? ExtractionIAStatus.DETECTED),
      ambiguities: Array.from(ambiguities)
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

function deduplicateWorkflowItems(items: Array<{ workflowOrder: number | null; label: string; correction: string | null; detail: string | null }>) {
  const byOrderOrName = new Map<string, (typeof items)[number]>();
  for (const item of items) {
    const key = `name:${normalize(displayValue(item))}`;
    if (!byOrderOrName.has(key)) byOrderOrName.set(key, item);
  }
  return Array.from(byOrderOrName.values()).sort((a, b) => (a.workflowOrder ?? 999) - (b.workflowOrder ?? 999));
}

function mockItems(missionId: string, extractionId: string, sourceDocumentaireId?: string): Prisma.TheoreticalExtractionItemCreateManyInput[] {
  return [
    role(missionId, extractionId, sourceDocumentaireId, "Pierre Martin", "Product Owner", 0.91, CanonicalRole.PO),
    role(missionId, extractionId, sourceDocumentaireId, "Pierre Martin", "Product Manager", 0.72, CanonicalRole.PM, "Conflit potentiel de cumul fonctionnel."),
    role(missionId, extractionId, sourceDocumentaireId, "Samia Bernard", "Delivery Lead", 0.84, CanonicalRole.RTE),
    role(missionId, extractionId, sourceDocumentaireId, null, "Responsable Applicatif", 0.58, CanonicalRole.OTHER, "Aucun equivalent SAFe certain identifie."),
    responsibility(missionId, extractionId, sourceDocumentaireId, "Prioriser portefeuille", "Product Manager", 0.86),
    responsibility(missionId, extractionId, sourceDocumentaireId, "Valider User Story", "Product Owner", 0.9),
    responsibility(missionId, extractionId, sourceDocumentaireId, "Arbitrer dependances", "Delivery Lead", 0.78),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TRAIN, 1, "Idea"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TRAIN, 2, "Feature"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TRAIN, 3, "Ready"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TRAIN, 4, "Validation"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TRAIN, 5, "Done"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TEAM, 1, "Ready"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TEAM, 2, "In Progress"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TEAM, 3, "Code Review"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TEAM, 4, "Validation"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.TEAM, 5, "Done"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.INCIDENT, 1, "Ouvert"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.INCIDENT, 2, "Analyse"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.INCIDENT, 3, "Correction"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.INCIDENT, 4, "Validation"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.INCIDENT, 5, "Cloture"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.DELIVERY, 1, "Build"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.DELIVERY, 2, "Validation"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.DELIVERY, 3, "Pre-production"),
    workflow(missionId, extractionId, sourceDocumentaireId, TheoreticalWorkflowType.DELIVERY, 4, "Production"),
    ambiguity(missionId, extractionId, sourceDocumentaireId, "Responsable Applicatif", "Aucun equivalent SAFe identifie."),
    ambiguity(missionId, extractionId, sourceDocumentaireId, "Validation metier", "Responsable non identifie."),
    question(missionId, extractionId, sourceDocumentaireId, "Le role Responsable Applicatif doit-il etre mappe a un role SAFe ?"),
    question(missionId, extractionId, sourceDocumentaireId, "Qui valide les mises en production ?"),
    question(missionId, extractionId, sourceDocumentaireId, "Le workflow detecte est-il complet ?")
  ];
}

function role(missionId: string, extractionId: string, sourceDocumentaireId: string | undefined, personName: string | null, label: string, confidence: number, mappedCanonicalRole: CanonicalRole, detail?: string) {
  return {
    missionId,
    extractionId,
    sourceDocumentaireId,
    kind: ExtractionIAKind.ROLE,
    label,
    detail,
    confidence,
    personName,
    detectedRole: label,
    mappedCanonicalRole
  };
}

function responsibility(missionId: string, extractionId: string, sourceDocumentaireId: string | undefined, activity: string, detectedRole: string, confidence: number) {
  return {
    missionId,
    extractionId,
    sourceDocumentaireId,
    kind: ExtractionIAKind.RESPONSIBILITY,
    label: activity,
    detectedActivity: activity,
    detectedRole,
    confidence
  };
}

function workflow(missionId: string, extractionId: string, sourceDocumentaireId: string | undefined, workflowType: TheoreticalWorkflowType, workflowOrder: number, label: string) {
  return {
    missionId,
    extractionId,
    sourceDocumentaireId,
    kind: ExtractionIAKind.WORKFLOW_STEP,
    label,
    workflowType,
    workflowOrder,
    confidence: 0.82
  };
}

export function getOpenTheoreticalModelAmbiguities(items: Array<{ kind: ExtractionIAKind; status: ExtractionIAStatus; label: string; detail: string | null; mappedCanonicalRole: CanonicalRole | null }>) {
  return items
    .filter((item) => item.status !== ExtractionIAStatus.CONFIRMED && item.status !== ExtractionIAStatus.REJECTED)
    .filter((item) => item.kind === ExtractionIAKind.AMBIGUITY || item.kind === ExtractionIAKind.QUESTION || item.mappedCanonicalRole === CanonicalRole.OTHER)
    .map((item) => `${item.label}${item.detail ? ` - ${item.detail}` : ""}`);
}

function workflowTypeLabel(type: TheoreticalWorkflowType) {
  return {
    TRAIN: "Workflow Train",
    TEAM: "Workflow Equipe",
    INCIDENT: "Workflow Incident",
    DELIVERY: "Workflow Livraison"
  }[type];
}

function mergeStatus(current: ExtractionIAStatus, next: ExtractionIAStatus) {
  if (current === ExtractionIAStatus.REJECTED && next === ExtractionIAStatus.REJECTED) return ExtractionIAStatus.REJECTED;
  if (current === ExtractionIAStatus.CONFIRMED && next === ExtractionIAStatus.CONFIRMED) return ExtractionIAStatus.CONFIRMED;
  if (current === ExtractionIAStatus.DETECTED || next === ExtractionIAStatus.DETECTED) return ExtractionIAStatus.DETECTED;
  return next;
}

function addUnique<T>(values: T[], value: T) {
  return values.includes(value) ? values : [...values, value];
}

function ambiguity(missionId: string, extractionId: string, sourceDocumentaireId: string | undefined, label: string, detail: string) {
  return {
    missionId,
    extractionId,
    sourceDocumentaireId,
    kind: ExtractionIAKind.AMBIGUITY,
    label,
    detail,
    confidence: 0.55
  };
}

function question(missionId: string, extractionId: string, sourceDocumentaireId: string | undefined, label: string) {
  return {
    missionId,
    extractionId,
    sourceDocumentaireId,
    kind: ExtractionIAKind.QUESTION,
    label,
    confidence: 0.7
  };
}

async function ensureRole(
  tx: Prisma.TransactionClient,
  missionId: string,
  roleName: string,
  roleByName: Map<string, string>,
  mappedCanonicalRole?: CanonicalRole | null
) {
  const key = normalize(roleName);
  const known = roleByName.get(key);
  if (known) return known;

  const role = await tx.role.create({
    data: {
      missionId,
      name: roleName,
      canonicalRole: mappedCanonicalRole ?? inferCanonicalRole(roleName),
      description: `${AI_MARKER} Role cree pour responsabilite confirmee.`
    }
  });
  roleByName.set(key, role.id);
  return role.id;
}

function displayValue(item: { correction: string | null; label: string }) {
  return item.correction?.trim() || item.label;
}

function inferCanonicalRole(roleName: string): CanonicalRole {
  const value = normalize(roleName);
  if (value.includes("product owner")) return CanonicalRole.PO;
  if (value.includes("product manager")) return CanonicalRole.PM;
  if (value.includes("delivery") || value.includes("rte")) return CanonicalRole.RTE;
  if (value.includes("sponsor")) return CanonicalRole.SPONSOR;
  return CanonicalRole.OTHER;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function assertMissionAccess(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, select: { id: true } });
  if (!mission) throw new Error("Mission introuvable.");
}
