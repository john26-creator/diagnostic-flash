import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getMission } from "@/lib/services/mission-service";
import { seedTheoryAction } from "@/lib/actions/actions";
import { ExportActions } from "@/components/export-actions";

export default async function OrganizationPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  return (
    <>
      <PageHeader title="Organisation theorique" description="Modele attendu valide par le consultant : roles, RACI et flux cible." status={mission.status}>
        <ExportActions missionId={mission.id} type="theoretical-model" />
        <form action={seedTheoryAction.bind(null, mission.id)}><Button type="submit">Generer modele demo</Button></form>
      </PageHeader>
      <main className="grid gap-6 p-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Roles et mapping</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {mission.roles.map((role) => <div key={role.id} className="rounded-md border border-border p-3"><strong>{role.name}</strong><div className="text-sm text-muted-foreground">{role.canonicalRole} · {role.description}</div></div>)}
            {mission.roles.length === 0 ? <p className="text-sm text-muted-foreground">Aucun role theorique. Generez le modele demo ou ajoutez des roles via service.</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>RACI</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr><th>Activite</th><th>Role</th><th>Niveau</th></tr></thead>
              <tbody>{mission.activities.flatMap((activity) => activity.raciAssignments.map((raci) => <tr key={raci.id} className="border-t border-border"><td className="py-2">{activity.name}</td><td>{raci.role.name}</td><td>{raci.level}</td></tr>))}</tbody>
            </table>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Flux theorique</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-5">
            {mission.theoreticalFlows[0]?.steps.map((step) => (
              <div key={step.id} className="rounded-md border border-border p-4">
                <div className="text-xs text-muted-foreground">Etape {step.order}</div>
                <div className="font-semibold">{step.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">Responsable : {step.responsibleRole?.name ?? "Non renseigne"}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
