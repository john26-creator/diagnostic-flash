"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { cn, formatDate } from "@/lib/utils";

type SourceDocumentaireView = {
  id: string;
  type: string;
  nom: string;
  description: string | null;
  fichierNom: string | null;
  fichierTaille: number | null;
  referenceUrl: string | null;
  statut: string;
  dateAjout: string;
};

const sourceTypes = [
  ["ORGANIGRAMME", "Organigramme"],
  ["RACI", "RACI"],
  ["FICHE_POSTE", "Fiche de poste"],
  ["PROCESSUS", "Processus"],
  ["MODE_OPERATOIRE", "Mode operatoire"],
  ["WORKFLOW_JIRA", "Workflow Jira"],
  ["SLA", "SLA"],
  ["CONFLUENCE", "Confluence"],
  ["INCIDENT", "Incident"],
  ["AUTRE", "Autre"]
] as const;

const statusLabels: Record<string, string> = {
  IMPORTEE: "Importee",
  ANALYSEE: "Analysee",
  UTILISEE: "Utilisee",
  ERREUR: "Erreur"
};

const typeLabels = Object.fromEntries(sourceTypes);

export function SourceDocumentsPanel({
  missionId,
  initialSources
}: {
  missionId: string;
  initialSources: SourceDocumentaireView[];
}) {
  const [sources, setSources] = useState(initialSources);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endpoint = `/api/missions/${missionId}/source-documents`;
  const sortedSources = useMemo(() => [...sources].sort((a, b) => b.dateAjout.localeCompare(a.dateAjout)), [sources]);

  async function refreshSources() {
    const response = await fetch(endpoint);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Impossible de charger les sources documentaires.");
    setSources(payload.documents.map(toView));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Impossible d'ajouter la source documentaire.");
      form.reset();
      await refreshSources();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erreur inconnue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markUsed(sourceId: string) {
    await mutateSource(sourceId, {
      method: "PATCH",
      body: JSON.stringify({ statut: "UTILISEE" }),
      headers: { "Content-Type": "application/json" }
    });
  }

  async function deleteSource(sourceId: string) {
    if (!window.confirm("Supprimer cette source documentaire et son fichier associe ?")) return;
    await mutateSource(sourceId, { method: "DELETE" });
  }

  async function mutateSource(sourceId: string, init: RequestInit) {
    setError(null);
    try {
      const response = await fetch(`${endpoint}/${sourceId}`, init);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Action impossible sur cette source documentaire.");
      await refreshSources();
    } catch (mutationError) {
      setError(mutationError instanceof Error ? mutationError.message : "Erreur inconnue.");
    }
  }

  return (
    <Card className="xl:col-span-2 overflow-hidden">
      <CardHeader className="bg-night text-white">
        <CardTitle className="text-white">Sources du modele theorique</CardTitle>
        <p className="mt-2 text-sm text-white/70">Depot documentaire sans analyse IA, OCR, extraction de roles, RACI ou workflow.</p>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-gold/35 bg-ivory p-4 md:grid-cols-2">
          <Field label="Type">
            <select name="type" className={inputClass} required defaultValue="ORGANIGRAMME">
              {sourceTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Nom">
            <input name="nom" className={inputClass} required placeholder="Ex. RACI validation Feature" />
          </Field>
          <Field label="Description">
            <textarea name="description" className={inputClass} rows={3} placeholder="Contexte et usage attendu dans le modele theorique" />
          </Field>
          <Field label="Reference URL">
            <input name="referenceUrl" className={inputClass} placeholder="https://... ou reference interne" />
          </Field>
          <Field label="Fichier" className="md:col-span-2">
            <input name="file" className={cn(inputClass, "bg-white file:mr-4 file:rounded-md file:border-0 file:bg-night file:px-3 file:py-2 file:text-sm file:font-medium file:text-white")} type="file" accept=".pdf,.docx,.pptx,.xlsx,.csv,.png,.jpg,.jpeg" />
          </Field>
          {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Ajout en cours..." : "Ajouter la source"}</Button>
          </div>
        </form>

        {sortedSources.length ? (
          <div className="overflow-x-auto rounded-lg border border-gold/30">
            <table className="w-full text-left text-sm">
              <thead className="bg-night text-white">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Nom</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSources.map((source) => (
                  <tr key={source.id} className="border-t border-gold/25 bg-white align-top">
                    <td className="px-4 py-3 font-semibold text-night">{typeLabels[source.type] ?? source.type}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-night">{source.nom}</div>
                      {source.fichierNom ? <div className="text-xs text-slatecopy">{source.fichierNom} - {formatBytes(source.fichierTaille)}</div> : null}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-1 text-xs font-semibold text-night">{statusLabels[source.statut] ?? source.statut}</span>
                    </td>
                    <td className="px-4 py-3 text-slatecopy">{formatDate(source.dateAjout)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <details className="text-right">
                          <summary className="cursor-pointer text-xs font-semibold text-night underline decoration-gold underline-offset-4">Voir details</summary>
                          <div className="mt-2 min-w-64 rounded-md border border-gold/35 bg-ivory p-3 text-left text-xs text-slatecopy shadow-sm">
                            <div><strong className="text-night">Type :</strong> {typeLabels[source.type] ?? source.type}</div>
                            <div><strong className="text-night">Nom :</strong> {source.nom}</div>
                            <div><strong className="text-night">Description :</strong> {source.description || "Non renseignee"}</div>
                            <div><strong className="text-night">Date ajout :</strong> {formatDate(source.dateAjout)}</div>
                            <div><strong className="text-night">Reference :</strong> {source.referenceUrl || "Non renseignee"}</div>
                            <div><strong className="text-night">Fichier :</strong> {source.fichierNom || "Aucun fichier"}</div>
                          </div>
                        </details>
                        {source.fichierNom ? (
                          <a className="inline-flex h-10 items-center justify-center rounded-md border border-gold/70 bg-white px-4 text-sm font-medium text-night hover:bg-gold/10" href={`${endpoint}/${source.id}/download`}>
                            Telecharger
                          </a>
                        ) : null}
                        {source.statut !== "UTILISEE" ? <Button type="button" variant="secondary" onClick={() => markUsed(source.id)}>Marquer utilisee</Button> : null}
                        <Button type="button" variant="danger" onClick={() => deleteSource(source.id)}>Supprimer</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gold/60 bg-white p-6 text-sm text-slatecopy">
            Aucune source documentaire importee pour le moment.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function toView(source: SourceDocumentaireView & { dateAjout: string | Date }): SourceDocumentaireView {
  return {
    ...source,
    dateAjout: new Date(source.dateAjout).toISOString()
  };
}

function formatBytes(value: number | null) {
  if (!value) return "taille non renseignee";
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} Ko`;
  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
}
