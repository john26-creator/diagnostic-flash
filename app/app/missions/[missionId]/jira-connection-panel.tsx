"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { deleteAllDemoDataAction, loadDemoDatasetTemplateAction, resetActiveDemoDatasetAction, saveJiraConnectionAction, syncJiraAction, testJiraConnectionAction, updateJiraBoardClassificationAction } from "@/lib/actions/actions";
import type { JiraActionState } from "@/lib/services/jira-service";
import { formatDate } from "@/lib/utils";

type JiraPanelProps = {
  missionId: string;
  demoDatasetTemplates: Array<{
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
  }>;
  activeDemoDataset: {
    id: string;
    code: string | null;
    name: string;
    description: string;
    category: string;
    difficulty: string;
    version: string;
    loadedAt: string;
    isActive: boolean;
    expectedPhenomena: string[];
  } | null;
  jira: {
    url: string;
    email: string;
    status: string;
    instanceName: string | null;
    lastTestedAt: string | null;
    lastSyncAt: string | null;
    lastError: string | null;
    demoCounts: {
      projects: number;
      boards: number;
      workflows: number;
      sprints: number;
      issues: number;
      transitions: number;
      comments: number;
      dependencies: number;
      expectedPhenomena: number;
    };
    expectedPhenomena: Array<{ code: string; label: string; expectedResult: string }>;
    projects: { key: string; name: string }[];
    boards: Array<{
      id: string;
      externalId: number;
      name: string;
      type: string | null;
      level: JiraBoardLevel;
      correctedLevel: JiraBoardLevel | null;
      parentBoardId: string | null;
      classificationStatus: JiraClassificationStatus;
      isDemo: boolean;
      demoDatasetName: string | null;
      project: { key: string; name: string } | null;
      workflow: {
        name: string;
        type: string;
        isDemo: boolean;
        demoDatasetName: string | null;
        steps: Array<{ name: string; statuses: { name: string }[] }>;
      } | null;
    }>;
  } | null;
};

const initialState: JiraActionState = { status: "idle" };
const boardLevels = ["PORTFOLIO", "TRAIN", "TEAM", "SUPPORT_OPS", "UNKNOWN"] as const;
type JiraBoardLevel = typeof boardLevels[number];
type JiraClassificationStatus = "DETECTED" | "CONFIRMED" | "CORRECTED" | "REJECTED";

