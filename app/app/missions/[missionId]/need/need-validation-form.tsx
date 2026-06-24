"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, inputClass } from "@/components/ui/form";
import { saveNeedAction } from "@/lib/actions/actions";
import type { NeedValidationState } from "@/lib/services/need-service";

type NeedFormProps = {
  missionId: string;
  initialValues: {
    rawNeed: string;
    investigationPurpose: string;
    initialScope: string;
    observedScope: string;
    validatedNeed: string;
    symptoms: string;
  };
};

const initialState: NeedValidationState = { status: "idle" };

export function NeedValidationForm({ missionId, initialValues }: NeedFormProps) {
  const router = useRouter();
  const [confirmationDismissed, setConfirmationDismissed] = useState(false);
  const [state, formAction, isPending] = useActionState(saveNeedAction.bind(null, missionId), initialState);
  const requiresConfirmation = state.status === "needs_confirmation" && !confirmationDismissed;

  useEffect(() => {
    if (state.status !== "idle") {
      router.refresh();
    }
    if (state.status === "needs_confirmation") {
      setConfirmationDismissed(false);
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="grid gap-4">
      <Card>
        <CardHeader><CardTitle>Cadrage</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          {state.message ? (
            <div className="rounded-md border border-gold/50 bg-gold/10 p-3 text-sm text-night" role="status">
              {state.message}
              {state.questionCount ? <span className="ml-1">({state.questionCount} question(s) ouverte(s))</span> : null}
            </div>
          ) : null}
          <Field label="Besoin brut"><textarea name="rawNeed" className={inputClass} rows={5} defaultValue={initialValues.rawNeed} /></Field>
          <Field label="But de l'investigation"><textarea name="investigationPurpose" className={inputClass} rows={3} defaultValue={initialValues.investigationPurpose} /></Field>
          <Field label="Perimetre initial"><textarea name="initialScope" className={inputClass} rows={3} defaultValue={initialValues.initialScope} /></Field>
          <Field label="Perimetre observe"><textarea name="observedScope" className={inputClass} rows={3} defaultValue={initialValues.observedScope} /></Field>
          <Field label="Besoin reformule et valide"><textarea name="validatedNeed" className={inputClass} rows={5} defaultValue={initialValues.validatedNeed} /></Field>
          <Field label="Symptomes, un par ligne"><textarea name="symptoms" className={inputClass} rows={4} defaultValue={initialValues.symptoms} /></Field>
          {requiresConfirmation ? (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-gold/50 bg-white p-3">
              <p className="mr-auto text-sm text-slatecopy">Le besoin n'est pas encore valide. Le consultant peut valider malgre les questions ouvertes.</p>
              <Button type="submit" name="forceValidation" value="true" disabled={isPending}>Valider quand meme</Button>
              <Button type="button" variant="secondary" onClick={() => { setConfirmationDismissed(true); router.refresh(); }} disabled={isPending}>Annuler</Button>
            </div>
          ) : (
            <Button type="submit" disabled={isPending}>{isPending ? "Controle en cours..." : "Valider besoin"}</Button>
          )}
        </CardContent>
      </Card>
    </form>
  );
}
