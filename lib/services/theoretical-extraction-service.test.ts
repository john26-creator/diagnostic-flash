import assert from "node:assert/strict";
import test from "node:test";
import { CanonicalRole, ExtractionIAKind, ExtractionIAStatus } from "@prisma/client";
import { buildPersonRoleConsolidation, buildWorkflowConsolidation, getOpenTheoreticalModelAmbiguities } from "@/lib/services/theoretical-extraction-service";

const sources = [
  { id: "source-org", nom: "Organigramme SAFe" },
  { id: "source-raci", nom: "RACI" }
];

test("consolide les roles par personne et supprime les doublons", () => {
  const people = buildPersonRoleConsolidation([
    role("1", "Pierre Martin", "Product Owner", CanonicalRole.PO, "source-org"),
    role("2", "Pierre Martin", "Product Owner", CanonicalRole.PO, "source-raci"),
    role("3", "Samia Bernard", "Delivery Lead", CanonicalRole.RTE, "source-raci")
  ], sources);

  const pierre = people.find((person) => person.personName === "Pierre Martin");
  assert.ok(pierre);
  assert.deepEqual(pierre.detectedRoles, ["Product Owner"]);
  assert.deepEqual(pierre.sources, ["Organigramme SAFe", "RACI"]);
});

test("detecte les conflits personne role", () => {
  const people = buildPersonRoleConsolidation([
    role("1", "Pierre Martin", "Product Owner", CanonicalRole.PO, "source-org"),
    role("2", "Pierre Martin", "Product Manager", CanonicalRole.PM, "source-raci"),
    role("3", null, "Responsable Applicatif", CanonicalRole.OTHER, "source-raci")
  ], sources);

  const pierre = people.find((person) => person.personName === "Pierre Martin");
  const unknown = people.find((person) => person.personName === "Personne non identifiee");
  assert.ok(pierre?.conflicts.some((conflict) => conflict.includes("plusieurs roles")));
  assert.ok(pierre?.conflicts.some((conflict) => conflict.includes("Product Owner / Product Manager")));
  assert.ok(unknown?.conflicts.some((conflict) => conflict.includes("sans personne")));
});

test("consolide les workflows par type et deduplique les etapes", () => {
  const workflows = buildWorkflowConsolidation([
    step("1", "TRAIN", 1, "Idea", "source-org"),
    step("2", "TRAIN", 1, "Idea", "source-raci"),
    step("3", "TRAIN", 2, "Feature", "source-raci"),
    step("4", "TEAM", 1, "Ready", "source-raci"),
    step("5", "TEAM", 2, "Done", "source-raci")
  ], sources);

  const train = workflows.find((workflow) => workflow.type === "TRAIN");
  assert.ok(train);
  assert.deepEqual(train.steps, ["Idea", "Feature"]);
  assert.deepEqual(train.sources, ["Organigramme SAFe", "RACI"]);
});

test("compte les ambiguities restantes pour la validation conditionnelle", () => {
  const ambiguities = getOpenTheoreticalModelAmbiguities([
    {
      kind: ExtractionIAKind.AMBIGUITY,
      status: ExtractionIAStatus.DETECTED,
      label: "Responsable Applicatif",
      detail: "Mapping inconnu",
      mappedCanonicalRole: CanonicalRole.OTHER
    },
    {
      kind: ExtractionIAKind.QUESTION,
      status: ExtractionIAStatus.CONFIRMED,
      label: "Question resolue",
      detail: null,
      mappedCanonicalRole: null
    }
  ]);

  assert.deepEqual(ambiguities, ["Responsable Applicatif - Mapping inconnu"]);
});

function role(id: string, personName: string | null, label: string, mappedCanonicalRole: CanonicalRole, sourceDocumentaireId: string) {
  return {
    id,
    kind: ExtractionIAKind.ROLE,
    label,
    detail: null,
    detectedRole: label,
    personName,
    confidence: 0.9,
    status: ExtractionIAStatus.DETECTED,
    correction: null,
    mappedCanonicalRole,
    sourceDocumentaireId
  };
}

function step(id: string, workflowType: "TRAIN" | "TEAM" | "INCIDENT" | "DELIVERY", workflowOrder: number, label: string, sourceDocumentaireId: string) {
  return {
    id,
    kind: ExtractionIAKind.WORKFLOW_STEP,
    label,
    detail: null,
    workflowOrder,
    workflowType,
    confidence: 0.8,
    status: ExtractionIAStatus.DETECTED,
    correction: null,
    sourceDocumentaireId
  };
}
