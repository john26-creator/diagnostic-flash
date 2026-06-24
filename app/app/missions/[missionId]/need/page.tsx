import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { StatusBadge } from "@/components/status-badge";
import { ExportActions } from "@/components/export-actions";
import { NeedValidationForm } from "@/app/app/missions/[missionId]/need/need-validation-form";

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
        <NeedValidationForm
          missionId={mission.id}
          initialValues={{
            rawNeed: need?.rawNeed ?? "",
            investigationPurpose: need?.investigationPurpose ?? "",
            initialScope: need?.initialScope ?? "",
            observedScope: need?.observedScope ?? "",
            validatedNeed: need?.validatedNeed ?? "",
            symptoms: need?.symptoms.map((s) => s.label).join("\n") ?? ""
          }}
        />
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Questions proposees</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {need?.aiClarifications.length ? need.aiClarifications.map((item) => {
                const source = parseClarificationSource(item.sourceText);
                return (
                  <div key={item.id} className="rounded-md border border-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={item.type} />
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">{source.fields.length > 1 ? "Champs concernés" : "Champ concerné"} :</span>{" "}
                      {source.fields.length ? source.fields.join(", ") : "Non renseigné"}
                    </p>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold text-primary">Question :</span> {item.question}
                    </p>
                  </div>
                );
              }) : <p className="text-sm text-muted-foreground">Aucune question ouverte en base.</p>}
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

function parseClarificationSource(sourceText: string | null) {
  if (!sourceText) return { fields: [] as string[] };

  try {
    const parsed = JSON.parse(sourceText) as { fields?: unknown };
    return {
      fields: Array.isArray(parsed.fields) ? parsed.fields.filter((field): field is string => typeof field === "string") : []
    };
  } catch {
    return { fields: [] as string[] };
  }
}
