# UI Screens

Description des 8 écrans du MVP.

ÉCRAN 1 — Mission
Objectif

Créer et piloter un diagnostic.

Informations affichées
Informations générales
Nom mission
Client
Consultant
Date création
Date début investigation
Date fin investigation
État d'avancement
Mission
█ █ █ █ █ □ □ □
62 %
Statistiques
Sources importées
Observations détectées
Hypothèses retenues
Entretiens réalisés
Actions
Modifier mission
Ajouter source
Lancer analyse
Exporter
Données produites
Mission
ÉCRAN 2 — Besoin Validé
Objectif

Transformer la demande initiale en besoin clarifié.

Zone 1 — Besoin brut

Texte libre.

Exemple :

Nous avons des retards.
Zone 2 — Analyse IA

Détection :

omissions
ambiguïtés
généralisations
nominalisations
Zone 3 — Questions proposées

Exemple :

Quels retards ?
Depuis quand ?
Sur quel périmètre ?
Zone 4 — Besoin reformulé

Version validée.

Zone 5 — Symptômes

Liste :

Turnover
Retards
Dépendances
Incidents
Actions
Valider besoin
Modifier besoin
Générer questions
Données produites
Need
ValidatedNeed
Symptoms
ÉCRAN 3 — Organisation Théorique
Objectif

Construire le modèle attendu.

Onglet 1 — Organigramme

Vue hiérarchique.

Sponsor
  ↓
PM
  ↓
PO
Onglet 2 — Mapping rôles
Rôle entreprise	Rôle canonique
Delivery Lead	RTE
Onglet 3 — RACI
Activité	R	A	C	I
Onglet 4 — Flux théorique

Diagramme :

Idée
↓
Feature
↓
US
↓
Validation
↓
Done
Actions
Ajouter activité
Modifier rôle
Valider modèle
Données produites
TheoreticalOrganization
TheoreticalFlow
RACI
ÉCRAN 4 — Modèle Observé
Objectif

Présenter ce que révèlent réellement les données.

Onglet 1 — Flux observé

Temps :

actif
attente
validation
Onglet 2 — Organisation observée

Exemple :

Pierre
42 % validations
Onglet 3 — Activité des rôles
Rôle	Activité observée
Onglet 4 — Dépendances

Carte :

Equipe A
 ↓
Equipe B
 ↓
Equipe C
Actions
Filtrer
Explorer
Voir preuves
Données produites
ObservedModel
ÉCRAN 5 — Carte des Écarts
Objectif

Comparer théorie et réalité.

Vue principale
Élément	Théorique	Observé
Exemple
PO valide

vs

PM valide
Classement
Critique
Important
Mineur
Actions
Accepter écart
Marquer à investiguer
Données produites
Gap
ÉCRAN 6 — Observations & Hypothèses

(C'est ici que ton référentiel prend vie)

Objectif

Présenter les phénomènes détectés.

Liste des observations

Exemple :

GOV-01
Concentration validation
72 %
Détail observation
Description
Indice
Seuil
Niveau
Information
Attention
Critique
Preuves

Tickets :

ABC-123
ABC-456
ABC-789
Hypothèses possibles
expertise rare
surcharge
manque de délégation
Questions d'investigation
Que se passe-t-il lorsqu'il est absent ?
Actions
Retenir hypothèse
Écarter hypothèse
Données produites
Observation
Hypothesis
ÉCRAN 7 — Plan d'Investigation
Objectif

Préparer les entretiens.

Matrice
Hypothèse	Personnes
Exemple
Expertise rare
↓
Pierre
PO
Architecte
Fiche entretien
Personne
Rôle
Hypothèses couvertes
Questions proposées
Actions
Ajouter entretien
Planifier entretien
Données produites
InterviewPlan
ÉCRAN 8 — Synthèse d'Investigation
Objectif

Produire le livrable final.

Section 1 — Faits observés

Uniquement :

Observation
+
Preuve
Section 2 — Compréhensions retenues

Validées par le consultant.

Section 3 — Incertitudes

Points restant ouverts.

Section 4 — Plan d'action

⚠️ Manuel.

Le consultant construit lui-même :

impact
faisabilité
apprentissage
feedback
Export
PDF
Word
Conclusion du document

Je rajouterais une section finale :

Principes UX
Toujours afficher les preuves.
Toujours distinguer faits et hypothèses.
Aucun diagnostic automatique.
Aucun plan d'action automatique.
Le consultant conserve la responsabilité de l'analyse.