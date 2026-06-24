import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { confirmExtractionItemsAction, deleteExtractionItemsAction, rejectExtractionItemsAction } from "@/lib/actions/actions";
import type { ConsolidatedWorkflow } from "@/lib/services/theoretical-extraction-service";

export function WorkflowConsolidationSection({ missionId, workflows }: { missionId: string; workflows: ConsolidatedWorkflow[] }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Workflows consolides</CardTitle>
        <p className="mt-2 text-sm text-slatecopy">Workflows regroupes par type, avec etapes fusionnees et sources conservees.</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {workflows.length ? workflows.map((workflow) => {
          const ids = workflow.itemIds.join(",");
          return (
            <div key={workflow.key} className="rounded-lg border border-gold/35 bg-white p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-night">{workflow.name}</h3>
                  <p className="mt-1 text-sm text-slatecopy">Type : {workflow.type}</p>
                  <p className="text-sm text-slatecopy">Sources : {workflow.sources.join(", ")}</p>
                  <p className="text-sm text-slatecopy">Confiance : {Math.round(workflow.confidence * 100)} % - Statut : {workflow.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {workflow.steps.map((step, index) => (
                    <span key={`${step}-${index}`} className="rounded-full border border-gold/50 bg-gold/10 px-3 py-1 text-sm font-semibold text-night">
                      {index + 1}. {step}
                    </span>
                  ))}
                </div>
              </div>
              {workflow.ambiguities.length ? (
                <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-semibold">Ambiguites</div>
                  <ul className="mt-1 grid gap-1">
                    {workflow.ambiguities.map((ambiguity) => <li key={ambiguity}>{ambiguity}</li>)}
                  </ul>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                <form action={confirmExtractionItemsAction.bind(null, missionId, ids)} className="grid gap-2 md:grid-cols-[1fr_auto]">
                  <Field label="Modifier / ajouter / reordonner les etapes">
                    <input name="correction" className={inputClass} placeholder={workflow.steps.join(" -> ")} />
                  </Field>
                  <div className="flex items-end">
                    <Button type="submit" variant="secondary">Valider le workflow</Button>
                  </div>
                </form>
                <div className="flex items-end gap-2">
                  <form action={rejectExtractionItemsAction.bind(null, missionId, ids)}>
                    <Button type="submit" variant="ghost">Rejeter</Button>
                  </form>
                  <form action={deleteExtractionItemsAction.bind(null, missionId, ids)}>
                    <Button type="submit" variant="danger">Supprimer</Button>
                  </form>
                </div>
              </div>
            </div>
          );
        }) : <p className="rounded-lg border border-dashed border-gold/60 bg-ivory p-6 text-sm text-slatecopy">Aucun workflow consolide. Lancez l'extraction IA mockee.</p>}
      </CardContent>
    </Card>
  );
}
