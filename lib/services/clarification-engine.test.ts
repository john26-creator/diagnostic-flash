import assert from "node:assert/strict";
import test from "node:test";
import { analyzeClarifications } from "@/lib/services/clarification-engine";

test("genere des questions pour un champ structure vague avec retards frequents", () => {
  const questions = analyzeClarifications({
    rawNeed: "Nous avons des retards frequents",
    investigationPurpose: "Comprendre les retards frequents",
    initialScope: "",
    observedScope: "",
    validatedNeed: "Comprendre les retards"
  });

  assert.ok(questions.length > 0);
  assert.ok(questions.some((question) => question.type === "OMISSION"));
  assert.ok(questions.some((question) => question.question === "Quels retards exactement ?"));
});

test("n'utilise pas le besoin brut pour produire des questions bloquantes", () => {
  const questions = analyzeClarifications({
    rawNeed: "Nous avons des retards frequents et toujours des blocages",
    investigationPurpose: "Comprendre le flux de validation paiement",
    initialScope: "Train paiement mai et juin 2026",
    observedScope: "Tickets Jira PAY mai et juin 2026",
    validatedNeed: "Comprendre les ecarts factuels du flux paiement"
  });

  assert.equal(questions.length, 0);
});

test("deduplique les questions equivalentes", () => {
  const questions = analyzeClarifications({
    rawNeed: "Retards et probleme de dependance",
    investigationPurpose: "Retards",
    initialScope: "Train paiement mai et juin 2026",
    observedScope: "Train paiement mai et juin 2026",
    validatedNeed: "Retards"
  });

  const unique = new Set(questions.map((question) => question.question));
  assert.equal(unique.size, questions.length);
});

test("indique le champ detecte sans exposer d'extrait", () => {
  const questions = analyzeClarifications({
    rawNeed: "Nous avons des retards frequents",
    investigationPurpose: "Comprendre les retards frequents",
    initialScope: "Train paiement mai et juin 2026",
    observedScope: "Train paiement mai et juin 2026",
    validatedNeed: "Comprendre les ecarts observes"
  });

  const question = questions.find((item) => item.question === "Quels retards exactement ?");
  assert.ok(question);
  assert.deepEqual(question.fields, ["But de l'investigation"]);
  assert.deepEqual(JSON.parse(question.sourceText), {
    fields: ["But de l'investigation"]
  });
});

test("fusionne les champs pour une meme question", () => {
  const questions = analyzeClarifications({
    rawNeed: "Nous avons des retards frequents",
    investigationPurpose: "Comprendre les retards frequents",
    initialScope: "Train paiement mai et juin 2026",
    observedScope: "Train paiement mai et juin 2026",
    validatedNeed: "Comprendre les ecarts observes",
    symptoms: "Retards frequents"
  });

  const question = questions.find((item) => item.question === "Quels retards exactement ?");
  assert.ok(question);
  assert.deepEqual(question.fields, ["But de l'investigation", "Symptômes"]);
});

test("supprime les questions dont les reponses existent deja dans les champs structures", () => {
  const questions = analyzeClarifications({
    rawNeed: "Verbatim client vague avec retards frequents.",
    investigationPurpose: "Comprendre les retards du train Paiement",
    initialScope: "Train Paiement, Jira et roles de validation",
    observedScope: "Flux Feature vers Done sur mai-juin 2026",
    validatedNeed: "Comprendre les mecanismes organisationnels observables pouvant expliquer les retards du train Paiement sur les incidents de production depuis 2 mois.",
    symptoms: "Retards frequents depuis 2 mois sur les prises en charge d'incident en production"
  });

  const remaining = new Set(questions.map((question) => question.question));
  assert.equal(remaining.has("Quels retards exactement ?"), false);
  assert.equal(remaining.has("Depuis quand ?"), false);
  assert.equal(remaining.has("Sur quel perimetre ?"), false);
  assert.equal(remaining.has("Quelles preuves sont deja disponibles ?"), false);
});

test("ne signale pas de clarification quand les champs sont precis", () => {
  const questions = analyzeClarifications({
    rawNeed: "Le verbatim client peut rester vague avec des retards.",
    investigationPurpose: "Identifier les zones d'attention documentaires avant entretiens.",
    initialScope: "Train Paiement, equipes Back Office et Front Office, periode mai-juin 2026.",
    observedScope: "Tickets Jira Features et User Stories du projet PAY entre le 1 mai et le 30 juin 2026.",
    validatedNeed: "Comprendre les ecarts entre le flux theorique Feature vers Done et les evenements Jira observes sur le train Paiement."
  });

  assert.equal(questions.length, 0);
});
