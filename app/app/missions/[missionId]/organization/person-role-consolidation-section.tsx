import type { CanonicalRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { confirmExtractionItemsAction, deleteExtractionItemsAction, rejectExtractionItemsAction } from "@/lib/actions/actions";
import type { ConsolidatedPersonRole } from "@/lib/services/theoretical-extraction-service";

const canonicalRoles: CanonicalRole[] = ["SPONSOR", "PM", "PO", "RTE", "ARCHITECT", "SCRUM_MASTER", "BA", "DEV", "QA", "MANAGER", "OTHER"];

export function PersonRoleConsolidationSection({ missionId, people }: { missionId: string; people: ConsolidatedPersonRole[] }) {
  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Personnes et roles consolides</CardTitle>
        <p className="mt-2 text-sm text-slatecopy">Vue consolidee par personne, dedupliquee et tracable aux sources documentaires.</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {people.length ? people.map((person) => {
          const ids = person.itemIds.join(",");
          return (
            <div key={person.key} className="rounded-lg border border-gold/35 bg-white p-4">
              <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-start">
                <div>
                  <h3 className="text-base font-semibold text-night">{person.personName}</h3>
                  <p className="mt-1 text-sm text-slatecopy">Role detecte : {person.detectedRoles.join(", ")}</p>
                  <p className="text-sm text-slatecopy">Mapping SAFe : {person.mappedCanonicalRoles.join(", ") || "A confirmer"}</p>
                </div>
                <div className="text-sm text-slatecopy">
                  <div className="font-semibold text-night">Sources</div>
                  {person.sources.join(", ")}
                </div>
                <div className="text-sm text-slatecopy">
                  <div>Confiance : <span className="font-semibold text-night">{Math.round(person.confidence * 100)} %</span></div>
                  <div>Statut : <span className="font-semibold text-night">{person.status}</span></div>
                  {person.conflicts.length ? (
                    <ul className="mt-2 grid gap-1 text-amber-800">
                      {person.conflicts.map((conflict) => <li key={conflict}>Attention : {conflict}</li>)}
                    </ul>
                  ) : null}
                </div>
                <div className="grid min-w-56 gap-2">
                  <form action={confirmExtractionItemsAction.bind(null, missionId, ids)} className="grid gap-2">
                    <Field label="Correction role">
                      <input name="correction" className={inputClass} placeholder={person.detectedRoles[0]} />
                    </Field>
                    <Field label="Mapper">
                      <select name="mappedCanonicalRole" className={inputClass} defaultValue={person.mappedCanonicalRoles[0] ?? "OTHER"}>
                        {canonicalRoles.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </Field>
                    <Button type="submit" variant="secondary">Conserver / corriger</Button>
                  </form>
                  <form action={confirmExtractionItemsAction.bind(null, missionId, ids)}>
                    <Button type="submit" className="w-full">Fusionner doublons</Button>
                  </form>
                  <div className="grid grid-cols-2 gap-2">
                    <form action={rejectExtractionItemsAction.bind(null, missionId, ids)}>
                      <Button type="submit" variant="ghost" className="w-full">Rejeter</Button>
                    </form>
                    <form action={deleteExtractionItemsAction.bind(null, missionId, ids)}>
                      <Button type="submit" variant="danger" className="w-full">Supprimer</Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        }) : <p className="rounded-lg border border-dashed border-gold/60 bg-ivory p-6 text-sm text-slatecopy">Aucune personne consolidee. Lancez l'extraction IA mockee.</p>}
      </CardContent>
    </Card>
  );
}
