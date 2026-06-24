import assert from "node:assert/strict";
import test from "node:test";
import { normalizeJiraTokenInput } from "@/lib/services/jira-service";

test("ignore les valeurs de token Jira vides ou techniques", () => {
  assert.equal(normalizeJiraTokenInput(""), "");
  assert.equal(normalizeJiraTokenInput("0"), "");
  assert.equal(normalizeJiraTokenInput(" undefined "), "");
  assert.equal(normalizeJiraTokenInput(" null "), "");
});

test("conserve un vrai token Jira saisi", () => {
  assert.equal(normalizeJiraTokenInput("  jira-token-reel  "), "jira-token-reel");
});
