# Diagnostic Flash IA

MVP Next.js pour aider un consultant a preparer un diagnostic organisationnel.

Le produit ne genere jamais de diagnostic automatique. Il produit des observations, preuves, hypotheses possibles et questions d'investigation. Les comprehensions retenues et le plan d'action restent manuels.

## Stack

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- Composants UI style shadcn
- Prisma
- PostgreSQL
- NextAuth Credentials MVP
- OpenAI prepare cote serveur, desactive par defaut
- Exports PDF avec `pdf-lib`
- Export Word de synthese avec `docx`

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

Identifiant demo : `consultant@example.com`.

## Variables d'environnement

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/diagnostic_flash_ia?schema=public"
NEXTAUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY=""
OPENAI_ENABLED="false"
```

`OPENAI_ENABLED` doit rester `false` tant que l'integration IA reelle n'est pas explicitement activee.

## Commandes Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run db:seed
```

## Tests

```bash
npm run test
```

Le moteur de clarification MVP est teste sans appel IA. La validation du besoin reste conditionnelle : les questions ouvertes demandent une confirmation consultant avant validation.

## Exports livrables

Chaque ecran de mission expose un bouton `Exporter PDF`.

Route serveur :

```text
/api/missions/[missionId]/exports/[type]?format=pdf
```

Types disponibles :

```text
need
theoretical-model
observed-model
gaps
observations
investigation-plan
synthesis
```

La synthese expose aussi un export Word :

```text
/api/missions/[missionId]/exports/synthesis?format=docx
```

Les exports reprennent les donnees reelles de la mission et incluent :

- client ;
- mission ;
- consultant ;
- date de generation ;
- statut ;
- faits, preuves, hypotheses, questions et incertitudes selon le livrable.

Garde-fous appliques aux documents :

- aucune conclusion diagnostique automatique ;
- aucune generation automatique de plan d'action ;
- separation explicite entre faits, hypotheses et interpretations ;
- preuves affichees avec les observations.

## Charte graphique

Palette Diagnostic Flash IA :

- Bleu nuit principal : `#0B1F3A`
- Beige / dore accent : `#C8A96B`
- Fond tres clair : `#F8F7F4`
- Gris secondaire : `#6B7280`

Typographies :

- Titres : Montserrat, avec fallback systeme.
- Texte courant : Inter, avec fallback systeme.

La charte est appliquee dans :

- `tailwind.config.ts`
- `app/globals.css`
- composants de navigation, cartes, boutons et badges
- templates PDF/DOCX d'export

## Architecture

- `app/` : routes App Router et huit ecrans MVP.
- `components/` : composants reutilisables.
- `lib/services/` : services serveur mission, besoin, organisation.
- `lib/analysis/` : catalogue seedable et moteur mock extensible.
- `lib/ai/` : client OpenAI garde par variable d'environnement.
- `lib/exports/` : preparation des donnees exportables et rendu PDF/DOCX.
- `prisma/schema.prisma` : schema fourni dans le dossier Codex.
- `prisma/seed.ts` : donnees de demonstration.

## Ecrans MVP

1. Mission cockpit
2. Besoin valide
3. Organisation theorique
4. Modele observe
5. Carte des ecarts
6. Observations & hypotheses
7. Plan d'investigation
8. Synthese d'investigation

## Garde-fous metier

- Les observations affichent leurs preuves.
- Les hypotheses restent des pistes, jamais des conclusions.
- Les ecarts ne sont pas presentes comme des causes.
- Les plans d'action sont manuels.
- Les donnees sont filtrees par `userId`, client et mission dans les services serveur.

## Moteur mock

Le bouton `Lancer analyse mockee` cree :

- source Jira mock et RawData ;
- artefacts et evenements canoniques ;
- metriques ;
- detections de phenomenes ;
- observations avec preuves ;
- ecarts ;
- hypotheses et questions ;
- plan d'entretiens ;
- synthese et livrables.

Le moteur est volontairement deterministe pour le MVP. Les calculs et detections reelles peuvent remplacer `lib/analysis/mock-engine.ts` sans modifier les ecrans.
