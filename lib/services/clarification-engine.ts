export type ClarificationInput = {
  rawNeed?: string | null;
  investigationPurpose?: string | null;
  initialScope?: string | null;
  observedScope?: string | null;
  validatedNeed?: string | null;
  symptoms?: string | null;
};

export type ClarificationCandidate = {
  type: "OMISSION" | "GENERALISATION" | "NOMINALISATION" | "LACK_OF_CONTEXT";
  sourceText: string;
  fields: string[];
  question: string;
};

type ClarificationField = {
  key: keyof ClarificationInput;
  label: string;
  value: string;
  isScope?: boolean;
};

const omissionSignals = ["retard", "retards", "probleme", "problème", "blocage", "dependance", "dépendance"];
const generalisationSignals = ["toujours", "jamais", "tout le monde", "personne", "souvent"];
const nominalisationSignals = [
  "manque de visibilite",
  "manque de visibilité",
  "probleme de gouvernance",
  "problème de gouvernance",
  "perte d'autonomie",
  "perte d'autonomie",
  "surcharge"
];
const vagueScopeSignals = ["a definir", "à définir", "tout", "global", "organisation", "equipe", "équipe", "processus"];

export function analyzeClarifications(input: ClarificationInput): ClarificationCandidate[] {
  const fields = clarificationFields(input);
  const candidates: ClarificationCandidate[] = [];

  for (const field of fields) {
    const normalized = normalize(field.value);

    const omissionSignal = findSignal(normalized, omissionSignals);
    if (omissionSignal) {
      candidates.push(
        ...questions(field, "OMISSION", [
          "Quels retards exactement ?",
          "Depuis quand ?",
          "Sur quel perimetre ?",
          "Quelles preuves sont deja disponibles ?"
        ])
      );
    }

    const generalisationSignal = findSignal(normalized, generalisationSignals);
    if (generalisationSignal) {
      candidates.push(
        ...questions(field, "GENERALISATION", [
          "Dans quels cas precisement ?",
          "Existe-t-il des exceptions ?",
          "Depuis quand ce phenomene est-il observe ?"
        ])
      );
    }

    const nominalisationSignal = findSignal(normalized, nominalisationSignals);
    if (nominalisationSignal) {
      candidates.push(
        ...questions(field, "NOMINALISATION", [
          "Comment cela se manifeste-t-il concretement ?",
          "Qui est concerne ?",
          "Sur quelles situations l'observe-t-on ?"
        ])
      );
    }

    if (field.isScope && isScopeVague(normalized)) {
      candidates.push(
        ...questions(field, "LACK_OF_CONTEXT", [
          "Quel perimetre organisationnel est concerne ?",
          "Quelle periode doit etre analysee ?",
          "Quelles equipes ou quels flux doivent etre inclus ou exclus ?"
        ])
      );
    }
  }

  return filterAnsweredQuestions(deduplicate(candidates), fields);
}

function clarificationFields(input: ClarificationInput): ClarificationField[] {
  return [
    { key: "investigationPurpose", label: "But de l'investigation", value: input.investigationPurpose ?? "" },
    { key: "initialScope", label: "Périmètre initial", value: input.initialScope ?? "", isScope: true },
    { key: "observedScope", label: "Périmètre observé", value: input.observedScope ?? "", isScope: true },
    { key: "validatedNeed", label: "Besoin reformulé et validé", value: input.validatedNeed ?? "" },
    { key: "symptoms", label: "Symptômes", value: input.symptoms ?? "" }
  ];
}

function questions(field: ClarificationField, type: ClarificationCandidate["type"], list: string[]) {
  return list.map((question) => ({
    type,
    sourceText: serializeSource([field.label]),
    fields: [field.label],
    question
  }));
}

function findSignal(value: string, signals: string[]) {
  return signals.find((signal) => value.includes(normalize(signal)));
}

function isScopeVague(value: string) {
  if (value.length < 12) return true;
  return vagueScopeSignals.includes(value);
}

function deduplicate(candidates: ClarificationCandidate[]) {
  const merged = new Map<string, ClarificationCandidate>();
  for (const candidate of candidates) {
    const key = normalize(candidate.question);
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...candidate, fields: [...candidate.fields] });
      continue;
    }

    existing.fields = Array.from(new Set([...existing.fields, ...candidate.fields]));
    existing.sourceText = serializeSource(existing.fields);
  }
  return Array.from(merged.values());
}

function filterAnsweredQuestions(candidates: ClarificationCandidate[], fields: ClarificationField[]) {
  const structuredText = normalize(fields.map((field) => field.value).join(" "));
  return candidates.filter((candidate) => !isAnswered(candidate.question, structuredText));
}

function isAnswered(question: string, structuredText: string) {
  const normalizedQuestion = normalize(question);

  if (normalizedQuestion.startsWith("depuis quand")) {
    return hasTemporalIndication(structuredText);
  }

  if (normalizedQuestion.startsWith("quels retards exactement")) {
    return hasDelayObject(structuredText);
  }

  if (normalizedQuestion.startsWith("sur quel perimetre")) {
    return hasScopeIndication(structuredText);
  }

  if (normalizedQuestion.startsWith("quelles preuves sont deja disponibles")) {
    return hasEvidenceSource(structuredText);
  }

  return false;
}

function hasTemporalIndication(value: string) {
  return [
    /\bdepuis\s+(\d+\s+)?(jour|jours|semaine|semaines|mois|an|ans|annee|annees|janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\b/,
    /\b(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s*[-a]\s*(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre)\s+\d{4}\b/,
    /\bentre\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|avril|q[1-4])\s+et\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|juin|q[1-4])\b/,
    /\bq[1-4]\s+\d{4}\b/,
    /\bpi\s*\d+\b/,
    /\bsur\s+le\s+pi\s*\d+\b/
  ].some((pattern) => pattern.test(value));
}

function hasDelayObject(value: string) {
  return [
    "incident",
    "incidents",
    "prise en charge",
    "features",
    "feature",
    "livraison",
    "livraisons",
    "mise en production",
    "validation",
    "validations",
    "user stories",
    "user story"
  ].some((signal) => value.includes(signal));
}

function hasScopeIndication(value: string) {
  return [
    /\btrain\s+[a-z0-9-]+\b/,
    /\bequipe\s+[a-z0-9-]+\b/,
    /\bequipes\s+[a-z0-9-]+\b/,
    /\bflux\s+[a-z0-9 ]+\b/,
    /\bjira\b/,
    /\broles?\s+de\s+validation\b/,
    /\bperimetre\s+[a-z0-9 ]+\b/
  ].some((pattern) => pattern.test(value));
}

function hasEvidenceSource(value: string) {
  return ["jira", "confluence", "ticket", "tickets", "metrique", "metriques", "sla", "organigramme", "raci"].some((signal) => value.includes(signal));
}

function serializeSource(fields: string[]) {
  return JSON.stringify({ fields });
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
