# 10_BUG_STORIES.md — Diagnostic Flash IA

## Objectif

Ce document liste les scénarios d'erreurs à prévoir dès le MVP.

---

## BUG-001 — Import source échoué

### Scénario

Une source Jira, CSV ou document ne peut pas être importée.

### Attendu

- La source passe en statut FAILED.
- L'erreur est visible par le consultant.
- Aucune donnée partielle incohérente n'est utilisée dans l'analyse.
- Le consultant peut relancer l'import.

---

## BUG-002 — Mapping canonique incomplet

### Scénario

Un type local ou statut local n'a pas de correspondance canonique.

### Attendu

- Les éléments concernés sont marqués comme non mappés.
- Le pipeline s'arrête avant l'analyse.
- Le consultant reçoit une action claire : compléter le mapping.

---

## BUG-003 — Données Jira incomplètes

### Scénario

Les changelogs, sprints ou champs nécessaires sont absents.

### Attendu

- Le moteur calcule uniquement ce qui est possible.
- Les métriques non calculables sont signalées.
- Aucune valeur artificielle n'est inventée.

---

## BUG-004 — Observation sans preuve

### Scénario

Une observation est générée sans élément de preuve.

### Attendu

- L'observation est bloquée ou marquée comme invalide.
- Elle n'apparaît pas comme observation prioritaire.
- Une erreur technique est journalisée.

---

## BUG-005 — Erreur API OpenAI

### Scénario

L'appel IA échoue ou expire.

### Attendu

- L'utilisateur voit un message non bloquant.
- Les données déjà produites sont conservées.
- Une relance est possible.
- Aucun diagnostic partiel n'est présenté comme fiable.

---

## BUG-006 — Export PDF impossible

### Scénario

La génération PDF échoue.

### Attendu

- Le livrable reste en statut DRAFT ou FAILED selon implémentation.
- L'utilisateur peut relancer l'export.
- Les données sources du livrable ne sont pas perdues.

---

## BUG-007 — Accès inter-client non autorisé

### Scénario

Un utilisateur tente d'accéder à une mission qui ne lui appartient pas.

### Attendu

- Accès refusé.
- Aucun détail de la mission n'est exposé.
- L'événement est journalisé.

---

## BUG-008 — Données dupliquées après relance pipeline

### Scénario

Le consultant relance une analyse après correction de mapping.

### Attendu

- Les métriques et observations précédentes sont remplacées ou versionnées proprement.
- Aucun doublon incohérent n'apparaît.
- Les décisions manuelles du consultant sont préservées ou explicitement invalidées.

---

## BUG-009 — Fichier trop volumineux

### Scénario

Un fichier dépasse la taille autorisée.

### Attendu

- L'import est refusé avant traitement.
- Le message indique la limite.
- Aucun traitement IA n'est lancé.

---

## BUG-010 — Session expirée

### Scénario

La session utilisateur expire pendant une saisie.

### Attendu

- L'utilisateur est invité à se reconnecter.
- Les données déjà sauvegardées sont conservées.
- Les formulaires critiques utilisent sauvegarde ou confirmation avant perte.
