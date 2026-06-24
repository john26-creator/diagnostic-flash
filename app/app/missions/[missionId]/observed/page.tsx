import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { ExportActions } from "@/components/export-actions";

export default async function ObservedPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  const byStatus = Object.entries(mission.canonicalArtifacts.reduce<Record<string, number>>((acc, artifact) => {
    acc[artifact.status] = (acc[artifact.status] ?? 0) + 1;
    return acc;
  }, {}));
  return (
    <>
      <PageHeader title="Modele observe" description="Ce que les donnees montrent factuellement apres mapping canonique." status={mission.status}>
        <ExportActions missionId={mission.id} type="observed-model" />
      </PageHeader>
      <main className="grid gap-6 p-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Flux observe</CardTitle></CardHeader>
          <CardContent className="grid gap-3">{byStatus.map(([status, count]) => <div key={status} className="flex justify-between rounded-md border border-border p-3"><span>{status}</span><strong>{count}</strong></div>)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Organisation observee</CardTitle></CardHeader>
          <CardContent className="grid gap-3">{mission.persons.map((person) => <div key={person.id} className="rounded-md border border-border p-3"><strong>{person.name}</strong><div className="text-sm text-muted-foreground">{person.role?.canonicalRole ?? "Role non mappe"} · {person.team ?? "Equipe non renseignee"}</div></div>)}</CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Artefacts canoniques</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm"><thead><tr><th>Cle</th><th>Titre</th><th>Type</th><th>Statut</th><th>Assigne</th></tr></thead><tbody>{mission.canonicalArtifacts.map((artifact) => <tr key={artifact.id} className="border-t border-border"><td className="py-2">{artifact.key}</td><td>{artifact.title}</td><td>{artifact.artifactType}</td><td>{artifact.status}</td><td>{artifact.assignee?.name ?? "-"}</td></tr>)}</tbody></table>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
