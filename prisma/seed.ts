import { PrismaClient } from "@prisma/client";
import { seedPhenomenonDefinitions } from "../lib/analysis/mock-engine";
import { runMockAnalysis } from "../lib/analysis/mock-engine";

const prisma = new PrismaClient();

async function main() {
  await seedPhenomenonDefinitions();

  const user = await prisma.user.upsert({
    where: { email: "consultant@example.com" },
    update: { name: "Consultant Demo" },
    create: { email: "consultant@example.com", name: "Consultant Demo" }
  });

  const client = await prisma.client.upsert({
    where: { id: "demo-client-diagnostic-flash" },
    update: { userId: user.id, name: "Acme Banque", industry: "Services financiers" },
    create: {
      id: "demo-client-diagnostic-flash",
      userId: user.id,
      name: "Acme Banque",
      industry: "Services financiers",
      description: "Client de demonstration pour le Diagnostic Flash IA."
    }
  });

  const mission = await prisma.mission.upsert({
    where: { id: "demo-mission-diagnostic-flash" },
    update: { userId: user.id, clientId: client.id, name: "Diagnostic Flash - Train Paiement" },
    create: {
      id: "demo-mission-diagnostic-flash",
      userId: user.id,
      clientId: client.id,
      name: "Diagnostic Flash - Train Paiement",
      description: "Mission demo couvrant besoin, theorie, observe, ecarts, hypotheses et synthese.",
      investigationStartDate: new Date("2026-06-01"),
      investigationEndDate: new Date("2026-06-30"),
      need: {
        create: {
          rawNeed: "Nous avons des retards frequents et une dependance forte a certaines personnes.",
          validatedNeed: "Comprendre les mecanismes organisationnels observables pouvant expliquer les retards du train Paiement, sans conclure automatiquement sur les causes.",
          investigationPurpose: "Identifier les zones d'attention et preparer les entretiens terrain.",
          initialScope: "Train Paiement, Jira et roles de validation.",
          observedScope: "Flux Feature vers Done sur mai-juin 2026.",
          status: "VALIDATED",
          validatedAt: new Date()
        }
      }
    }
  });

  const need = await prisma.need.findUniqueOrThrow({ where: { missionId: mission.id } });
  await prisma.symptom.deleteMany({ where: { missionId: mission.id } });
  await prisma.symptom.createMany({
    data: ["Retards frequents", "Dependance a certains experts", "Manque de visibilite", "Incidents recurrents"].map((label) => ({
      missionId: mission.id,
      needId: need.id,
      label,
      source: "Sponsor"
    }))
  });
  await prisma.aIClarification.deleteMany({ where: { needId: need.id } });
  await prisma.aIClarification.createMany({
    data: [
      { needId: need.id, type: "AMBIGUITY", question: "Quels retards sont observes et sur quelle periode ?", sourceText: need.rawNeed },
      { needId: need.id, type: "OMISSION", question: "Quels flux et equipes doivent etre exclus du perimetre ?", sourceText: need.rawNeed },
      { needId: need.id, type: "LACK_OF_CONTEXT", question: "Quelles preuves sont deja disponibles dans Jira ou la documentation ?", sourceText: need.rawNeed }
    ]
  });

  await prisma.source.deleteMany({ where: { missionId: mission.id } });
  await prisma.source.createMany({
    data: [
      {
        missionId: mission.id,
        type: "ORG_CHART",
        name: "Organigramme train Paiement",
        description: "Structure cible declaree par le sponsor.",
        referenceUrl: "Confluence / Paiement / Organisation",
        status: "USED_IN_MODEL",
        importedAt: new Date()
      },
      {
        missionId: mission.id,
        type: "RACI",
        name: "RACI validation Feature",
        description: "Roles attendus sur le flux Feature vers Done.",
        referenceUrl: "Confluence / Paiement / RACI",
        status: "IMPORTED",
        importedAt: new Date()
      }
    ]
  });

  await prisma.raciAssignment.deleteMany({ where: { missionId: mission.id } });
  await prisma.theoreticalFlowStep.deleteMany({ where: { flow: { missionId: mission.id } } });
  await prisma.theoreticalFlow.deleteMany({ where: { missionId: mission.id } });
  await prisma.activity.deleteMany({ where: { missionId: mission.id } });
  await prisma.role.deleteMany({ where: { missionId: mission.id } });

  const sponsor = await prisma.role.create({ data: { missionId: mission.id, name: "Sponsor", canonicalRole: "SPONSOR" } });
  const pm = await prisma.role.create({ data: { missionId: mission.id, name: "Product Manager", canonicalRole: "PM" } });
  const po = await prisma.role.create({ data: { missionId: mission.id, name: "Product Owner", canonicalRole: "PO" } });
  const activity = await prisma.activity.create({ data: { missionId: mission.id, name: "Valider le travail metier" } });
  await prisma.raciAssignment.createMany({
    data: [
      { missionId: mission.id, activityId: activity.id, roleId: po.id, level: "A" },
      { missionId: mission.id, activityId: activity.id, roleId: pm.id, level: "C" }
    ]
  });
  const flow = await prisma.theoreticalFlow.create({ data: { missionId: mission.id, name: "Flux cible", description: "Idee vers Done." } });
  await prisma.theoreticalFlowStep.createMany({
    data: [
      { flowId: flow.id, order: 1, name: "Idee", responsibleRoleId: sponsor.id },
      { flowId: flow.id, order: 2, name: "Feature", responsibleRoleId: pm.id },
      { flowId: flow.id, order: 3, name: "Validation", responsibleRoleId: po.id, validatorRoleId: po.id },
      { flowId: flow.id, order: 4, name: "Done", responsibleRoleId: po.id }
    ]
  });

  await runMockAnalysis(user.id, mission.id);
  console.log("Seed Diagnostic Flash IA pret : consultant@example.com");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
