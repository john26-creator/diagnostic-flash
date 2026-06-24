# Diagnostic Flash IA - PRD

1. Executive Summary
Produit

Diagnostic Flash IA

Assistant de diagnostic organisationnel destiné aux consultants, Scrum Masters, Agile Coaches, RTE et responsables de transformation.

Le produit accélère la phase de compréhension d'une organisation en analysant les artefacts disponibles (Jira, organigramme, documentation, SLA) afin d'identifier les phénomènes organisationnels remarquables et de préparer les investigations terrain.

Proposition de valeur

Le produit ne remplace pas le consultant.

Il lui permet de :

réduire le temps d'analyse documentaire
identifier rapidement les zones d'attention
préparer les entretiens
structurer les livrables
capitaliser sur un référentiel de phénomènes organisationnels
Positionnement IA

Le système ne produit jamais de diagnostic.

Le système produit :

Observation
↓
Indice
↓
Preuve
↓
Questions d'investigation

Le consultant produit :

Compréhension
↓
Diagnostic
↓
Décision
2. Contexte et Problématique

Les organisations perçoivent souvent les symptômes :

retards
ralentissements
turnover
dépendances
incidents récurrents
manque de visibilité

Elles ont généralement des difficultés à :

prendre du recul
comprendre les mécanismes en jeu
distinguer causes et symptômes
prioriser les actions

Le Diagnostic Flash vise à réduire ce temps de compréhension.

3. Utilisateurs Cibles
Utilisateur principal

Consultant

Responsabilités :

cadrage
analyse documentaire
investigation
restitution
Utilisateurs secondaires
Agile Coach
Scrum Master
RTE
PMO
Responsable Transformation
4. Objectifs Produit
Objectifs métier

Réduire le temps nécessaire pour :

construire le modèle théorique
construire le modèle observé
identifier les écarts
préparer les investigations
Objectifs fonctionnels

Permettre :

l'import de sources
le mapping vers un modèle canonique
la détection de phénomènes
la génération de livrables
5. Hors périmètre MVP

Le MVP ne réalise pas :

le diagnostic à la place du consultant
l'analyse psychologique
la détection automatique des causes
la recommandation automatique d'actions

Ces éléments relèvent des versions futures.

6. Vision du processus

Le produit suit le processus :

Mission
↓
Besoin validé
↓
Organisation théorique
↓
Modèle observé
↓
Carte des écarts
↓
Hypothèses
↓
Plan d'investigation
↓
Synthèse
7. Sources de données
Jira

Sources principales :

Issues
Changelog
Comments
Worklogs
Boards
Sprints
Versions
Components
Workflows
Organigramme

Partie concernée par le diagnostic.

Le système doit permettre :

extraction des rôles
extraction des liens hiérarchiques
mapping vers les rôles de référence
SLA

Extraction :

délais cibles
délais maximum
pénalités
règles d'escalade
Documentation
Confluence
PDF
Word
PowerPoint
8. Modèle Canonique
Artefacts
Initiative
Epic
Feature
User Story
Technical Story
Enabler
Task
Bug
Incident
Rôles
Sponsor
PM
PO
RTE
Architecte
Scrum Master
BA
Développeur
QA
Manager
États
Idea
Ready
In Progress
Waiting
Validation
Done
9. Mapping

Le système doit permettre :

Mapping des artefacts

Exemple :

Epic Jira
=
Feature SAFe
Mapping des rôles

Exemple :

Delivery Manager
=
RTE
Mapping des statuts

Exemple :

Ready For UAT
=
Validation

Le consultant valide le mapping proposé.

10. Architecture fonctionnelle

(ici nous reprendrons ensuite les 8 écrans détaillés)

11. Pipeline de traitement

(ici nous reprendrons ensuite le pipeline complet)

12. Référentiel des phénomènes

(renvoi vers le catalogue détaillé)

13. Livrables générés
Besoin Validé
Modèle Théorique
Modèle Observé
Carte des Écarts
Pré-Diagnostic
Plan d'Investigation
Synthèse d'Investigation
14. Critères de succès MVP

Le MVP est considéré comme réussi si un consultant peut :

Connecter Jira.
Construire le modèle canonique.
Générer le modèle observé.
Identifier les phénomènes détectés.
Préparer ses entretiens.
Produire les livrables du diagnostic.

15. MVP Scope
MVP V0
Mission
Besoin
Import Jira
Mapping
Organisation Théorique
MVP V1
Modèle Observé
Métriques
Phénomènes
Carte des Écarts
MVP V2
Hypothèses
Plan d'Investigation
Synthèse

Voir document 07_MVP_BACKLOG.md