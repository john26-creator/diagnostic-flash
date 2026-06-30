export const JIRA_DEMO_DATASET_NAME = "JIRA_MULTI_LEVEL_PAYMENT";

export type DemoIssue = {
  key: string;
  title: string;
  issueType: string;
  priority: string;
  status: string;
  boardName: string;
  parentKey?: string;
  assignee?: string;
  reporter: string;
  createdDay: number;
  updatedDay: number;
  resolvedDay?: number;
  storyPoints?: number;
  originalEstimate?: number;
  remainingEstimate?: number;
  timeSpent?: number;
  sprintNames?: string[];
  addedAfterStart?: boolean;
};

export type DemoTransition = {
  issueKey: string;
  fromStatus?: string;
  toStatus: string;
  author: string;
  day: number;
  hour?: number;
};

export type DemoComment = {
  issueKey: string;
  author: string;
  body: string;
  day: number;
};

export type DemoIssueLink = {
  sourceKey: string;
  targetKey: string;
  linkType: string;
};

export type DemoEstimateHistory = {
  issueKey: string;
  previousStoryPoints?: number;
  newStoryPoints?: number;
  previousEstimate?: number;
  newEstimate?: number;
  changedBy: string;
  day: number;
};

export type DemoSprint = {
  externalId: string;
  name: string;
  boardName: string;
  goal: string;
  state: string;
  startDay: number;
  endDay: number;
};

export type DemoExpectedPhenomenon = {
  code: string;
  label: string;
  description: string;
  concernedData: string[];
  expectedResult: string;
  investigationQuestions: string[];
};

export type RealisticJiraDataset = {
  datasetName: string;
  sprints: DemoSprint[];
  issues: DemoIssue[];
  transitions: DemoTransition[];
  comments: DemoComment[];
  links: DemoIssueLink[];
  estimateHistory: DemoEstimateHistory[];
  expectedPhenomena: DemoExpectedPhenomenon[];
};

const base = Date.UTC(2026, 3, 1, 9, 0, 0);
const dayMs = 24 * 60 * 60 * 1000;

