import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { ExportActions } from "@/components/export-actions";

export default async function InvestigationPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  return (
    <>
      <PageHeader title="Plan d'investigation" description="Plan d'echantillonnage reliant hypotheses, personnes et questions d'entretien." status={mission.status}>
        <ExportActions missionId={mission.id} type="investigation-plan" />
      </PageHeader>
      <main className="grid gap-6 p-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>Matrice hypotheses / personnes</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {mission.hypotheses.map((hypothesis) => (
              <div key={hypothesis.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><strong>{hypothesis.description}</strong><StatusBadge value={hypothesis.status} /></div>
                <div className="mt-3 grid gap-2 text-sm">
                  {hypothesis.hypothesisPersons.map((link) => <div key={link.id}>{link.person.name} · {link.person.role?.canonicalRole ?? "Role non mappe"} · priorite {link.priority}</div>)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Fiches entretien</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {mission.interviews.map((interview) => (
              <div key={interview.id} className="rounded-md border border-border p-3">
                <div className="flex justify-between gap-3"><strong>{interview.person.name}</strong><StatusBadge value={interview.status} /></div>
                <div className="mt-1 text-sm text-muted-foreground">{interview.person.role?.canonicalRole ?? "Role non mappe"} · {interview.notes}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
