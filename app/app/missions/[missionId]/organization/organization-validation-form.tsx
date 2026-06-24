"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validateTheoreticalModelAction } from "@/lib/actions/actions";
import type { OrganizationValidationState } from "@/lib/services/theoretical-extraction-service";

const initialState: OrganizationValidationState = { status: "idle" };

export function OrganizationValidationForm({ missionId, organizationStatus }: { missionId: string; organizationStatus: string }) {
  const router = useRouter();
  const [confirmationDismissed, setConfirmationDismissed] = useState(false);
  const [state, formAction, isPending] = useActionState(validateTheoreticalModelAction.bind(null, missionId), initialState);
  const requiresConfirmation = state.status === "needs_confirmation" && !confirmationDismissed;

  useEffect(() => {
    if (state.status !== "idle") router.refresh();
    if (state.status === "needs_confirmation") setConfirmationDismissed(false);
  }, [router, state.status]);

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Validation du modele theorique</CardTitle>
        <p className="mt-2 text-sm text-slatecopy">Le consultant garde la decision finale. La validation ne produit aucun diagnostic automatique.</p>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="rounded-lg border border-gold/35 bg-ivory p-4 text-sm text-slatecopy">
          Statut actuel : <span className="font-semibold text-night">{organizationStatus}</span>
        </div>
        {state.message ? (
          <div className="rounded-md border border-gold/50 bg-gold/10 p-3 text-sm text-night" role="status">
            {state.message}
            {state.ambiguityCount ? <span className="ml-1">({state.ambiguityCount} ambiguite(s) ouverte(s))</span> : null}
            {state.ambiguities?.length ? (
              <ul className="mt-2 grid gap-1 text-slatecopy">
                {state.ambiguities.map((ambiguity) => <li key={ambiguity}>{ambiguity}</li>)}
              </ul>
            ) : null}
          </div>
        ) : null}
        <form action={formAction}>
          {requiresConfirmation ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-gold/50 bg-white p-3">
              <p className="mr-auto text-sm text-slatecopy">Des questions subsistent. Vous pouvez valider malgre tout et conserver les ambiguities ouvertes.</p>
              <Button type="submit" name="forceValidation" value="true" disabled={isPending}>Valider malgre tout</Button>
              <Button type="button" variant="secondary" onClick={() => { setConfirmationDismissed(true); router.refresh(); }} disabled={isPending}>Annuler</Button>
            </div>
          ) : (
            <Button type="submit" disabled={isPending}>{isPending ? "Controle en cours..." : "Valider le modele theorique"}</Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
