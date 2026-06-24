import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/form";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { saveNeedAction } from "@/lib/actions/actions";
import { StatusBadge } from "@/components/status-badge";
import { ExportActions } from "@/components/export-actions";

export default async function NeedPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  const need = mission.need;
  return (
    <>
      <PageHeader title="Besoin valide" description="Clarifier la demande sans promettre de diagnostic ni de plan d'action automatique." status={mission.status}>
        <ExportActions missionId={mission.id} type="need" />
      </PageHeader>
      <main className="grid gap-6 p-6 xl:grid-cols-[1fr_420px]">
        <form action={saveNeedAction.bind(null, mission.id)} className="grid gap-4">
          <Card>
            <CardHeader><CardTitle>Cadrage</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Besoin brut"><textarea name="rawNeed" className={inputClass} rows={5} defaultValue={need?.rawNeed ?? ""} /></Field>
              <Field label="But de l'investigation"><textarea name="investigationPurpose" className={inputClass} rows={3} defaultValue={need?.investigationPurpose ?? ""} /></Field>
              <Field label="Perimetre initial"><textarea name="initialScope" className={inputClass} rows={3} defaultValue={need?.initialScope ?? ""} /></Field>
              <Field label="Perimetre observe"><textarea name="observedScope" className={inputClass} rows={3} defaultValue={need?.observedScope ?? ""} /></Field>
              <Field label="Besoin reformule et valide"><textarea name="validatedNeed" className={inputClass} rows={5} defaultValue={need?.validatedNeed ?? ""} /></Field>
              <Field label="Symptomes, un par ligne"><textarea name="symptoms" className={inputClass} rows={4} defaultValue={need?.symptoms.map((s) => s.label).join("\n") ?? ""} /></Field>
              <Button type="submit">Valider besoin</Button>
            </CardContent>
          </Card>
        </form>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Questions proposees</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {need?.aiClarifications.length ? need.aiClarifications.map((item) => (
                <div key={item.id} className="rounded-md border border-border p-3">
                  <div className="flex justify-between gap-3"><StatusBadge value={item.type} /><StatusBadge value={item.status} /></div>
                  <p className="mt-2 text-sm">{item.question}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Enregistrez le besoin brut pour generer des questions mockees.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Symptomes</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid gap-2 text-sm">{need?.symptoms.map((symptom) => <li key={symptom.id}>• {symptom.label}</li>)}</ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
