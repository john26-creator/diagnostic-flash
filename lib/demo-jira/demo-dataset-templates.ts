export type DemoDatasetTemplateDefinition = {
  code: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  version: string;
  estimatedTickets: number;
  estimatedProjects: number;
  estimatedBoards: number;
  expectedPhenomena: string[];
};

export const DEMO_DATASET_TEMPLATES: DemoDatasetTemplateDefinition[] = [
  {
    code: "JIRA_STRUCTURE_ONLY",
    name: "Structure Jira seule",
    description: "Structure multi-niveaux Portfolio, Train, equipes et Support sans tickets.",
    category: "Structure",
    difficulty: "Facile",
    version: "1.0",
    estimatedTickets: 0,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: []
  },
  {
    code: "HEALTHY_ORGANIZATION",
    name: "Organisation saine",
    description: "Reference de fonctionnement stable pour comparer les futurs signaux organisationnels.",
    category: "Reference",
    difficulty: "Facile",
    version: "1.0",
    estimatedTickets: 250,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Aucun phenomene majeur"]
  },
  {
    code: "VALIDATION_CONCENTRATION",
    name: "Validation concentree",
    description: "Scenario centre sur la concentration des validations et la dependance a un expert.",
    category: "Gouvernance",
    difficulty: "Intermediaire",
    version: "1.0",
    estimatedTickets: 180,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Concentration validation", "Dependance expert"]
  },
  {
    code: "SPRINT_CHURN",
    name: "Sprint instable",
    description: "Scenario de flux instable avec changements de perimetre en cours de sprint.",
    category: "Flux",
    difficulty: "Intermediaire",
    version: "1.0",
    estimatedTickets: 210,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Sprint churn", "Scope instable"]
  },
  {
    code: "CROSS_TEAM_DEPENDENCIES",
    name: "Dependances inter-equipes",
    description: "Scenario mettant en evidence des dependances entre equipes et du waiting time.",
    category: "Dependances",
    difficulty: "Intermediaire",
    version: "1.0",
    estimatedTickets: 220,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Dependances", "Waiting time"]
  },
  {
    code: "RECURRENT_INCIDENTS",
    name: "Incidents recurrents",
    description: "Scenario centre sur des incidents repetes, SLA depasses et dette technique.",
    category: "Incidents",
    difficulty: "Avance",
    version: "1.0",
    estimatedTickets: 240,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Incidents recurrents", "Dette technique"]
  },
  {
    code: "PERMANENT_HOTFIX",
    name: "Hotfix permanent",
    description: "Scenario qualite avec hotfix, rollback et livraison instable.",
    category: "Qualite",
    difficulty: "Avance",
    version: "1.0",
    estimatedTickets: 230,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Hotfix", "Rollback", "Livraison instable"]
  },
  {
    code: "AIR_FRANCE_CASE",
    name: "Cas Air France",
    description: "Cas de demonstration large combinant gouvernance degradee, dependances et churn.",
    category: "Cas reel",
    difficulty: "Avance",
    version: "1.0",
    estimatedTickets: 350,
    estimatedProjects: 6,
    estimatedBoards: 6,
    expectedPhenomena: ["Gouvernance degradee", "Dependances", "Validation concentree", "Sprint churn"]
  }
];

export function getDemoDatasetTemplate(code: string) {
  return DEMO_DATASET_TEMPLATES.find((template) => template.code === code) ?? null;
}

export function usesStructureOnlyGenerator(code: string) {
  return code === "JIRA_STRUCTURE_ONLY";
}

export function usesSharedRealisticGenerator(code: string) {
  return !usesStructureOnlyGenerator(code);
}
