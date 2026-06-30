import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { requireUser } from "@/lib/auth";
import { getMission, missionProgress } from "@/lib/services/mission-service";
import { listDemoDatasetTemplates, templateExpectedPhenomenaLabels } from "@/lib/demo-jira/demo-dataset-library";
import { formatDate, percent } from "@/lib/utils";
import { runMockAnalysisAction } from "@/lib/actions/actions";
import { cn } from "@/lib/utils";
import { JiraConnectionPanel } from "@/app/app/missions/[missionId]/jira-connection-panel";

const linkButton = "inline-flex h-10 items-center justify-center rounded-md border border-gold/60 bg-white px-4 text-sm font-medium text-night hover:bg-gold/10";

export default async function MissionCockpitPage({ params }: { params: Promise<{ missionId: string }> }) {
  const { missionId } = await params;
  const user = await requireUser();
  const mission = await getMission(user.id, missionId);
  const demoDatasetTemplates = await listDemoDatasetTemplates();
  const progress = missionProgress(mission.status);
  const activeLoadedDataset = mission.demoDatasetLoaded[0];
  const legacyActiveDataset = mission.demoDatasets[0];
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
        <JiraConnectionPanel
          missionId={mission.id}
          demoDatasetTemplates={demoDatasetTemplates.map((template) => ({
            code: template.code,
            name: template.name,
            description: template.description,
            category: template.category,
            difficulty: template.difficulty,
            version: template.version,
            estimatedTickets: template.estimatedTickets,
            estimatedProjects: template.estimatedProjects,
            estimatedBoards: template.estimatedBoards,
            expectedPhenomena: templateExpectedPhenomenaLabels(template.expectedPhenomena)
          }))}
          activeDemoDataset={activeLoadedDataset ? {
            id: activeLoadedDataset.id,
            code: activeLoadedDataset.template.code,
            name: activeLoadedDataset.template.name,
            description: activeLoadedDataset.template.description,
            category: activeLoadedDataset.template.category,
            difficulty: activeLoadedDataset.template.difficulty,
            version: activeLoadedDataset.version,
            loadedAt: activeLoadedDataset.loadedAt.toISOString(),
            isActive: activeLoadedDataset.isActive,
            expectedPhenomena: templateExpectedPhenomenaLabels(activeLoadedDataset.template.expectedPhenomena)
          } : legacyActiveDataset ? {
            id: legacyActiveDataset.id,
            code: null,
            name: legacyActiveDataset.name,
            description: legacyActiveDataset.description,
            category: "Legacy",
            difficulty: "Non renseignee",
            version: legacyActiveDataset.version,
            loadedAt: legacyActiveDataset.loadedAt.toISOString(),
            isActive: legacyActiveDataset.isActive,
            expectedPhenomena: []
          } : null}
          jira={mission.jiraInstance ? {
            url: mission.jiraInstance.url,
            email: mission.jiraInstance.email,
            status: mission.jiraInstance.status,
            instanceName: mission.jiraInstance.instanceName,
            lastTestedAt: mission.jiraInstance.lastTestedAt?.toISOString() ?? null,
            lastSyncAt: mission.jiraInstance.lastSyncAt?.toISOString() ?? null,
            lastError: mission.jiraInstance.lastError,
            demoCounts: {
              projects: mission.jiraInstance.projects.filter((project) => project.isDemo).length,
              boards: mission.jiraInstance.boards.filter((board) => board.isDemo).length,
              workflows: mission.jiraInstance.boards.filter((board) => board.workflow?.isDemo).length,
              sprints: mission.jiraInstance.sprints.length,
              issues: mission.jiraInstance.issues.length,
              transitions: mission.jiraInstance.issues.reduce((total, issue) => total + issue._count.transitions, 0),
              comments: mission.jiraInstance.issues.reduce((total, issue) => total + issue._count.comments, 0),
              dependencies: mission.jiraInstance.issues.reduce((total, issue) => total + issue._count.outgoingLinks, 0),
              expectedPhenomena: mission.jiraInstance.expectedPhenomena.length
            },
            expectedPhenomena: mission.jiraInstance.expectedPhenomena.map((phenomenon) => ({
              code: phenomenon.code,
              label: phenomenon.label,
              expectedResult: phenomenon.expectedResult
            })),
            projects: mission.jiraInstance.projects.map((project) => ({ key: project.key, name: project.name })),
            boards: mission.jiraInstance.boards.map((board) => ({
              id: board.id,
              externalId: board.externalId,
              name: board.name,
              type: board.type,
              level: board.level,
              correctedLevel: board.correctedLevel,
              parentBoardId: board.parentBoardId,
              classificationStatus: board.classificationStatus,
              isDemo: board.isDemo,
              demoDatasetName: board.demoDatasetName,
              project: board.project ? { key: board.project.key, name: board.project.name } : null,
              workflow: board.workflow ? {
                name: board.workflow.name,
                type: board.workflow.type,
                isDemo: board.workflow.isDemo,
                demoDatasetName: board.workflow.demoDatasetName,
                steps: board.workflow.steps.map((step) => ({
                  name: step.name,
                  statuses: step.statuses.map((status) => ({ name: status.name }))
                }))
              } : null
            }))
          } : null}
        />
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
