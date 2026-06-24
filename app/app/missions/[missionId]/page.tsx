import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission, missionProgress } from "@/lib/services/mission-service";
import { formatDate, percent } from "@/lib/utils";
import { runMockAnalysisAction } from "@/lib/actions/actions";
import { cn } from "@/lib/utils";

const linkButton = "inline-flex h-10 items-center justify-center rounded-md border border-gold/60 bg-white px-4 text-sm font-medium text-night hover:bg-gold/10";

export default async function MissionCockpitPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  const progress = missionProgress(mission.status);
  return (
    <>
      <PageHeader title={mission.name} description={`${mission.client.name} · ${mission.description ?? "Diagnostic organisationnel"}`} status={mission.status}>
        <form action={runMockAnalysisAction.bind(null, mission.id)}>
          <Button type="submit">Lancer analyse mockee</Button>
        </form>
      </PageHeader>
      <main className="grid gap-6 p-6">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            ["Sources importees", mission._count.sources],
            ["Observations detectees", mission._count.observations],
            ["Hypotheses", mission._count.hypotheses],
            ["Entretiens", mission._count.interviews]
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent>
                <div className="text-3xl font-semibold">{value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </section>
        <Card>
          <CardHeader><CardTitle>Avancement mission</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-3 overflow-hidden rounded bg-gold/20"><div className="h-full bg-night" style={{ width: `${progress}%` }} /></div>
            <div className="flex items-center justify-between text-sm"><span>{percent(progress)}</span><StatusBadge value={mission.status} /></div>
          </CardContent>
        </Card>
        <section className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Informations generales</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div>Client : <strong>{mission.client.name}</strong></div>
              <div>Creation : {formatDate(mission.createdAt)}</div>
              <div>Debut investigation : {formatDate(mission.investigationStartDate)}</div>
              <div>Fin investigation : {formatDate(mission.investigationEndDate)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Prochaines actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Link className={cn(linkButton)} href={`/app/missions/${mission.id}/need`}>Besoin</Link>
              <Link className={cn(linkButton)} href={`/app/missions/${mission.id}/organization`}>Organisation</Link>
              <Link className={cn(linkButton)} href={`/app/missions/${mission.id}/observations`}>Observations</Link>
              <Link className={cn(linkButton)} href={`/app/missions/${mission.id}/synthesis`}>Exporter</Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
