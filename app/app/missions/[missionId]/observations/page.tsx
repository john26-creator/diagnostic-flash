import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceList } from "@/components/evidence-list";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { ExportActions } from "@/components/export-actions";

export default async function ObservationsPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  return (
    <>
      <PageHeader
        title="Observations et hypotheses"
        description="Les observations sont des faits remarquables relies a des preuves. Les hypotheses sont des pistes d'investigation, jamais des conclusions."
        status={mission.status}
      >
        <ExportActions missionId={mission.id} type="observations" />
      </PageHeader>
      <main className="grid gap-6 p-6">
        {mission.observations.map((observation) => (
          <Card key={observation.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{observation.title}</CardTitle>
                <div className="flex gap-2"><StatusBadge value={observation.level} /><StatusBadge value={observation.status} /></div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 lg:grid-cols-[1fr_1fr]">
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Fait observe</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{observation.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Preuves</h3>
                  <div className="mt-2"><EvidenceList proofs={observation.proofs} /></div>
                </div>
              </section>
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold">Hypotheses possibles</h3>
                  <ul className="mt-2 grid gap-2 text-sm">
                    {observation.hypotheses.map((hypothesis) => (
                      <li key={hypothesis.id} className="rounded-md border border-border p-3">
                        <div className="flex justify-between gap-3"><span>{hypothesis.description}</span><StatusBadge value={hypothesis.status} /></div>
                        <div className="mt-1 text-xs text-muted-foreground">Confiance indicative : {hypothesis.confidenceLabel}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Questions d'investigation</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {observation.investigationQuestions.map((question) => <li key={question.id}>{question.question}</li>)}
                  </ul>
                </div>
              </section>
            </CardContent>
          </Card>
        ))}
        {!mission.observations.length ? <Card><CardContent><p className="text-sm text-muted-foreground">Aucune observation. Lancez l'analyse mockee depuis le cockpit mission.</p></CardContent></Card> : null}
      </main>
    </>
  );
}
