import type { Prisma } from "@prisma/client";

type TxClient = Prisma.TransactionClient;

export async function resetDemoDataset(tx: TxClient, missionId: string, datasetId?: string) {
  const demoWhere = buildDemoDeleteWhere(missionId, datasetId);
  await tx.jiraIssueLink.deleteMany({ where: demoWhere.issueLink });
  await tx.jiraIssueEstimateHistory.deleteMany({ where: demoWhere.issueEstimateHistory });
  await tx.jiraIssueSprint.deleteMany({ where: demoWhere.issueSprint });
  await tx.jiraIssueComment.deleteMany({ where: demoWhere.issueComment });
  await tx.jiraIssueTransition.deleteMany({ where: demoWhere.issueTransition });
  await tx.jiraIssue.deleteMany({ where: demoWhere.issue });
  await tx.jiraSprint.deleteMany({ where: demoWhere.sprint });
  await tx.expectedPhenomenon.deleteMany({ where: demoWhere.expectedPhenomenon });
  await tx.jiraStatus.deleteMany({ where: demoWhere.status });
  await tx.jiraWorkflowStep.deleteMany({ where: demoWhere.workflowStep });
  await tx.jiraWorkflow.deleteMany({ where: demoWhere.workflow });
  await tx.jiraBoard.deleteMany({ where: demoWhere.board });
  await tx.jiraProject.deleteMany({ where: demoWhere.project });
}

export function buildDemoDeleteWhere(missionId: string, datasetId?: string) {
  const marker = datasetId ? { OR: [{ datasetId }, { isDemo: true }] } : { isDemo: true };
  return {
    project: { jiraInstance: { missionId }, ...marker },
    board: { jiraInstance: { missionId }, ...marker },
    workflow: { jiraInstance: { missionId }, ...marker },
    workflowStep: { workflow: { jiraInstance: { missionId } }, ...marker },
    status: { step: { workflow: { jiraInstance: { missionId } } }, ...marker },
    sprint: { missionId, ...marker },
    issue: { missionId, ...marker },
    issueTransition: { missionId, ...marker },
    issueComment: { missionId, ...marker },
    issueLink: { missionId, ...marker },
    issueSprint: { issue: { missionId }, ...marker },
    issueEstimateHistory: { missionId, ...marker },
    expectedPhenomenon: { missionId, ...marker }
  };
}