export function JiraConnectionPanel({ missionId, demoDatasetTemplates, activeDemoDataset, jira }: JiraPanelProps) {
  const [saveState, saveAction, savePending] = useActionState(saveJiraConnectionAction.bind(null, missionId), initialState);
  const [testState, testAction, testPending] = useActionState(testJiraConnectionAction.bind(null, missionId), initialState);
  const [syncState, syncAction, syncPending] = useActionState(syncJiraAction.bind(null, missionId), initialState);
  const [templateDemoState, setTemplateDemoState] = useState<JiraActionState>(initialState);
  const [templateDemoPending, setTemplateDemoPending] = useState(false);
  const [resetDemoState, resetDemoAction, resetDemoPending] = useActionState(resetActiveDemoDatasetAction.bind(null, missionId), initialState);
  const [deleteDemoState, deleteDemoAction, deleteDemoPending] = useActionState(deleteAllDemoDataAction.bind(null, missionId), initialState);
  const [url, setUrl] = useState(jira?.url ?? "");
  const [email, setEmail] = useState(jira?.email ?? "");
  const [apiToken, setApiToken] = useState("");
  const message = deleteDemoState.status !== "idle" ? deleteDemoState : resetDemoState.status !== "idle" ? resetDemoState : templateDemoState.status !== "idle" ? templateDemoState : syncState.status !== "idle" ? syncState : testState.status !== "idle" ? testState : saveState;

  useEffect(() => {
    setUrl(jira?.url ?? "");
    setEmail(jira?.email ?? "");
    setApiToken("");
  }, [jira?.url, jira?.email]);

  useEffect(() => {
    if (saveState.status === "success") setApiToken("");
  }, [saveState.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connexion Jira</CardTitle>
        <p className="mt-2 text-sm text-slatecopy">Configuration technique pour recuperer projets, boards, colonnes, statuts et workflows. Aucun ticket ni commentaire n'est analyse.</p>
      </CardHeader>
      <CardContent className="grid gap-5">
        {message.message ? (
          <div className={message.status === "error" ? "whitespace-pre-line rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive" : "whitespace-pre-line rounded-md border border-gold/50 bg-gold/10 p-3 text-sm text-night"}>
            {message.message}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="URL Jira">
            <input className={inputClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://votre-instance.atlassian.net" required />
          </Field>
          <Field label="Email">
            <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
          </Field>
          <Field label="API Token">
            <input className={inputClass} type="password" value={apiToken} onChange={(event) => setApiToken(event.target.value)} autoComplete="new-password" placeholder={jira ? "Token deja protege, laisser vide pour conserver" : "Token Jira"} />
          </Field>
          <div className="flex flex-wrap gap-2 md:col-span-3">
            <form action={saveAction}>
              <JiraHiddenFields url={url} email={email} apiToken={apiToken} />
              <Button type="submit" disabled={savePending}>{savePending ? "Sauvegarde..." : "Sauvegarder"}</Button>
            </form>
            <form action={testAction}>
              <JiraHiddenFields url={url} email={email} apiToken={apiToken} />
              <Button type="submit" variant="secondary" disabled={testPending}>{testPending ? "Test..." : "Tester la connexion"}</Button>
            </form>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={syncAction}>
            <Button type="submit" variant="secondary" disabled={syncPending || !jira}>{syncPending ? "Synchronisation..." : "Synchroniser Jira"}</Button>
          </form>
        </div>
        <DemoDatasetManagement
          missionId={missionId}
          activeDemoDataset={activeDemoDataset}
          demoDatasetTemplates={demoDatasetTemplates}
          jira={jira}
          setTemplateDemoState={setTemplateDemoState}
          setTemplateDemoPending={setTemplateDemoPending}
          resetDemoAction={resetDemoAction}
          deleteDemoAction={deleteDemoAction}
          pending={templateDemoPending || resetDemoPending || deleteDemoPending}
        />
        <DemoSummary jira={jira} actionSummary={templateDemoState.summary} />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Statut" value={jira?.status ?? "NOT_CONFIGURED"} />
          <Metric label="Projets detectes" value={String(jira?.projects.length ?? 0)} />
          <Metric label="Boards detectes" value={String(jira?.boards.length ?? 0)} />
          <Metric label="Derniere synchro" value={jira?.lastSyncAt ? formatDate(jira.lastSyncAt) : "Non realisee"} />
        </div>
        {jira?.lastError ? <p className="text-sm text-destructive">Derniere erreur : {jira.lastError}</p> : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-gold/35 bg-white p-4">
            <h3 className="font-semibold text-night">Projets detectes</h3>
            <ul className="mt-3 grid gap-2 text-sm text-slatecopy">
              {jira?.projects.length ? jira.projects.map((project) => <li key={project.key}>{project.key} - {project.name}</li>) : <li>Aucun projet synchronise.</li>}
            </ul>
          </div>
          <div className="rounded-lg border border-gold/35 bg-white p-4">
            <h3 className="font-semibold text-night">Boards et workflows</h3>
            <div className="mt-3 grid gap-3 text-sm">
              {jira?.boards.length ? jira.boards.map((board) => (
                <details key={board.externalId} className="rounded-md border border-gold/25 p-3">
                  <summary className="cursor-pointer font-semibold text-night">{board.name} {board.isDemo ? <DemoBadge /> : null} {board.workflow ? `(${board.workflow.type})` : ""}</summary>
                  <div className="mt-2 text-slatecopy">
                    {(board.workflow?.steps ?? []).map((step) => (
                      <div key={step.name} className="mt-2">
                        <div className="font-medium text-night">{step.name}</div>
                        <div className="text-xs">{step.statuses.map((status) => status.name).join(", ") || "Aucun statut"}</div>
                      </div>
                    ))}
                  </div>
                </details>
              )) : <p className="text-slatecopy">Aucun board synchronise.</p>}
            </div>
          </div>
        </div>
        <JiraSpaceClassification missionId={missionId} boards={jira?.boards ?? []} />
        <p className="text-xs text-slatecopy">Securite : le token n'est jamais affiche apres sauvegarde. Il est chiffre cote serveur avec JIRA_TOKEN_SECRET ou NEXTAUTH_SECRET.</p>
      </CardContent>
    </Card>
  );
}

function DemoSummary({ jira, actionSummary }: { jira: JiraPanelProps["jira"]; actionSummary: JiraActionState["summary"] }) {
  const counts = actionSummary ?? (jira ? {
    projects: jira.demoCounts.projects,
    boards: jira.demoCounts.boards,
    workflows: jira.demoCounts.workflows,
    sprints: jira.demoCounts.sprints,
    issues: jira.demoCounts.issues,
    transitions: jira.demoCounts.transitions,
    comments: jira.demoCounts.comments,
    dependencies: jira.demoCounts.dependencies,
    expectedPhenomena: jira.demoCounts.expectedPhenomena
  } : null);
  if (!counts) return null;
  return (
    <div className="rounded-lg border border-gold/35 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-night">Résumé du jeu DEMO Jira</h3>
        <DemoBadge />
      </div>
      <div className="mt-3 grid gap-2 text-sm text-slatecopy md:grid-cols-5">
        <Metric label="Projets demo" value={String(counts.projects)} />
        <Metric label="Boards demo" value={String(counts.boards)} />
        <Metric label="Workflows demo" value={String(counts.workflows)} />
        <Metric label="Sprints demo" value={String(counts.sprints)} />
        <Metric label="Tickets demo" value={String(counts.issues)} />
        <Metric label="Transitions" value={String(counts.transitions)} />
        <Metric label="Commentaires" value={String(counts.comments)} />
        <Metric label="Dependances" value={String(counts.dependencies)} />
        <Metric label="Phenomenes attendus" value={String(counts.expectedPhenomena)} />
      </div>
      {jira?.expectedPhenomena.length ? (
        <div className="mt-4 grid gap-2">
          {jira.expectedPhenomena.map((phenomenon) => (
            <div key={phenomenon.code} className="rounded-md border border-gold/25 bg-ivory p-3 text-sm">
              <div className="font-semibold text-night">{phenomenon.code} - {phenomenon.label}</div>
              <div className="mt-1 text-slatecopy">{phenomenon.expectedResult}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DemoDatasetManagement({
  missionId,
  activeDemoDataset,
  demoDatasetTemplates,
  jira,
  setTemplateDemoState,
  setTemplateDemoPending,
  resetDemoAction,
  deleteDemoAction,
  pending
}: {
  missionId: string;
  activeDemoDataset: JiraPanelProps["activeDemoDataset"];
  demoDatasetTemplates: JiraPanelProps["demoDatasetTemplates"];
  jira: JiraPanelProps["jira"];
  setTemplateDemoState: (state: JiraActionState) => void;
  setTemplateDemoPending: (pending: boolean) => void;
  resetDemoAction: (payload: FormData) => void;
  deleteDemoAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const counts = jira?.demoCounts;
  async function handleTemplateLoad(templateCode: string) {
    if (activeDemoDataset && !confirm("Le jeu de donnees actuellement charge sera supprime. Les donnees Jira reelles seront conservees. Continuer ?")) return;
    setTemplateDemoPending(true);
    try {
      const result = await loadDemoDatasetTemplateAction(missionId, templateCode, initialState);
      setTemplateDemoState(result);
    } catch (error) {
      setTemplateDemoState({
        status: "error",
        message: error instanceof Error ? error.message : "Chargement du jeu DEMO impossible."
      });
    } finally {
      setTemplateDemoPending(false);
    }
  }
  const demoAction = () => void handleTemplateLoad("JIRA_STRUCTURE_ONLY");
  const realisticDemoAction = () => void handleTemplateLoad("VALIDATION_CONCENTRATION");
  return (
    <div className="rounded-lg border border-gold/35 bg-ivory p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-night">Jeux de données de démonstration</h3>
          <p className="mt-1 text-sm text-slatecopy">Gestion des données DEMO isolées des données Jira réelles.</p>
        </div>
        <DemoBadge />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-md border border-gold/25 bg-white p-4">
          <h4 className="font-semibold text-night">Dataset actif</h4>
          {activeDemoDataset ? (
            <div className="mt-3 grid gap-2 text-sm text-slatecopy">
              <div>Nom : <span className="font-medium text-night">{activeDemoDataset.name}</span></div>
              <div>Description : <span className="font-medium text-night">{activeDemoDataset.description}</span></div>
              <div>Categorie : <span className="font-medium text-night">{activeDemoDataset.category}</span></div>
              <div>Difficulte : <span className="font-medium text-night">{activeDemoDataset.difficulty}</span></div>
              <div>Version : <span className="font-medium text-night">{activeDemoDataset.version}</span></div>
              <div>Date de chargement : <span className="font-medium text-night">{formatDate(activeDemoDataset.loadedAt)}</span></div>
              <div>Phenomenes simules : <span className="font-medium text-night">{activeDemoDataset.expectedPhenomena.length ? activeDemoDataset.expectedPhenomena.join(", ") : "Aucun"}</span></div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slatecopy">Aucun dataset DEMO actif.</p>
          )}
          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <Metric label="Projets" value={String(counts?.projects ?? 0)} />
            <Metric label="Boards" value={String(counts?.boards ?? 0)} />
            <Metric label="Workflows" value={String(counts?.workflows ?? 0)} />
            <Metric label="Tickets" value={String(counts?.issues ?? 0)} />
            <Metric label="Transitions" value={String(counts?.transitions ?? 0)} />
            <Metric label="Commentaires" value={String(counts?.comments ?? 0)} />
            <Metric label="Dependances" value={String(counts?.dependencies ?? 0)} />
          </div>
        </div>
        <div className="rounded-md border border-gold/25 bg-white p-4">
          <h4 className="font-semibold text-night">Raccourcis et securite</h4>
          <div className="mt-3 grid gap-2">
            <form action={demoAction} onSubmit={(event) => activeDemoDataset && !confirm("Le jeu actuel sera supprimé avant chargement. Continuer ?") ? event.preventDefault() : undefined}>
              <Button type="submit" variant="secondary" disabled={pending}>Charger structure seule</Button>
            </form>
            <form action={realisticDemoAction} onSubmit={(event) => activeDemoDataset && !confirm("Le jeu actuel sera supprimé avant chargement du dataset réaliste. Continuer ?") ? event.preventDefault() : undefined}>
              <Button type="submit" disabled={pending}>Charger structure + tickets + phénomènes</Button>
            </form>
            <form action={resetDemoAction} onSubmit={(event) => !confirm("Réinitialiser le jeu DEMO actif ? Les données Jira réelles seront conservées.") ? event.preventDefault() : undefined}>
              <Button type="submit" variant="secondary" disabled={pending || !activeDemoDataset}>Réinitialiser le jeu actif</Button>
            </form>
            <form action={deleteDemoAction} onSubmit={(event) => !confirm("Supprimer toutes les données DEMO de cette mission ? Les données Jira réelles seront conservées.") ? event.preventDefault() : undefined}>
              <Button type="submit" variant="danger" disabled={pending}>Supprimer toutes les données DEMO</Button>
            </form>
          </div>
        </div>
      </div>
      <div className="mt-5">
        <h4 className="font-semibold text-night">Bibliotheque des jeux disponibles</h4>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {demoDatasetTemplates.map((template) => (
            <div key={template.code} className="rounded-md border border-gold/25 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h5 className="font-semibold text-night">{template.name}</h5>
                  <p className="mt-1 text-sm text-slatecopy">{template.description}</p>
                </div>
                {activeDemoDataset?.code === template.code ? <span className="rounded-full border border-gold/70 bg-gold/15 px-2 py-1 text-xs font-semibold text-night">Actif</span> : null}
              </div>
              <div className="mt-3 grid gap-2 text-sm text-slatecopy sm:grid-cols-2">
                <div>Categorie : <span className="font-medium text-night">{template.category}</span></div>
                <div>Difficulte : <span className="font-medium text-night">{template.difficulty}</span></div>
                <div>Version : <span className="font-medium text-night">{template.version}</span></div>
                <div>Tickets estimes : <span className="font-medium text-night">{template.estimatedTickets}</span></div>
                <div>Projets estimes : <span className="font-medium text-night">{template.estimatedProjects}</span></div>
                <div>Boards estimes : <span className="font-medium text-night">{template.estimatedBoards}</span></div>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-medium text-night">Phenomenes simules</div>
                <div className="mt-1 text-slatecopy">{template.expectedPhenomena.length ? template.expectedPhenomena.join(", ") : "Aucun"}</div>
              </div>
              <div className="mt-4">
                <Button type="button" disabled={pending} onClick={() => void handleTemplateLoad(template.code)}>
                  {pending ? "Chargement..." : "Charger"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JiraSpaceClassification({ missionId, boards }: { missionId: string; boards: NonNullable<JiraPanelProps["jira"]>["boards"] }) {
  const grouped = groupBoardsByLevel(boards);
  return (
    <div className="grid gap-4 rounded-lg border border-gold/35 bg-ivory p-4">
      <div>
        <h3 className="font-semibold text-night">Classification des espaces Jira</h3>
        <p className="mt-1 text-sm text-slatecopy">Classement des boards detectes par niveau organisationnel. Aucun ticket ni commentaire n'est analyse.</p>
      </div>
      {boards.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
            <thead className="text-xs uppercase text-slatecopy">
              <tr>
                <th className="px-3 py-2">Board</th>
                <th className="px-3 py-2">Projet</th>
                <th className="px-3 py-2">Type Jira</th>
                <th className="px-3 py-2">Workflow</th>
                <th className="px-3 py-2">Niveau propose</th>
                <th className="px-3 py-2">Correction / parent</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {boards.map((board) => (
                <tr key={board.id} className="bg-white align-top shadow-sm">
                  <td className="rounded-l-md border-y border-l border-gold/20 px-3 py-3 font-medium text-night">{board.name} {board.isDemo ? <DemoBadge /> : null}</td>
                  <td className="border-y border-gold/20 px-3 py-3 text-slatecopy">{board.project ? `${board.project.key} - ${board.project.name}` : "Non rattache"}</td>
                  <td className="border-y border-gold/20 px-3 py-3 text-slatecopy">{board.type ?? "Non renseigne"}</td>
                  <td className="border-y border-gold/20 px-3 py-3 text-slatecopy">{board.workflow?.name ?? "Non detecte"} {board.workflow?.isDemo ? <DemoBadge /> : null}</td>
                  <td className="border-y border-gold/20 px-3 py-3"><LevelBadge level={board.level} /></td>
                  <td className="border-y border-gold/20 px-3 py-3">
                    <form action={updateJiraBoardClassificationAction.bind(null, missionId, board.id)} className="grid gap-2">
                      <select name="correctedLevel" defaultValue={board.correctedLevel ?? board.level} className={inputClass}>
                        {boardLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                      <select name="parentBoardId" defaultValue={board.parentBoardId ?? ""} className={inputClass}>
                        <option value="">Aucun parent</option>
                        {boards.filter((candidate) => candidate.id !== board.id).map((candidate) => (
                          <option key={candidate.id} value={candidate.id}>{candidate.name} ({effectiveLevel(candidate)})</option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-2">
                        <Button type="submit" name="classificationAction" value="correct" variant="secondary">Corriger</Button>
                        <Button type="submit" name="classificationAction" value="confirm">Confirmer</Button>
                        <Button type="submit" name="classificationAction" value="reject" variant="ghost">Rejeter</Button>
                      </div>
                    </form>
                  </td>
                  <td className="border-y border-gold/20 px-3 py-3"><StatusPill status={board.classificationStatus} /></td>
                  <td className="rounded-r-md border-y border-r border-gold/20 px-3 py-3 text-slatecopy">
                    <div>Niveau effectif : <span className="font-medium text-night">{effectiveLevel(board)}</span></div>
                    <div>Parent : <span className="font-medium text-night">{boards.find((candidate) => candidate.id === board.parentBoardId)?.name ?? "Aucun"}</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-md border border-gold/25 bg-white p-3 text-sm text-slatecopy">Aucun board Jira synchronise.</p>
      )}
      <div className="grid gap-3 lg:grid-cols-2">
        {(["PORTFOLIO", "TRAIN", "TEAM", "SUPPORT_OPS", "UNKNOWN"] as JiraBoardLevel[]).map((level) => (
          <div key={level} className="rounded-lg border border-gold/25 bg-white p-4">
            <h4 className="font-semibold text-night">{groupLabel(level)}</h4>
            <div className="mt-3 grid gap-3 text-sm text-slatecopy">
              {grouped[level].length ? grouped[level].map((board) => (
                <div key={board.id} className="rounded-md border border-gold/20 p-3">
                  <div className="font-medium text-night">{board.name}</div>
                  {board.isDemo ? <div className="mt-1"><DemoBadge /></div> : null}
                  <div className="mt-1">{board.workflow?.steps.map((step) => step.name).join(" -> ") || "Workflow non detecte"}</div>
                </div>
              )) : <div>Aucun workflow dans ce groupe.</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JiraHiddenFields({ url, email, apiToken }: { url: string; email: string; apiToken: string }) {
  return (
    <>
      <input type="hidden" name="url" value={url} />
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="apiToken" value={apiToken || ""} />
    </>
  );
}

function effectiveLevel(board: { level: JiraBoardLevel; correctedLevel: JiraBoardLevel | null; classificationStatus: JiraClassificationStatus }) {
  if (board.classificationStatus === "REJECTED") return "UNKNOWN";
  return board.correctedLevel ?? board.level;
}

function groupBoardsByLevel(boards: NonNullable<JiraPanelProps["jira"]>["boards"]) {
  const groups: Record<JiraBoardLevel, typeof boards> = {
    PORTFOLIO: [],
    TRAIN: [],
    TEAM: [],
    SUPPORT_OPS: [],
    UNKNOWN: []
  };
  for (const board of boards) groups[effectiveLevel(board)].push(board);
  return groups;
}

function groupLabel(level: JiraBoardLevel) {
  return {
    PORTFOLIO: "Portfolio",
    TRAIN: "Train",
    TEAM: "Equipes",
    SUPPORT_OPS: "Support / OPS",
    UNKNOWN: "Unknown"
  }[level];
}

function LevelBadge({ level }: { level: JiraBoardLevel }) {
  return <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-1 text-xs font-semibold text-night">{level}</span>;
}

function DemoBadge() {
  return <span className="ml-2 inline-flex rounded-full border border-gold/70 bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-night">DEMO</span>;
}

function StatusPill({ status }: { status: JiraClassificationStatus }) {
  return <span className="rounded-full border border-night/15 bg-night/5 px-2 py-1 text-xs font-semibold text-night">{status}</span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold/35 bg-ivory p-4">
      <div className="text-sm text-slatecopy">{label}</div>
      <div className="mt-1 text-lg font-semibold text-night">{value}</div>
    </div>
  );
}
