import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EvidenceList } from "@/components/evidence-list";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { ExportActions } from "@/components/export-actions";

export default async function SynthesisPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  const synthesis = mission.investigationSynthesis;
  return (
    <>
      <PageHeader title="Synthese d'investigation" description="Livrable final structure : faits prouves, comprehensions retenues par le consultant et incertitudes." status={mission.status}>
        <ExportActions missionId={mission.id} type="synthesis" docx />
      </PageHeader>
      <main className="grid gap-6 p-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mission.deliverables.map((deliverable) => <Card key={deliverable.id}><CardContent><div className="font-semibold">{deliverable.type}</div><div className="mt-2"><StatusBadge value={deliverable.status} /></div></CardContent></Card>)}
        </section>
        <Card>
          <CardHeader><CardTitle>Faits observes avec preuves</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            {synthesis?.observations.map(({ observation }) => (
              <div key={observation.id} className="rounded-md border border-border p-4">
                <h3 className="font-semibold">{observation.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{observation.description}</p>
                <div className="mt-3"><EvidenceList proofs={observation.proofs} /></div>
              </div>
            ))}
          </CardContent>
        </Card>
        <section className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>Convergences</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{synthesis?.convergingElements ?? "A renseigner."}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Comprehensions retenues</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{synthesis?.retainedUnderstandings ?? "Manuel : a renseigner par le consultant."}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Incertitudes restantes</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">{synthesis?.remainingUncertainties ?? "Aucune certitude automatique."}</CardContent>
          </Card>
        </section>
        <Card>
          <CardHeader><CardTitle>Plan d'action</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Manuel. Le systeme ne genere pas de plan d'action automatique.</CardContent>
        </Card>
      </main>
    </>
  );
}
