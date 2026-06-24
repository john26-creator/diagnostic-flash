import { prisma } from "@/lib/prisma";

export const exportTypes = [
  "need",
  "theoretical-model",
  "observed-model",
  "gaps",
  "observations",
  "investigation-plan",
  "synthesis"
] as const;

export type ExportType = (typeof exportTypes)[number];

export type ExportSection = {
  title: string;
  rows: string[];
};

export type ExportDocument = {
  type: ExportType;
  title: string;
  clientName: string;
  missionName: string;
  consultant: string;
  generatedAt: Date;
  missionStatus: string;
  guardrail: string;
  sections: ExportSection[];
};

export function isExportType(value: string): value is ExportType {
  return exportTypes.includes(value as ExportType);
}

export async function buildExportDocument(userId: string, missionId: string, type: ExportType): Promise<ExportDocument | null> {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, userId },
    include: {
      client: true,
      user: true,
      need: { include: { symptoms: true, aiClarifications: true } },
      roleMappings: true,
      roles: true,
      activities: { include: { raciAssignments: { include: { role: true } } } },
      theoreticalFlows: { include: { steps: { orderBy: { order: "asc" }, include: { responsibleRole: true, validatorRole: true } } } },
      canonicalArtifacts: { include: { assignee: true, creator: true }, orderBy: { createdAt: "asc" } },
      metrics: true,
      observations: { include: { proofs: true, hypotheses: true, investigationQuestions: true }, orderBy: { createdAt: "asc" } },
      gaps: { include: { observation: true }, orderBy: { createdAt: "asc" } },
      hypotheses: {
        include: {
          observation: true,
          investigationQuestions: true,
          hypothesisPersons: { include: { person: { include: { role: true } } } }
        },
        orderBy: { createdAt: "asc" }
      },
      interviews: { include: { person: { include: { role: true } } }, orderBy: { createdAt: "asc" } },
      investigationSynthesis: {
        include: {
          observations: { include: { observation: { include: { proofs: true } } } },
          hypotheses: { include: { hypothesis: true } }
        }
      }
    }
  });
  if (!mission) return null;

  const base = {
    type,
    clientName: mission.client.name,
    missionName: mission.name,
    consultant: mission.user.name ?? mission.user.email,
    generatedAt: new Date(),
    missionStatus: mission.status,
    guardrail:
      "Document d'investigation : il distingue les faits, hypotheses et interpretations. Il ne constitue pas un diagnostic automatique et ne genere aucun plan d'action automatique."
  };

  if (type === "need") {
    return {
      ...base,
      title: "Besoin valide",
      sections: [
        section("Besoin brut", [mission.need?.rawNeed]),
        section("Besoin reformule et valide", [mission.need?.validatedNeed]),
        section("But de l'investigation", [mission.need?.investigationPurpose]),
        section("Perimetres", [`Initial : ${text(mission.need?.initialScope)}`, `Observe : ${text(mission.need?.observedScope)}`]),
        section("Symptomes exprimes", mission.need?.symptoms.map((s) => `${s.label}${s.description ? ` - ${s.description}` : ""}`)),
        section("Questions de clarification", mission.need?.aiClarifications.map((q) => `${q.type} - ${q.question}`))
      ]
    };
  }

  if (type === "theoretical-model") {
    return {
      ...base,
      title: "Modele theorique",
      sections: [
        section("Roles theoriques", mission.roles.map((r) => `${r.name} - role canonique ${r.canonicalRole}${r.description ? ` - ${r.description}` : ""}`)),
        section("Mapping des roles", mission.roleMappings.map((m) => `${m.localRole} -> ${m.canonicalRole} (${m.validatedByConsultant ? "valide" : "a valider"})`)),
        section(
          "RACI",
          mission.activities.flatMap((a) => a.raciAssignments.map((r) => `${a.name} : ${r.role.name} = ${r.level}`))
        ),
        section(
          "Flux theorique",
          mission.theoreticalFlows.flatMap((flow) => [
            flow.name,
            ...flow.steps.map((step) => `${step.order}. ${step.name} - responsable ${text(step.responsibleRole?.name)} - validateur ${text(step.validatorRole?.name)}`)
          ])
        )
      ]
    };
  }

  if (type === "observed-model") {
    return {
      ...base,
      title: "Modele observe",
      sections: [
        section("Artefacts canoniques observes", mission.canonicalArtifacts.map((a) => `${text(a.key)} - ${a.title} - ${a.artifactType} - ${a.status} - assigne ${text(a.assignee?.name)}`)),
        section("Personnes observees", mission.canonicalArtifacts.map((a) => a.assignee?.name).filter(unique).map((name) => `Acteur observe : ${name}`)),
        section("Metriques calculees", mission.metrics.map((m) => `${m.label} : ${m.value}${m.unit ?? ""} (${m.family})`))
      ]
    };
  }

  if (type === "gaps") {
    return {
      ...base,
      title: "Carte des ecarts",
      sections: [
        section(
          "Ecarts entre theorique et observe",
          mission.gaps.map((g) => `${g.classification} - Theorique : ${g.theoreticalElement} / Observe : ${g.observedElement}${g.description ? ` / Note : ${g.description}` : ""}`)
        ),
        section("Rappel", ["Un ecart est un signal a investiguer. Il n'est pas une cause et ne constitue pas un diagnostic."])
      ]
    };
  }

  if (type === "observations") {
    return {
      ...base,
      title: "Pre-diagnostic - Observations et hypotheses",
      sections: [
        ...mission.observations.flatMap((observation) => [
          section(`Fait observe - ${observation.title}`, [`${observation.description} Niveau : ${observation.level}. Statut : ${observation.status}.`]),
          section("Preuves associees", observation.proofs.map((p) => `${p.type} ${text(p.reference)} - ${text(p.description)}`)),
          section("Hypotheses possibles", observation.hypotheses.map((h) => `${h.description} - statut ${h.status} - confiance indicative ${h.confidenceLabel}`)),
          section("Questions d'investigation", observation.investigationQuestions.map((q) => q.question))
        ]),
        section("Limite explicite", ["Ces hypotheses sont des pistes d'investigation. Elles ne sont pas des conclusions."])
      ]
    };
  }

  if (type === "investigation-plan") {
    return {
      ...base,
      title: "Plan d'investigation",
      sections: [
        section(
          "Hypotheses et personnes a rencontrer",
          mission.hypotheses.flatMap((h) =>
            h.hypothesisPersons.map((hp) => `${h.description} -> ${hp.person.name} (${text(hp.person.role?.canonicalRole)}) - priorite ${hp.priority} - ${text(hp.reason)}`)
          )
        ),
        section("Questions d'entretien", mission.hypotheses.flatMap((h) => h.investigationQuestions.map((q) => `${h.description} : ${q.question}`))),
        section("Entretiens planifies", mission.interviews.map((i) => `${i.person.name} - ${i.status}${i.notes ? ` - ${i.notes}` : ""}`))
      ]
    };
  }

  return {
    ...base,
    title: "Synthese d'investigation",
    sections: [
      section("Faits observes avec preuves", mission.investigationSynthesis?.observations.flatMap(({ observation }) => [
        observation.title,
        observation.description,
        ...observation.proofs.map((p) => `Preuve : ${p.type} ${text(p.reference)} - ${text(p.description)}`)
      ])),
      section("Hypotheses retenues", mission.investigationSynthesis?.hypotheses.map(({ hypothesis }) => `${hypothesis.description} - statut ${hypothesis.status}`)),
      section("Convergences", [mission.investigationSynthesis?.convergingElements]),
      section("Comprehensions retenues par le consultant", [mission.investigationSynthesis?.retainedUnderstandings]),
      section("Incertitudes restantes", [mission.investigationSynthesis?.remainingUncertainties]),
      section("Plan d'action", ["Manuel. Le systeme ne genere pas de plan d'action automatique."])
    ]
  };
}

function section(title: string, rows?: (string | null | undefined)[]): ExportSection {
  const cleaned = (rows ?? []).map((row) => text(row)).filter((row) => row !== "Non renseigne");
  return { title, rows: cleaned.length ? cleaned : ["Non renseigne"] };
}

function text(value: unknown) {
  if (value === null || value === undefined || value === "") return "Non renseigne";
  return String(value);
}

function unique<T>(value: T, index: number, array: T[]) {
  return Boolean(value) && array.indexOf(value) === index;
}