export function demoDate(day: number, hour = 9) {
  const date = new Date(base + day * dayMs);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

export function generateRealisticJiraDataset(): RealisticJiraDataset {
  const sprints: DemoSprint[] = [
    { externalId: "DEMO-SPRINT-API-12-1", name: "API Sprint 12.1", boardName: "Équipe API Paiement", goal: "Endpoint paiement differe", state: "closed", startDay: 15, endDay: 28 },
    { externalId: "DEMO-SPRINT-API-12-2", name: "API Sprint 12.2", boardName: "Équipe API Paiement", goal: "Stabilisation API banque", state: "closed", startDay: 29, endDay: 42 },
    { externalId: "DEMO-SPRINT-FRONT-12-1", name: "Front Sprint 12.1", boardName: "Équipe Front Paiement", goal: "Checkout paiement differe", state: "closed", startDay: 15, endDay: 28 },
    { externalId: "DEMO-SPRINT-BACK-12-2", name: "Back Sprint 12.2", boardName: "Équipe Back Paiement", goal: "Justificatifs paiement", state: "closed", startDay: 29, endDay: 42 },
    { externalId: "DEMO-SPRINT-SUPPORT-MAI", name: "Support Mai", boardName: "Support & Exploitation Paiement", goal: "Incidents paiement production", state: "closed", startDay: 30, endDay: 60 }
  ];

  const issues: DemoIssue[] = [
    issue("INIT-001", "Modernisation du paiement", "Initiative", "High", "Prioritized", "Portfolio Paiement", "Karim Benali", "Nadia Lemoine", 0, 65, undefined, 40),
    issue("EPIC-001", "Paiement différé", "Epic", "High", "Epic", "Portfolio Paiement", "Karim Benali", "Nadia Lemoine", 2, 66, undefined, 21, "INIT-001"),
    issue("EPIC-002", "Sécurisation fraude", "Epic", "High", "Prioritized", "Portfolio Paiement", "Karim Benali", "Samia Bernard", 3, 58, undefined, 13, "INIT-001"),
    issue("EPIC-003", "Amélioration expérience checkout", "Epic", "Medium", "Prioritized", "Portfolio Paiement", "Lea Martin", "Nadia Lemoine", 4, 63, undefined, 13, "INIT-001"),
    issue("FEAT-001", "Refonte parcours paiement", "Feature", "High", "Validation", "Train Paiement", "Karim Benali", "Samia Bernard", 6, 61, undefined, 20, "EPIC-001"),
    issue("FEAT-002", "Détection fraude temps réel", "Feature", "High", "Implementing", "Train Paiement", "Karim Benali", "Samia Bernard", 7, 62, undefined, 13, "EPIC-002"),
    issue("FEAT-003", "Justificatifs de paiement", "Feature", "Medium", "Ready", "Train Paiement", "Karim Benali", "Pierre Martin", 9, 44, undefined, 8, "EPIC-003"),
    issue("FEAT-004", "Amélioration observabilité paiement", "Enabler", "Medium", "Implementing", "Train Paiement", "Samia Bernard", "Karim Benali", 12, 55, undefined, 8, "EPIC-002"),
    issue("US-API-001", "Exposer endpoint paiement différé", "User Story", "High", "Done", "Équipe API Paiement", "Amina Diallo", "Pierre Martin", 16, 39, 39, 5, "FEAT-001", ["API Sprint 12.1", "API Sprint 12.2"]),
    issue("US-API-002", "Ajouter contrôle plafond paiement", "User Story", "High", "Code Review", "Équipe API Paiement", "Amina Diallo", "Pierre Martin", 18, 49, undefined, 8, "FEAT-001", ["API Sprint 12.1"], true),
    issue("BUG-API-001", "Timeout API banque", "Bug", "Critical", "Reopened", "Équipe API Paiement", "Amina Diallo", "Samia Bernard", 24, 57, undefined, undefined, "INC-002", ["API Sprint 12.2"]),
    issue("TECH-API-001", "Refactor service paiement", "Technical Story", "Medium", "In Progress", "Équipe API Paiement", "Hugo Moreau", "Amina Diallo", 21, 60, undefined, 13, "FEAT-004", ["API Sprint 12.2"]),
    issue("US-FRONT-001", "Afficher option paiement différé", "User Story", "High", "Done", "Équipe Front Paiement", "Chloe Petit", "Pierre Martin", 15, 35, 35, 3, "FEAT-001", ["Front Sprint 12.1"]),
    issue("US-FRONT-002", "Afficher statut paiement", "User Story", "Medium", "In Review", "Équipe Front Paiement", "Chloe Petit", "Karim Benali", 17, 50, undefined, 5, "FEAT-003", ["Front Sprint 12.1"], true),
    issue("BUG-FRONT-001", "Bouton paiement inactif sur mobile", "Bug", "High", "Reopened", "Équipe Front Paiement", "Chloe Petit", "Support OPS", 31, 59, undefined, undefined, "INC-001", ["Front Sprint 12.1"]),
    issue("US-BACK-001", "Stocker justificatif paiement", "User Story", "Medium", "Testing", "Équipe Back Paiement", "Mehdi Arnaud", "Pierre Martin", 30, 53, undefined, 8, "FEAT-003", ["Back Sprint 12.2"]),
    issue("US-BACK-002", "Publier événement paiement validé", "User Story", "Medium", "In Progress", "Équipe Back Paiement", "Mehdi Arnaud", "Karim Benali", 34, 64, undefined, 5, "FEAT-004", ["Back Sprint 12.2"], true),
    issue("BUG-BACK-001", "Statut paiement incohérent", "Bug", "High", "Testing", "Équipe Back Paiement", "Mehdi Arnaud", "Samia Bernard", 37, 66, undefined, undefined, "INC-003", ["Back Sprint 12.2"]),
    issue("INC-001", "Paiement bloqué en production", "Incident", "P1", "Closed", "Support & Exploitation Paiement", "Support OPS", "Monitoring", 38, 46, 46),
    issue("INC-002", "Timeout API banque", "Incident", "P1", "Reopened", "Support & Exploitation Paiement", "Support OPS", "Monitoring", 40, 57, undefined),
    issue("INC-003", "Erreur validation justificatif", "Incident", "P2", "Validation", "Support & Exploitation Paiement", "Support OPS", "Client Care", 45, 62, undefined),
    issue("INC-004", "Latence élevée checkout", "Incident", "P2", "Analysis", "Support & Exploitation Paiement", "Support OPS", "Monitoring", 48, 67, undefined),
    issue("HOTFIX-001", "Rollback connecteur banque v2", "Task", "Critical", "Done", "Support & Exploitation Paiement", "Amina Diallo", "Support OPS", 41, 47, 47, undefined, "INC-002")
  ];

  return {
    datasetName: JIRA_DEMO_DATASET_NAME,
    sprints,
    issues,
    transitions: buildTransitions(),
    comments: buildComments(),
    links: buildLinks(),
    estimateHistory: buildEstimateHistory(),
    expectedPhenomena: buildExpectedPhenomena()
  };
}

function issue(key: string, title: string, issueType: string, priority: string, status: string, boardName: string, assignee: string, reporter: string, createdDay: number, updatedDay: number, resolvedDay?: number, storyPoints?: number, parentKey?: string, sprintNames?: string[], addedAfterStart = false): DemoIssue {
  return {
    key,
    title,
    issueType,
    priority,
    status,
    boardName,
    assignee,
    reporter,
    createdDay,
    updatedDay,
    resolvedDay,
    storyPoints,
    parentKey,
    sprintNames,
    addedAfterStart,
    originalEstimate: storyPoints ? storyPoints * 3600 : undefined,
    remainingEstimate: resolvedDay ? 0 : storyPoints ? storyPoints * 1200 : undefined,
    timeSpent: storyPoints ? storyPoints * 4200 : issueType === "Incident" ? 14400 : undefined
  };
}

function buildTransitions(): DemoTransition[] {
  const baseTransitions: DemoTransition[] = [
    ...flow("US-API-001", ["To Do", "In Progress", "Code Review", "In Progress", "Code Review", "QA", "Done"], "Amina Diallo", 16),
    ...flow("US-API-002", ["To Do", "In Progress", "Code Review", "In Progress", "Code Review"], "Amina Diallo", 19),
    ...flow("BUG-API-001", ["Open", "Analysis", "Fix", "Validation", "Closed", "Reopened"], "Amina Diallo", 40),
    ...flow("US-FRONT-002", ["Backlog", "Ready", "In Progress", "In Review", "In Progress", "In Review"], "Chloe Petit", 20),
    ...flow("BUG-FRONT-001", ["Open", "Fix", "Validation", "Closed", "Reopened"], "Chloe Petit", 31),
    ...flow("BUG-BACK-001", ["Open", "Analysis", "Fix", "Testing"], "Mehdi Arnaud", 45),
    ...flow("INC-001", ["Open", "Analysis", "Fix", "Validation", "Closed"], "Support OPS", 38),
    ...flow("INC-002", ["Open", "Analysis", "Fix", "Validation", "Closed", "Reopened"], "Support OPS", 40),
    ...flow("INC-003", ["Open", "Analysis", "Fix", "Validation"], "Support OPS", 45),
    ...flow("HOTFIX-001", ["To Do", "In Progress", "Validation", "Done"], "Amina Diallo", 41)
  ];
  return baseTransitions;
}

function flow(issueKey: string, statuses: string[], author: string, startDay: number): DemoTransition[] {
  return statuses.map((toStatus, index) => ({
    issueKey,
    fromStatus: index === 0 ? undefined : statuses[index - 1],
    toStatus,
    author: index % 3 === 2 ? "Karim Benali" : author,
    day: startDay + index * 2,
    hour: 10 + (index % 6)
  }));
}

function buildComments(): DemoComment[] {
  return [
    comment("US-API-001", "Samia Bernard", "Attention dépendance sécurité avant passage en QA.", 22),
    comment("US-API-002", "Samia Bernard", "Ajout demandé en cours de sprint pour sécuriser le plafond.", 25),
    comment("US-FRONT-002", "Karim Benali", "Je valide exceptionnellement le parcours avant arbitrage PO.", 30),
    comment("US-BACK-002", "Karim Benali", "Priorité PM: l'événement doit être disponible pour observabilité PI.", 46),
    comment("BUG-API-001", "Samia Bernard", "Incident récurrent, besoin d'analyse de cause côté banque.", 50),
    comment("INC-002", "Samia Bernard", "Réouverture après rollback partiel, impact SLA confirmé.", 56),
    comment("INC-003", "Support OPS", "SLA dépassé, validation justificatif bloquée côté back.", 58),
    comment("TECH-API-001", "Architecte Plateforme", "Blocage Architecture: dette connecteur à traiter avant généralisation.", 54)
  ];
}

function comment(issueKey: string, author: string, body: string, day: number): DemoComment {
  return { issueKey, author, body, day };
}

function buildLinks(): DemoIssueLink[] {
  return [
    { sourceKey: "FEAT-001", targetKey: "US-API-001", linkType: "contains" },
    { sourceKey: "FEAT-001", targetKey: "US-FRONT-001", linkType: "contains" },
    { sourceKey: "FEAT-003", targetKey: "US-BACK-001", linkType: "contains" },
    { sourceKey: "INC-002", targetKey: "BUG-API-001", linkType: "causes" },
    { sourceKey: "BUG-API-001", targetKey: "HOTFIX-001", linkType: "requires hotfix" },
    { sourceKey: "US-FRONT-002", targetKey: "US-API-002", linkType: "is blocked by" },
    { sourceKey: "US-BACK-002", targetKey: "TECH-API-001", linkType: "is blocked by" },
    { sourceKey: "BUG-FRONT-001", targetKey: "US-FRONT-001", linkType: "relates to" }
  ];
}

function buildEstimateHistory(): DemoEstimateHistory[] {
  return [
    { issueKey: "US-API-002", previousStoryPoints: 5, newStoryPoints: 8, changedBy: "Karim Benali", day: 24 },
    { issueKey: "US-FRONT-002", previousStoryPoints: 3, newStoryPoints: 5, changedBy: "Samia Bernard", day: 27 },
    { issueKey: "US-BACK-002", previousStoryPoints: 3, newStoryPoints: 5, changedBy: "Karim Benali", day: 49 },
    { issueKey: "TECH-API-001", previousStoryPoints: 8, newStoryPoints: 13, changedBy: "Architecte Plateforme", day: 55 }
  ];
}

function buildExpectedPhenomena(): DemoExpectedPhenomenon[] {
  return [
    expected("VALIDATION_CONCENTRATION", "Concentration des validations", "Karim Benali intervient sur de nombreuses validations et arbitrages.", ["US-API-001", "US-FRONT-002", "US-BACK-002"], "Concentration des validations et dépendance expert.", ["Pourquoi Karim Benali valide-t-il autant de tickets ?", "Existe-t-il une règle implicite de validation ?", "Que se passe-t-il lorsqu'il est absent ?"]),
    expected("SPRINT_CHURN", "Sprint instable", "Des tickets sont ajoutés après le démarrage des sprints.", ["US-API-002", "US-FRONT-002", "US-BACK-002"], "Scope instable et prévisibilité faible.", ["Quels tickets sont ajoutés après démarrage ?", "Qui décide des ajouts en cours de sprint ?"]),
    expected("REWORK_REVIEW_LOOP", "Allers-retours review", "Plusieurs tickets repassent de review vers in progress.", ["US-API-001", "US-FRONT-002"], "Rework et critères de validation instables.", ["Pourquoi les tickets reviennent-ils en développement ?", "Les critères de review sont-ils explicites ?"]),
    expected("RECURRENT_INCIDENTS", "Incidents récurrents", "Plusieurs incidents concernent paiement, banque et validation justificatif.", ["INC-001", "INC-002", "INC-003", "INC-004"], "Récurrence incident et dette de fiabilisation.", ["Quels composants concentrent les incidents ?", "Les causes racines sont-elles traitées ?"]),
    expected("DEPENDENCY_BLOCKING", "Dépendances bloquantes", "Des liens blocked relient équipes Front, API, Back et Architecture.", ["US-FRONT-002", "US-API-002", "US-BACK-002", "TECH-API-001"], "Dépendances inter-équipes et blocages Architecture/Sécurité.", ["Comment les dépendances sont-elles planifiées ?", "Qui arbitre les blocages Architecture et Sécurité ?"]),
    expected("ESTIMATE_VOLATILITY", "Story points modifiés", "Des story points changent en cours de sprint.", ["US-API-002", "US-FRONT-002", "US-BACK-002", "TECH-API-001"], "Estimation volatile et incertitude de périmètre.", ["Pourquoi les estimations changent-elles après engagement ?", "Les changements reflètent-ils une découverte ou un glissement ?"]),
    expected("SLA_BREACH_REOPENING", "SLA dépassés et réouvertures", "Des incidents P1/P2 sont réouverts avec impact SLA.", ["INC-002", "INC-003", "BUG-API-001"], "SLA dépassés, réouvertures et hotfix.", ["Pourquoi les incidents sont-ils réouverts ?", "Les hotfixs résolvent-ils durablement les causes ?"])
  ];
}

function expected(code: string, label: string, description: string, concernedData: string[], expectedResult: string, investigationQuestions: string[]): DemoExpectedPhenomenon {
  return { code, label, description, concernedData, expectedResult, investigationQuestions };
}
