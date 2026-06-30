import assert from "node:assert/strict";
import test from "node:test";
import {
  DEMO_DATASET_TEMPLATES,
  getDemoDatasetTemplate,
  usesSharedRealisticGenerator,
  usesStructureOnlyGenerator
} from "@/lib/demo-jira/demo-dataset-templates";

test("la bibliotheque expose les templates DEMO attendus", () => {
  const codes = new Set(DEMO_DATASET_TEMPLATES.map((template) => template.code));
  assert.equal(DEMO_DATASET_TEMPLATES.length, 8);
  for (const code of [
    "JIRA_STRUCTURE_ONLY",
    "HEALTHY_ORGANIZATION",
    "VALIDATION_CONCENTRATION",
    "SPRINT_CHURN",
    "CROSS_TEAM_DEPENDENCIES",
    "RECURRENT_INCIDENTS",
    "PERMANENT_HOTFIX",
    "AIR_FRANCE_CASE"
  ]) {
    assert.equal(codes.has(code), true);
  }
});

test("chaque template contient les metadonnees necessaires a l'UI", () => {
  for (const template of DEMO_DATASET_TEMPLATES) {
    assert.equal(Boolean(template.name), true);
    assert.equal(Boolean(template.description), true);
    assert.equal(Boolean(template.category), true);
    assert.equal(Boolean(template.difficulty), true);
    assert.equal(Boolean(template.version), true);
    assert.equal(template.estimatedProjects >= 0, true);
    assert.equal(template.estimatedBoards >= 0, true);
    assert.equal(Array.isArray(template.expectedPhenomena), true);
  }
});

test("le template structure seule utilise le generateur sans tickets", () => {
  assert.equal(usesStructureOnlyGenerator("JIRA_STRUCTURE_ONLY"), true);
  assert.equal(usesSharedRealisticGenerator("JIRA_STRUCTURE_ONLY"), false);
});

test("les scenarios metier utilisent le generateur realiste partage en MVP", () => {
  assert.equal(usesStructureOnlyGenerator("VALIDATION_CONCENTRATION"), false);
  assert.equal(usesSharedRealisticGenerator("VALIDATION_CONCENTRATION"), true);
  assert.equal(getDemoDatasetTemplate("VALIDATION_CONCENTRATION")?.expectedPhenomena.includes("Dependance expert"), true);
});
