import { MissionStatus, SourceStatus, SourceType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function seedTheoreticalModel(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId } });
  if (!mission) throw new Error("Mission introuvable.");
  await prisma.$transaction(async (tx) => {
    await tx.raciAssignment.deleteMany({ where: { missionId } });
    await tx.theoreticalFlowStep.deleteMany({ where: { flow: { missionId } } });
    await tx.theoreticalFlow.deleteMany({ where: { missionId } });
    await tx.activity.deleteMany({ where: { missionId } });
    await tx.role.deleteMany({ where: { missionId } });
    await tx.roleMapping.deleteMany({ where: { missionId } });

    const sponsor = await tx.role.create({ data: { missionId, name: "Sponsor", canonicalRole: "SPONSOR", description: "Porteur strategique du besoin." } });
    const pm = await tx.role.create({ data: { missionId, name: "Product Manager", canonicalRole: "PM", description: "Gestion portefeuille et arbitrages." } });
    const po = await tx.role.create({ data: { missionId, name: "Product Owner", canonicalRole: "PO", description: "Responsable backlog et validation metier." } });
    const rte = await tx.role.create({ data: { missionId, name: "Delivery Lead", canonicalRole: "RTE", description: "Coordination execution et dependances." } });

    await tx.roleMapping.createMany({
      data: [
        { missionId, localRole: "Delivery Lead", canonicalRole: "RTE", validatedByConsultant: true },
        { missionId, localRole: "Business Owner", canonicalRole: "SPONSOR", validatedByConsultant: true },
        { missionId, localRole: "Feature Owner", canonicalRole: "PO", validatedByConsultant: true }
      ]
    });

    const activities = await Promise.all(
      ["Cadrer le besoin", "Prioriser le portefeuille", "Preparer les stories", "Valider le travail", "Arbitrer les dependances"].map((name) =>
        tx.activity.create({ data: { missionId, name } })
      )
    );
    await tx.raciAssignment.createMany({
      data: [
        { missionId, activityId: activities[0].id, roleId: sponsor.id, level: "A" },
        { missionId, activityId: activities[1].id, roleId: pm.id, level: "A" },
        { missionId, activityId: activities[2].id, roleId: po.id, level: "R" },
        { missionId, activityId: activities[3].id, roleId: po.id, level: "A" },
        { missionId, activityId: activities[4].id, roleId: rte.id, level: "R" }
      ]
    });

    const flow = await tx.theoreticalFlow.create({ data: { missionId, name: "Flux cible Feature vers Done", description: "Flux attendu valide avec le sponsor." } });
    await tx.theoreticalFlowStep.createMany({
      data: [
        { flowId: flow.id, order: 1, name: "Idee", responsibleRoleId: sponsor.id, expectedDuration: 2 },
        { flowId: flow.id, order: 2, name: "Feature", responsibleRoleId: pm.id, expectedDuration: 5 },
        { flowId: flow.id, order: 3, name: "User Stories pretes", responsibleRoleId: po.id, expectedDuration: 5 },
        { flowId: flow.id, order: 4, name: "Validation metier", responsibleRoleId: po.id, validatorRoleId: po.id, expectedDuration: 2 },
        { flowId: flow.id, order: 5, name: "Done", responsibleRoleId: rte.id, expectedDuration: 1 }
      ]
    });
    await tx.mission.update({ where: { id: missionId }, data: { status: MissionStatus.THEORETICAL_MODEL_READY } });
  });
}

export async function createTheoreticalSource(userId: string, missionId: string, formData: FormData) {
  await assertMissionAccess(userId, missionId);

  const type = String(formData.get("type") ?? "") as SourceType;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const referenceUrl = String(formData.get("referenceUrl") ?? "").trim();

  if (!theoreticalSourceTypes.includes(type)) throw new Error("Type de source invalide.");
  if (!name) throw new Error("Le nom de la source est obligatoire.");

  return prisma.source.create({
    data: {
      missionId,
      type,
      name,
      description: description || null,
      referenceUrl: referenceUrl || null,
      status: SourceStatus.IMPORTED,
      importedAt: new Date()
    }
  });
}

export async function deleteTheoreticalSource(userId: string, missionId: string, sourceId: string) {
  await assertMissionAccess(userId, missionId);
  await prisma.source.deleteMany({
    where: {
      id: sourceId,
      missionId
    }
  });
}

export async function markTheoreticalSourceUsed(userId: string, missionId: string, sourceId: string) {
  await assertMissionAccess(userId, missionId);
  await prisma.source.updateMany({
    where: {
      id: sourceId,
      missionId
    },
    data: {
      status: SourceStatus.USED_IN_MODEL
    }
  });
}

const theoreticalSourceTypes: SourceType[] = [
  SourceType.ORG_CHART,
  SourceType.RACI,
  SourceType.JOB_DESCRIPTION,
  SourceType.PROCESS_DOCUMENTATION,
  SourceType.OTHER
];

async function assertMissionAccess(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, select: { id: true } });
  if (!mission) throw new Error("Mission introuvable.");
  return mission;
}
