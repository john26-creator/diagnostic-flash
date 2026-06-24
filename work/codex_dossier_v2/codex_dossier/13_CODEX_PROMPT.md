# 13_CODEX_PROMPT.md — Prompt de génération Codex

## Rôle

Tu es un développeur senior full-stack NextJS / TypeScript / Prisma / PostgreSQL.

Tu dois générer le MVP de l'application **Diagnostic Flash IA** à partir des documents du dossier.

## Stack obligatoire

- NextJS App Router
- TypeScript strict
- Tailwind CSS
- Shadcn UI
- Prisma
- PostgreSQL
- NextAuth
- OpenAI API côté serveur uniquement

## Documents de référence

- 01_PRD.md
- 02_DOMAIN_MODEL.md
- 03_PIPELINE.md
- 04_CANONICAL_MODEL.md
- 05_PHENOMENA_CATALOG.md
- 06_UI_SCREENS.md
- 07_MVP_BACKLOG.md
- 08_TECH_ARCHITECTURE.md
- 09_TECHNICAL_STORIES.md
- 10_BUG_STORIES.md
- 11_NFR.md
- 12_RELEASE_PLAN.md
- prisma/schema.prisma

## Principes non négociables

1. L'IA ne produit jamais de diagnostic automatique.
2. L'IA produit uniquement : observations, indices, preuves, hypothèses, questions.
3. Le consultant valide ou rejette.
4. Toute observation doit afficher ses preuves.
5. Toujours distinguer faits, hypothèses et compréhensions retenues.
6. Les plans d'action sont manuels.
7. Les données sont isolées par utilisateur, client et mission.

## Première tâche

Génère la Release 0 puis la Release 1 :

- initialisation projet ;
- Prisma ;
- Auth ;
- layout applicatif ;
- CRUD Client ;
- CRUD Mission ;
- écran Mission cockpit.

## Contraintes de qualité

- Code clair, typé et maintenable.
- Pas de logique métier dans les composants UI.
- Utiliser des services serveur pour les opérations métier.
- Prévoir les états vides, chargement et erreur.
- Prévoir les contrôles d'accès par `userId`.

## Ne pas faire dans la première génération

- Ne pas implémenter toute l'IA.
- Ne pas générer tous les écrans en profondeur.
- Ne pas inventer de diagnostic automatique.
- Ne pas court-circuiter le pipeline métier.

## Résultat attendu

Un projet exécutable localement avec :

```bash
npm install
npm run dev
```

et une base prête pour les releases suivantes.
