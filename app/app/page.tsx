import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/form";
import { EmptyState } from "@/components/empty-state";
import { requireUser } from "@/lib/auth";
import { listWorkspace } from "@/lib/services/mission-service";
import { createClientAction, createMissionAction } from "@/lib/actions/actions";
import { StatusBadge } from "@/components/status-badge";

export default async function WorkspacePage() {
  const user = await requireUser();
  const clients = await listWorkspace(user.id);
  return (
    <>
      <PageHeader
        title="Clients et missions"
        description="Espace multi-client. Chaque mission reste rattachee au consultant connecte, au client et a son perimetre."
      />
      <main className="grid gap-6 p-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {clients.length === 0 ? (
            <EmptyState title="Aucun client" description="Creez un client, puis une mission pour demarrer un diagnostic." />
          ) : (
            clients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <CardTitle>{client.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{client.industry || "Secteur non renseigne"}</p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {client.missions.length ? (
                    client.missions.map((mission) => (
                      <Link key={mission.id} href={`/app/missions/${mission.id}`} className="rounded-md border border-gold/35 p-4 hover:bg-gold/10">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold">{mission.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Sources {mission._count.sources} · Observations {mission._count.observations} · Hypotheses {mission._count.hypotheses}
                            </div>
                          </div>
                          <StatusBadge value={mission.status} />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune mission pour ce client.</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </section>
        <aside className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Nouveau client</CardTitle></CardHeader>
            <CardContent>
              <form action={createClientAction} className="grid gap-3">
                <Field label="Nom"><input name="name" className={inputClass} required /></Field>
                <Field label="Secteur"><input name="industry" className={inputClass} /></Field>
                <Field label="Description"><textarea name="description" className={inputClass} rows={3} /></Field>
                <Button type="submit">Creer client</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Nouvelle mission</CardTitle></CardHeader>
            <CardContent>
              <form action={createMissionAction} className="grid gap-3">
                <Field label="Client">
                  <select name="clientId" className={inputClass} required>
                    <option value="">Selectionner</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </Field>
                <Field label="Nom mission"><input name="name" className={inputClass} required /></Field>
                <Field label="Description"><textarea name="description" className={inputClass} rows={3} /></Field>
                <Field label="Debut investigation"><input name="investigationStartDate" type="date" className={inputClass} /></Field>
                <Field label="Fin investigation"><input name="investigationEndDate" type="date" className={inputClass} /></Field>
                <Button type="submit" disabled={!clients.length}>Creer mission</Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
