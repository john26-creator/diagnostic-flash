import assert from "node:assert/strict";
import test from "node:test";
import { JiraBoardLevel, JiraClassificationStatus } from "@prisma/client";
import {
  generateRealisticJiraDataset,
  buildJiraBoardSyncData,
  buildDemoDeleteWhere,
  buildJiraDemoDataset,
  demoExternalIdsAreUnique,
  effectiveJiraBoardLevel,
  isValidJiraParentRelation,
  JIRA_DEMO_DATASET_NAME,
  normalizeJiraTokenInput
} from "@/lib/services/jira-service";

test("ignore les valeurs de token Jira vides ou techniques", () => {
  assert.equal(normalizeJiraTokenInput(""), "");
  assert.equal(normalizeJiraTokenInput("0"), "");
  assert.equal(normalizeJiraTokenInput(" undefined "), "");
  assert.equal(normalizeJiraTokenInput(" null "), "");
});

test("conserve un vrai token Jira saisi", () => {
  assert.equal(normalizeJiraTokenInput("  jira-token-reel  "), "jira-token-reel");
});

test("valide les regles de parentage des espaces Jira", () => {
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.PORTFOLIO, null), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.PORTFOLIO, JiraBoardLevel.TRAIN), false);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.TRAIN, null), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.TRAIN, JiraBoardLevel.PORTFOLIO), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.TRAIN, JiraBoardLevel.TEAM), false);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.TEAM, null), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.TEAM, JiraBoardLevel.TRAIN), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.SUPPORT_OPS, JiraBoardLevel.TRAIN), true);
  assert.equal(isValidJiraParentRelation(JiraBoardLevel.SUPPORT_OPS, JiraBoardLevel.PORTFOLIO), false);
});

test("utilise le niveau corrige sans ecraser le niveau detecte", () => {
  assert.equal(effectiveJiraBoardLevel({
    level: JiraBoardLevel.TEAM,
    correctedLevel: JiraBoardLevel.TRAIN,
    classificationStatus: JiraClassificationStatus.CORRECTED
  }), JiraBoardLevel.TRAIN);
  assert.equal(effectiveJiraBoardLevel({
    level: JiraBoardLevel.TRAIN,
    correctedLevel: null,
    classificationStatus: JiraClassificationStatus.REJECTED
  }), JiraBoardLevel.UNKNOWN);
});

test("la resynchronisation Jira ne contient pas les champs de correction manuelle", () => {
  const data = buildJiraBoardSyncData("Train Paiement", "scrum", "project-1", JiraBoardLevel.TRAIN);
  assert.deepEqual(data, {
    name: "Train Paiement",
    type: "scrum",
    projectId: "project-1",
    level: JiraBoardLevel.TRAIN
  });
  assert.equal("correctedLevel" in data, false);
  assert.equal("parentBoardId" in data, false);
  assert.equal("classificationStatus" in data, false);
});

test("cree la definition du dataset Jira demo multi-niveaux", () => {
  const dataset = buildJiraDemoDataset();
  assert.equal(JIRA_DEMO_DATASET_NAME, "JIRA_MULTI_LEVEL_PAYMENT");
  assert.deepEqual(dataset.map((board) => board.boardName), [
    "Portfolio Paiement",
    "Train Paiement",
    "\u00c9quipe API Paiement",
    "\u00c9quipe Front Paiement",
    "\u00c9quipe Back Paiement",
    "Support & Exploitation Paiement"
  ]);
  assert.deepEqual(dataset.map((board) => board.level), [
    JiraBoardLevel.PORTFOLIO,
    JiraBoardLevel.TRAIN,
    JiraBoardLevel.TEAM,
    JiraBoardLevel.TEAM,
    JiraBoardLevel.TEAM,
    JiraBoardLevel.SUPPORT_OPS
  ]);
});

test("le dataset Jira demo utilise des identifiants externes uniques pour eviter les doublons", () => {
  const dataset = buildJiraDemoDataset();
  assert.equal(demoExternalIdsAreUnique(dataset), true);
});

