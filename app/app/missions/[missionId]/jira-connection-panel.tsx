"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { saveJiraConnectionAction, syncJiraAction, testJiraConnectionAction } from "@/lib/actions/actions";
import type { JiraActionState } from "@/lib/services/jira-service";
import { formatDate } from "@/lib/utils";

type JiraPanelProps = {
  missionId: string;
  jira: {
    url: string;
    email: string;
    status: string;
    instanceName: string | null;
    lastTestedAt: string | null;
    lastSyncAt: string | null;
    lastError: string | null;
    projects: { key: string; name: string }[];
    boards: Array<{
      externalId: number;
      name: string;
      type: string | null;
      workflow: {
        name: string;
        type: string;
        steps: Array<{ name: string; statuses: { name: string }[] }>;
      } | null;
    }>;
  } | null;
};

const initialState: JiraActionState = { status: "idle" };

export function JiraConnectionPanel({ missionId, jira }: JiraPanelProps) {
  const [saveState, saveAction, savePending] = useActionState(saveJiraConnectionAction.bind(null, missionId), initialState);
  const [testState, testAction, testPending] = useActionState(testJiraConnectionAction.bind(null, missionId), initialState);
  const [syncState, syncAction, syncPending] = useActionState(syncJiraAction.bind(null, missionId), initialState);
  const [url, setUrl] = useState(jira?.url ?? "");
  const [email, setEmail] = useState(jira?.email ?? "");
  const [apiToken, setApiToken] = useState("");
  const message = syncState.status !== "idle" ? syncState : testState.status !== "idle" ? testState : saveState;

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
        <form action={syncAction}>
          <Button type="submit" variant="secondary" disabled={syncPending || !jira}>{syncPending ? "Synchronisation..." : "Synchroniser Jira"}</Button>
        </form>

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
                  <summary className="cursor-pointer font-semibold text-night">{board.name} {board.workflow ? `(${board.workflow.type})` : ""}</summary>
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
        <p className="text-xs text-slatecopy">Securite : le token n'est jamais affiche apres sauvegarde. Il est chiffre cote serveur avec JIRA_TOKEN_SECRET ou NEXTAUTH_SECRET.</p>
      </CardContent>
    </Card>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gold/35 bg-ivory p-4">
      <div className="text-sm text-slatecopy">{label}</div>
      <div className="mt-1 text-lg font-semibold text-night">{value}</div>
    </div>
  );
}
