export type PhenomenonSeed = {
  code: string;
  family: string;
  name: string;
  description: string;
  calculationDescription: string;
  defaultThresholdInfo?: number;
  defaultThresholdWarning?: number;
  defaultThresholdCritical?: number;
  hypotheses: string[];
  questions: string[];
};

export const phenomenonCatalog: PhenomenonSeed[] = [
  {
    code: "GOV-01",
    family: "Gouvernance",
    name: "Concentration des validations",
    description: "Une proportion importante des validations est realisee par une meme personne.",
    calculationDescription: "Validations realisees par la personne la plus sollicitee / nombre total de validations.",
    defaultThresholdInfo: 30,
    defaultThresholdWarning: 50,
    defaultThresholdCritical: 70,
    hypotheses: ["Expertise rare", "Surcharge des autres validateurs", "Manque de delegation", "Organisation historique"],
    questions: [
      "Pourquoi cette personne valide-t-elle autant ?",
      "Existe-t-il d'autres validateurs effectifs ?",
      "Que se passe-t-il lorsqu'elle est absente ?"
    ]
  },
  {
    code: "FLW-01",
    family: "Flux",
    name: "Waiting eleve",
    description: "Une part importante du temps de traversee est passee en attente plutot qu'en traitement actif.",
    calculationDescription: "Temps Waiting / Lead Time.",
    defaultThresholdInfo: 20,
    defaultThresholdWarning: 40,
    defaultThresholdCritical: 60,
    hypotheses: ["Dependances", "Validations lentes", "Surcharge", "Arbitrages tardifs"],
    questions: ["Qu'attend-on exactement ?", "Qui attend quoi ?", "Quelles attentes reviennent le plus souvent ?"]
  },
  {
    code: "PRD-01",
    family: "Previsibilite",
    name: "Churn Sprint eleve",
    description: "Le perimetre du sprint change fortement apres son demarrage.",
    calculationDescription: "(Points ajoutes + points retires) / points engages.",
    defaultThresholdInfo: 10,
    defaultThresholdWarning: 20,
    defaultThresholdCritical: 30,
    hypotheses: ["Urgence permanente", "Backlog insuffisamment prepare", "Gouvernance instable", "Dependances decouvertes tardivement"],
    questions: ["Pourquoi le perimetre change-t-il autant ?", "Les changements etaient-ils previsibles ?"]
  },
  {
    code: "VAL-02",
    family: "Valeur",
    name: "User Stories sans Feature",
    description: "Des User Stories ne sont rattachees a aucune Feature.",
    calculationDescription: "User Stories sans parent / User Stories totales.",
    defaultThresholdInfo: 10,
    defaultThresholdWarning: 20,
    defaultThresholdCritical: 35,
    hypotheses: ["Travail opportuniste", "Dette de portefeuille", "Gouvernance faible"],
    questions: ["Pourquoi ce travail est-il realise ?", "Quelle valeur metier est recherchee ?"]
  },
  {
    code: "COM-05",
    family: "Communication",
    name: "Documentation incomplete",
    description: "Des tickets sont traites avec une description ou des criteres d'acceptation insuffisants.",
    calculationDescription: "Tickets incomplets / tickets totaux.",
    defaultThresholdInfo: 15,
    defaultThresholdWarning: 30,
    defaultThresholdCritical: 50,
    hypotheses: ["Backlog immature", "Connaissance implicite", "Preparation insuffisante"],
    questions: ["Quelles informations manquent au demarrage ?", "Ou ces informations sont-elles documentees ?"]
  }
];
