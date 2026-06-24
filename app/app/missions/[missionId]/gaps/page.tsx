import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { ExportActions } from "@/components/export-actions";

export default async function GapsPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  return (
    <>
      <PageHeader title="Carte des ecarts" description="Comparer le modele theorique et le modele observe. Un ecart n'est pas une cause." status={mission.status}>
        <ExportActions missionId={mission.id} type="gaps" />
      </PageHeader>
      <main className="p-6">
        <Card>
          <CardHeader><CardTitle>Ecarts identifies</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr><th>Classification</th><th>Theorique</th><th>Observe</th><th>Observation liee</th></tr></thead>
              <tbody>
                {mission.gaps.map((gap) => (
                  <tr key={gap.id} className="border-t border-border align-top">
                    <td className="py-3"><StatusBadge value={gap.classification} /></td>
                    <td className="max-w-sm py-3">{gap.theoreticalElement}</td>
                    <td className="max-w-sm py-3">{gap.observedElement}</td>
                    <td className="py-3">{gap.observation?.title ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!mission.gaps.length ? <p className="text-sm text-muted-foreground">Lancez l'analyse mockee depuis le cockpit pour generer une premiere carte.</p> : null}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