test("le dataset Jira demo contient les rattachements attendus", () => {
  const dataset = buildJiraDemoDataset();
  const parentByBoard = new Map(dataset.map((board) => [board.boardName, board.parentBoardExternalId]));
  const idByBoard = new Map(dataset.map((board) => [board.boardName, board.externalId]));
  assert.equal(parentByBoard.get("Train Paiement"), idByBoard.get("Portfolio Paiement"));
  assert.equal(parentByBoard.get("\u00c9quipe API Paiement"), idByBoard.get("Train Paiement"));
  assert.equal(parentByBoard.get("\u00c9quipe Front Paiement"), idByBoard.get("Train Paiement"));
  assert.equal(parentByBoard.get("\u00c9quipe Back Paiement"), idByBoard.get("Train Paiement"));
  assert.equal(parentByBoard.get("Support & Exploitation Paiement"), idByBoard.get("Train Paiement"));
});

test("le dataset Jira realiste contient tickets, transitions, commentaires et dependances", () => {
  const dataset = generateRealisticJiraDataset();
  assert.equal(dataset.issues.length >= 20, true);
  assert.equal(dataset.sprints.length >= 5, true);
  assert.equal(dataset.transitions.length > 0, true);
  assert.equal(dataset.comments.length > 0, true);
  assert.equal(dataset.links.length > 0, true);
});

test("le dataset Jira realiste conserve la coherence Epic Feature Story", () => {
  const dataset = generateRealisticJiraDataset();
  const issueByKey = new Map(dataset.issues.map((issue) => [issue.key, issue]));
  assert.equal(issueByKey.get("FEAT-001")?.parentKey, "EPIC-001");
  assert.equal(issueByKey.get("US-API-001")?.parentKey, "FEAT-001");
  assert.equal(issueByKey.get("US-FRONT-001")?.parentKey, "FEAT-001");
  assert.equal(issueByKey.get("BUG-API-001")?.parentKey, "INC-002");
});

test("le dataset Jira realiste a des dates de transition coherentes", () => {
  const dataset = generateRealisticJiraDataset();
  for (const issue of dataset.issues) {
    const transitions = dataset.transitions.filter((transition) => transition.issueKey === issue.key);
    for (const transition of transitions) {
      assert.equal(transition.day >= issue.createdDay, true);
      assert.equal(transition.day <= issue.updatedDay, true);
    }
  }
});

test("le dataset Jira realiste injecte les phenomenes attendus", () => {
  const dataset = generateRealisticJiraDataset();
  const codes = new Set(dataset.expectedPhenomena.map((phenomenon) => phenomenon.code));
  for (const code of ["VALIDATION_CONCENTRATION", "SPRINT_CHURN", "REWORK_REVIEW_LOOP", "RECURRENT_INCIDENTS", "DEPENDENCY_BLOCKING", "ESTIMATE_VOLATILITY", "SLA_BREACH_REOPENING"]) {
    assert.equal(codes.has(code), true);
  }
  assert.equal(dataset.expectedPhenomena.every((phenomenon) => phenomenon.investigationQuestions.length > 0), true);
});

test("les filtres de suppression demo ciblent uniquement les donnees demo", () => {
  const filters = buildDemoDeleteWhere("mission-1");
  for (const filter of Object.values(filters)) {
    assert.equal(JSON.stringify(filter).includes('"isDemo":true'), true);
    assert.equal(JSON.stringify(filter).includes("mission-1"), true);
  }
});

test("les filtres de suppression demo peuvent cibler un dataset precis", () => {
  const filters = buildDemoDeleteWhere("mission-1", "dataset-1");
  for (const filter of Object.values(filters)) {
    const serialized = JSON.stringify(filter);
    assert.equal(serialized.includes('"datasetId":"dataset-1"'), true);
    assert.equal(serialized.includes('"isDemo":true'), true);
  }
});
