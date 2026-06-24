import assert from "node:assert/strict";
import test from "node:test";
import { buildJiraAuthorizationHeader, classifyJiraWorkflow, deduplicateJiraSyncSnapshot, JiraRequestError, mapBoardToWorkflow } from "@/lib/jira/client";

test("classifie les workflows Jira en TRAIN TEAM UNKNOWN", () => {
  assert.equal(classifyJiraWorkflow("Train Paiement"), "TRAIN");
  assert.equal(classifyJiraWorkflow("ART Programme Client"), "TRAIN");
  assert.equal(classifyJiraWorkflow("Equipe API"), "TEAM");
  assert.equal(classifyJiraWorkflow(""), "UNKNOWN");
});

test("mappe un board Jira en workflow avec colonnes et statuts", () => {
  const workflow = mapBoardToWorkflow(
    { externalId: 10, name: "Train Paiement", type: "scrum", projectKey: "PAY" },
    {
      columnConfig: {
        columns: [
          { name: "Ready", statuses: [{ id: "1", name: "Ready For Dev" }, { id: "2", name: "Refined" }] },
          { name: "Done", statuses: [{ id: "3", name: "Done" }] }
        ]
      }
    }
  );

  assert.equal(workflow.type, "TRAIN");
  assert.deepEqual(workflow.steps.map((step) => step.name), ["Ready", "Done"]);
  assert.deepEqual(workflow.steps[0].statuses.map((status) => status.name), ["Ready For Dev", "Refined"]);
});

test("corrige le mapping des statuts Jira quand le nom vient du detail de statut", () => {
  const workflow = mapBoardToWorkflow(
    { externalId: 10, name: "Train Paiement", type: "scrum", projectKey: "PAY" },
    {
      columnConfig: {
        columns: [
          { name: "Ready", statuses: [{ id: "10000", self: "https://demo.atlassian.net/rest/api/3/status/10000" }] }
        ]
      }
    },
    new Map([["10000", "A faire"]])
  );

  assert.deepEqual(workflow.steps[0].statuses, [{ externalId: "10000", name: "A faire" }]);
});

test("ignore les statuts Jira sans nom exploitable", () => {
  const workflow = mapBoardToWorkflow(
    { externalId: 10, name: "Train Paiement", type: "scrum", projectKey: "PAY" },
    {
      columnConfig: {
        columns: [
          { name: "Ready", statuses: [{ id: "10000" }] }
        ]
      }
    }
  );

  assert.deepEqual(workflow.steps[0].statuses, []);
});

test("deduplique les projets boards workflows colonnes et statuts avant synchronisation", () => {
  const snapshot = deduplicateJiraSyncSnapshot({
    instanceName: "Jira Demo",
    projects: [
      { externalId: "100", key: "PAY", name: "Paiement" },
      { externalId: "100", key: "PAY", name: "Paiement bis" }
    ],
    boards: [
      { externalId: 1, name: "Train Paiement" },
      { externalId: 1, name: "Train Paiement copie" }
    ],
    workflows: [
      {
        boardExternalId: 1,
        name: "Workflow Train",
        type: "TRAIN",
        steps: [
          { order: 1, name: "Ready", statuses: [{ externalId: "10", name: "Ready" }, { externalId: "10", name: "Ready duplicate" }] },
          { order: 2, name: "Ready", statuses: [{ externalId: "11", name: "Refined" }] },
          { order: 3, name: "Done", statuses: [{ externalId: "12", name: "Done" }] }
        ]
      },
      {
        boardExternalId: 1,
        name: "Workflow Train duplicate",
        type: "TRAIN",
        steps: []
      }
    ]
  });

  assert.equal(snapshot.projects.length, 1);
  assert.equal(snapshot.boards.length, 1);
  assert.equal(snapshot.workflows.length, 1);
  assert.deepEqual(snapshot.workflows[0].steps.map((step) => step.name), ["Ready", "Done"]);
  assert.equal(snapshot.workflows[0].steps[0].statuses.length, 1);
});

test("formate les erreurs Jira avec le statut HTTP exact", () => {
  const error = new JiraRequestError(401, "Unauthorized", "https://demo.atlassian.net/rest/api/3/myself", "{\"errorMessages\":[\"Unauthorized\"]}");
  assert.equal(error.message, "Erreur Jira 401 Unauthorized");
  assert.equal(error.endpoint, "https://demo.atlassian.net/rest/api/3/myself");
  assert.equal(error.responseBody, "{\"errorMessages\":[\"Unauthorized\"]}");
});

test("construit le header Basic Jira avec email et token", () => {
  const header = buildJiraAuthorizationHeader("consultant@example.com", "token-secret");
  assert.equal(header, `Basic ${Buffer.from("consultant@example.com:token-secret").toString("base64")}`);
});
