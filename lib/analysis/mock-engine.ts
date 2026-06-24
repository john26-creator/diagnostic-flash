import { DetectionLevel, MissionStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { phenomenonCatalog } from "@/lib/analysis/phenomena";

const levelFromValue = (value: number, info = 0, warning = 0, critical = 0): DetectionLevel => {
  if (critical && value >= critical) return "CRITICAL";
  if (warning && value >= warning) return "ATTENTION";
  if (info && value >= info) return "INFORMATION";
  return "INFORMATION";
};

export async function seedPhenomenonDefinitions() {
  for (const item of phenomenonCatalog) {
    await prisma.phenomenonDefinition.upsert({
      where: { code: item.code },
      update: {
        family: item.family,
        name: item.name,
        description: item.description,
        calculationDescription: item.calculationDescription,
        defaultThresholdInfo: item.defaultThresholdInfo,
        defaultThresholdWarning: item.defaultThresholdWarning,
        defaultThresholdCritical: item.defaultThresholdCritical
      },
      create: {
        code: item.code,
        family: item.family,
        name: item.name,
        description: item.description,
        calculationDescription: item.calculationDescription,
        defaultThresholdInfo: item.defaultThresholdInfo,
        defaultThresholdWarning: item.defaultThresholdWarning,
        defaultThresholdCritical: item.defaultThresholdCritical
      }
    });
  }
}

export async function runMockAnalysis(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId } });
  if (!mission) throw new Error("Mission introuvable.");
  await seedPhenomenonDefinitions();

  await prisma.$transaction(async (tx) => {
    await tx.deliverable.deleteMany({ where: { missionId } });
    await tx.synthesisHypothesis.deleteMany({ where: { synthesis: { missionId } } });
    await tx.synthesisObservation.deleteMany({ where: { synthesis: { missionId } } });
    await tx.investigationSynthesis.deleteMany({ where: { missionId } });
    await tx.interview.deleteMany({ where: { missionId } });
    await tx.hypothesisPerson.deleteMany({ where: { hypothesis: { missionId } } });
    await tx.investigationQuestion.deleteMany({ where: { missionId } });
    await tx.hypothesis.deleteMany({ where: { missionId, status: "SUGGESTED" } });
    await tx.gap.deleteMany({ where: { missionId } });
    await tx.proof.deleteMany({ where: { missionId } });
    await tx.observation.deleteMany({ where: { missionId, status: "PROPOSED" } });
    await tx.phenomenonDetection.deleteMany({ where: { missionId } });
    await tx.metric.deleteMany({ where: { missionId } });
    await tx.canonicalEvent.deleteMany({ where: { missionId } });
    await tx.canonicalArtifact.deleteMany({ where: { missionId } });
    await tx.rawData.deleteMany({ where: { missionId } });
    await tx.source.deleteMany({ where: { missionId, name: "Jira mock Diagnostic Flash" } });

    const source = await tx.source.create({
      data: { missionId, type: "JIRA", name: "Jira mock Diagnostic Flash", status: "IMPORTED", importedAt: new Date(), connectionInfo: { mode: "mock" } }
    });
    await tx.rawData.createMany({
      data: ["DF-101", "DF-124", "DF-140", "DF-161", "DF-188"].map((key, index) => ({
        missionId,
        sourceId: source.id,
        type: "RAW_JIRA_ISSUE",
        externalId: key,
        payloadJson: {
          key,
          issueType: index === 0 ? "Feature" : "Story",
          status: index % 2 === 0 ? "Ready For UAT" : "Waiting",
          validator: "Pierre Martin",
          sprintCount: index > 2 ? 3 : 1
        }
      }))
    });

    const po = await tx.role.upsert({
      where: { id: "demo-role-placeholder" },
      update: {},
      create: { missionId, name: "Product Owner", canonicalRole: "PO" }
    }).catch(() => tx.role.create({ data: { missionId, name: "Product Owner", canonicalRole: "PO" } }));

    const pierre = await tx.person.create({
      data: { missionId, name: "Pierre Martin", email: "pierre@example.com", team: "Produit", roleId: po.id, source: "Jira mock" }
    });
    const samia = await tx.person.create({
      data: { missionId, name: "Samia Bernard", email: "samia@example.com", team: "Equipe A", source: "Jira mock" }
    });

    const artifacts = await Promise.all(
      [
        ["DF-101", "Refonte parcours client", "FEATURE", "VALIDATION"],
        ["DF-124", "US - Paiement differe", "USER_STORY", "WAITING"],
        ["DF-140", "US - Justificatifs", "USER_STORY", "VALIDATION"],
        ["DF-161", "Correctif incident facturation", "BUG", "WAITING"],
        ["DF-188", "Dette technique API contrats", "TECHNICAL_STORY", "IN_PROGRESS"]
      ].map(([key, title, artifactType, status]) =>
        tx.canonicalArtifact.create({
          data: {
            missionId,
            sourceId: source.id,
            externalId: key,
            key,
            title,
            artifactType: artifactType as never,
            status: status as never,
            assigneePersonId: key === "DF-188" ? samia.id : pierre.id,
            createdAtExternal: new Date("2026-05-03"),
            updatedAtExternal: new Date("2026-06-12")
          }
        })
      )
    );

    const events = await Promise.all(
      artifacts.slice(0, 4).map((artifact, index) =>
        tx.canonicalEvent.create({
          data: {
            missionId,
            artifactId: artifact.id,
            personId: pierre.id,
            eventType: "VALIDATED",
            field: "status",
            fromValue: "Ready For UAT",
            toValue: "Validation",
            content: "Validation realisee par Pierre Martin",
            occurredAt: new Date(`2026-06-${10 + index}T10:00:00.000Z`)
          }
        })
      )
    );

    const metricValues = [
      ["validation_concentration", "Gouvernance", "Concentration des validations", 72, "%", "GOV-01"],
      ["waiting_ratio", "Flux", "Ratio d'attente", 46, "%", "FLW-01"],
      ["sprint_churn", "Previsibilite", "Churn sprint", 28, "%", "PRD-01"],
      ["orphan_stories_ratio", "Valeur", "US sans Feature", 24, "%", "VAL-02"],
      ["incomplete_docs_ratio", "Communication", "Tickets incomplets", 38, "%", "COM-05"]
    ] as const;

    for (const [code, family, label, value, unit, phenomenonCode] of metricValues) {
      const metric = await tx.metric.create({ data: { missionId, code, family, label, value, unit, scope: "Mission demo" } });
      const definition = await tx.phenomenonDefinition.findUniqueOrThrow({ where: { code: phenomenonCode } });
      const catalog = phenomenonCatalog.find((item) => item.code === phenomenonCode)!;
      const level = levelFromValue(value, definition.defaultThresholdInfo ?? 0, definition.defaultThresholdWarning ?? 0, definition.defaultThresholdCritical ?? 0);
      const detection = await tx.phenomenonDetection.create({
        data: {
          missionId,
          metricId: metric.id,
          phenomenonDefinitionId: definition.id,
          level,
          summary: `${definition.code} - ${definition.name}`,
          details: `Signal observe sur la mission : ${value}${unit}. Ce signal n'est pas une cause.`
        }
      });
      const observation = await tx.observation.create({
        data: {
          missionId,
          phenomenonDetectionId: detection.id,
          family,
          title: `${definition.code} - ${definition.name}`,
          description: `${definition.description} Valeur observee : ${value}${unit}.`,
          observedValue: value,
          unit,
          level,
          status: "PROPOSED"
        }
      });
      await tx.proof.createMany({
        data: [
          { missionId, observationId: observation.id, artifactId: artifacts[0].id, eventId: events[0]?.id, type: "METRIC", reference: metric.code, description: `Metrique calculee : ${label} = ${value}${unit}.` },
          { missionId, observationId: observation.id, artifactId: artifacts[1].id, eventId: events[1]?.id, type: "TICKET", reference: artifacts[1].key ?? undefined, description: `Ticket source conserve dans le modele canonique.` }
        ]
      });
      const hypotheses = catalog.hypotheses.slice(0, 3);
      for (const [index, hypothesisText] of hypotheses.entries()) {
        const hypothesis = await tx.hypothesis.create({
          data: {
            missionId,
            observationId: observation.id,
            description: hypothesisText,
            confidenceLabel: index === 0 ? "MEDIUM" : "LOW",
            status: index === 0 && phenomenonCode === "GOV-01" ? "RETAINED" : "SUGGESTED"
          }
        });
        await tx.hypothesisPerson.create({
          data: { hypothesisId: hypothesis.id, personId: index === 0 ? pierre.id : samia.id, priority: index === 0 ? "HIGH" : "MEDIUM", reason: "Personne citee dans les preuves et evenements associes." }
        });
        for (const question of catalog.questions.slice(0, 2)) {
          await tx.investigationQuestion.create({ data: { missionId, observationId: observation.id, hypothesisId: hypothesis.id, question } });
        }
      }
    }

    const govObservation = await tx.observation.findFirst({ where: { missionId, title: { startsWith: "GOV-01" } } });
    if (govObservation) {
      await tx.gap.create({
        data: {
          missionId,
          observationId: govObservation.id,
          theoreticalElement: "Le PO valide les User Stories selon le RACI cible.",
          observedElement: "72 % des validations observees sont concentrees sur Pierre Martin.",
          classification: "VERY_SURPRISING",
          description: "Ecart a investiguer. Il ne constitue pas une conclusion sur la cause."
        }
      });
    }

    await tx.interview.createMany({
      data: [
        { missionId, personId: pierre.id, status: "PLANNED", notes: "Explorer validations, delegation et absence." },
        { missionId, personId: samia.id, status: "PLANNED", notes: "Explorer dependances et travail en attente." }
      ]
    });

    const synthesis = await tx.investigationSynthesis.create({
      data: {
        missionId,
        observedFacts: "Faits observes uniquement : concentrations, ratios et tickets prouves par les sources importees.",
        convergingElements: "Plusieurs signaux convergent vers des zones a investiguer : validation, attente et preparation.",
        retainedUnderstandings: "A renseigner manuellement par le consultant apres entretiens.",
        remainingUncertainties: "Les causes restent ouvertes tant que les entretiens n'ont pas confirme ou infirme les hypotheses."
      }
    });
    const observations = await tx.observation.findMany({ where: { missionId }, take: 4 });
    for (const observation of observations) {
      await tx.synthesisObservation.create({ data: { synthesisId: synthesis.id, observationId: observation.id } });
    }
    const retainedHypotheses = await tx.hypothesis.findMany({ where: { missionId, status: "RETAINED" } });
    for (const hypothesis of retainedHypotheses) {
      await tx.synthesisHypothesis.create({ data: { synthesisId: synthesis.id, hypothesisId: hypothesis.id } });
    }
    await tx.deliverable.createMany({
      data: ["VALIDATED_NEED", "THEORETICAL_MODEL", "OBSERVED_MODEL", "GAP_MAP", "PRE_DIAGNOSTIC", "INVESTIGATION_PLAN", "INVESTIGATION_SYNTHESIS"].map((type) => ({
        missionId,
        type: type as never,
        status: "GENERATED",
        generatedAt: new Date()
      }))
    });
    await tx.mission.update({ where: { id: missionId }, data: { status: MissionStatus.SYNTHESIS_READY } });
  });
}
