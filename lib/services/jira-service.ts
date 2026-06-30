import crypto from "node:crypto";
import { JiraBoardLevel, JiraClassificationStatus, JiraConnectionStatus, JiraWorkflowType, Prisma } from "@prisma/client";
import {
  demoDate,
  generateRealisticJiraDataset,
  JIRA_DEMO_DATASET_NAME,
  type RealisticJiraDataset
} from "@/lib/demo-jira/generate-realistic-jira-dataset";
import { ensureDemoDatasetTemplates } from "@/lib/demo-jira/demo-dataset-library";
import { getDemoDatasetTemplate, usesStructureOnlyGenerator } from "@/lib/demo-jira/demo-dataset-templates";
import { buildDemoDeleteWhere, resetDemoDataset } from "@/lib/demo-jira/reset-demo-dataset";
import { classifyJiraBoardLevel, createJiraClient, JiraRequestError, type JiraSyncSnapshot } from "@/lib/jira/client";
import { prisma } from "@/lib/prisma";

export type JiraActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  summary?: {
    projects: number;
    boards: number;
    workflows: number;
    sprints: number;
    issues: number;
    transitions: number;
    comments: number;
    dependencies: number;
    expectedPhenomena: number;
  };
};

export { JIRA_DEMO_DATASET_NAME, generateRealisticJiraDataset };
export { buildDemoDeleteWhere };

const JIRA_STRUCTURE_DEMO_VERSION = "1.0";
const JIRA_REALISTIC_DEMO_VERSION = "1.1";

type JiraDemoBoardDefinition = {
  externalId: number;
  projectExternalId: string;
  projectKey: string;
  projectName: string;
  boardName: string;
  boardType: string;
  level: JiraBoardLevel;
  workflowSteps: string[];
  parentBoardExternalId: number | null;
};

export async function saveJiraConnection(userId: string, missionId: string, formData: FormData): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  const url = readFormText(formData, "url", "_url");
  const email = readFormText(formData, "email", "_email");
  const apiToken = normalizeJiraTokenInput(readFormValue(formData, "apiToken", "_apiToken"));
  if (!url || !email) return { status: "error", message: "URL Jira et email sont obligatoires." };

  const existing = await prisma.jiraInstance.findUnique({ where: { missionId } });
  const savedToken = existing?.apiTokenEncrypted ? decryptToken(existing.apiTokenEncrypted) : "";
  const token = apiToken || savedToken;
  console.log({ jiraUrl: url, email, tokenLength: token?.length });

  const encryptedToken = apiToken ? encryptToken(apiToken) : existing?.apiTokenEncrypted;
  if (!encryptedToken) return { status: "error", message: "API Token obligatoire lors de la premiere configuration." };

  await prisma.jiraInstance.upsert({
    where: { missionId },
    create: {
      missionId,
      url,
      email,
      apiTokenEncrypted: encryptedToken,
      status: JiraConnectionStatus.SAVED
    },
    update: {
      url,
      email,
      apiTokenEncrypted: encryptedToken,
      status: JiraConnectionStatus.SAVED,
      lastError: null
    }
  });

  return { status: "success", message: "Configuration Jira sauvegardee. Le token est protege et ne sera plus affiche." };
}

export async function testJiraConnection(userId: string, missionId: string, formData?: FormData): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  const credentials = await credentialsFromFormOrDb(missionId, formData);
  try {
    const client = createJiraClient(credentials);
    const connection = await client.testConnection();
    const [projects, boards] = await Promise.all([client.fetchProjects(), client.fetchBoards()]);
    await prisma.jiraInstance.upsert({
      where: { missionId },
      create: {
        missionId,
        url: credentials.url,
        email: credentials.email,
        apiTokenEncrypted: encryptToken(credentials.apiToken),
        instanceName: connection.instanceName,
        status: JiraConnectionStatus.CONNECTED,
        lastTestedAt: new Date(),
        lastError: null
      },
      update: {
        url: credentials.url,
        email: credentials.email,
        apiTokenEncrypted: encryptToken(credentials.apiToken),
        instanceName: connection.instanceName,
        status: JiraConnectionStatus.CONNECTED,
        lastTestedAt: new Date(),
        lastError: null
      }
    });
    return { status: "success", message: `Connexion valide. ${projects.length} projet(s), ${boards.length} board(s) detecte(s).` };
  } catch (error) {
    const message = formatJiraConnectionError(error, credentials.email, credentials.apiToken);
    await markJiraError(missionId, new Error(message));
    return { status: "error", message };
  }
}

export async function syncJira(userId: string, missionId: string): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  const credentials = await credentialsFromFormOrDb(missionId);
  try {
    const snapshot = await createJiraClient(credentials).fetchSnapshot();
    await persistJiraSnapshot(missionId, snapshot);
    return {
      status: "success",
      message: `Synchronisation terminee. ${snapshot.projects.length} projet(s), ${snapshot.boards.length} board(s), ${snapshot.workflows.length} workflow(s).`
    };
  } catch (error) {
    const message = formatJiraConnectionError(error, credentials.email, credentials.apiToken);
    await markJiraError(missionId, new Error(message));
    return { status: "error", message };
  }
}

export async function persistJiraSnapshot(missionId: string, snapshot: JiraSyncSnapshot) {
  const instance = await prisma.jiraInstance.findUnique({ where: { missionId } });
  if (!instance) throw new Error("Configuration Jira absente.");

  await prisma.$transaction(async (tx) => {
    await tx.jiraInstance.update({
      where: { id: instance.id },
      data: {
        instanceName: snapshot.instanceName,
        status: JiraConnectionStatus.CONNECTED,
        lastSyncAt: new Date(),
        lastError: null
      }
    });

    const projectByKey = new Map<string, string>();
    for (const project of snapshot.projects) {
      const saved = await tx.jiraProject.upsert({
        where: { jiraInstanceId_externalId: { jiraInstanceId: instance.id, externalId: project.externalId } },
        create: { jiraInstanceId: instance.id, externalId: project.externalId, key: project.key, name: project.name },
        update: { key: project.key, name: project.name }
      });
      projectByKey.set(saved.key, saved.id);
    }

    for (const board of snapshot.boards) {
      const projectId = board.projectKey ? projectByKey.get(board.projectKey) : null;
      const projectName = board.projectKey ? snapshot.projects.find((project) => project.key === board.projectKey)?.name : null;
      const detectedLevel = classifyJiraBoardLevel(board.name, projectName ?? board.projectKey);
      const savedBoard = await tx.jiraBoard.upsert({
        where: { jiraInstanceId_externalId: { jiraInstanceId: instance.id, externalId: board.externalId } },
        create: {
          ...buildJiraBoardSyncData(board.name, board.type, projectId, detectedLevel),
          jiraInstanceId: instance.id,
          externalId: board.externalId,
          classificationStatus: JiraClassificationStatus.DETECTED
        },
        update: buildJiraBoardSyncData(board.name, board.type, projectId, detectedLevel)
      });

      const workflowSnapshot = snapshot.workflows.find((workflow) => workflow.boardExternalId === board.externalId);
      if (!workflowSnapshot) continue;
      const workflow = await tx.jiraWorkflow.upsert({
        where: { boardId: savedBoard.id },
        create: {
          jiraInstanceId: instance.id,
          boardId: savedBoard.id,
          name: workflowSnapshot.name,
          type: workflowSnapshot.type
        },
        update: {
          name: workflowSnapshot.name,
          type: workflowSnapshot.type
        }
      });

      await tx.jiraWorkflowStep.deleteMany({ where: { workflowId: workflow.id } });
      for (const step of workflowSnapshot.steps) {
        const savedStep = await tx.jiraWorkflowStep.create({
          data: { workflowId: workflow.id, order: step.order, name: step.name }
        });
        const statusesToCreate = step.statuses.flatMap((status) => {
          if (!status.name) {
            console.warn({ message: "Statut Jira ignore avant insertion Prisma: name absent.", stepId: savedStep.id, externalId: status.externalId });
            return [];
          }
          return [{
            stepId: savedStep.id,
            externalId: status.externalId,
            name: status.name
          }];
        });
        if (!statusesToCreate.length) continue;
        await tx.jiraStatus.createMany({
          data: statusesToCreate,
          skipDuplicates: true
        });
      }
    }
  });
}

export async function updateJiraBoardClassification(userId: string, missionId: string, boardId: string, formData: FormData): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  const action = readFormText(formData, "classificationAction");
  const correctedLevelRaw = readFormText(formData, "correctedLevel");
  const parentBoardIdRaw = readFormText(formData, "parentBoardId");

  const board = await prisma.jiraBoard.findFirst({
    where: { id: boardId, jiraInstance: { missionId } },
    include: { jiraInstance: true }
  });
  if (!board) return { status: "error", message: "Board Jira introuvable." };

  if (action === "reject") {
    await prisma.jiraBoard.update({
      where: { id: board.id },
      data: { classificationStatus: JiraClassificationStatus.REJECTED, parentBoardId: null }
    });
    return { status: "success", message: "Classification Jira rejetee." };
  }

  const correctedLevel = parseJiraBoardLevel(correctedLevelRaw) ?? board.correctedLevel ?? board.level;
  const parentBoardId = parentBoardIdRaw || null;
  const parentValidation = await validateJiraParent(board.jiraInstanceId, board.id, correctedLevel, parentBoardId);
  if (!parentValidation.valid) return { status: "error", message: parentValidation.message };

  const data = {
    correctedLevel: action === "confirm" ? board.correctedLevel : correctedLevel,
    parentBoardId,
    classificationStatus: action === "confirm" ? JiraClassificationStatus.CONFIRMED : JiraClassificationStatus.CORRECTED
  };

  await prisma.jiraBoard.update({ where: { id: board.id }, data });
  return {
    status: "success",
    message: action === "confirm" ? "Classification Jira confirmee." : "Classification Jira corrigee."
  };
}

export async function loadDemoDatasetTemplate(userId: string, missionId: string, templateCode: string): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  await ensureDemoDatasetTemplates();
  const template = getDemoDatasetTemplate(templateCode);
  if (!template) return { status: "error", message: "Template de jeu DEMO introuvable." };

  const result = usesStructureOnlyGenerator(template.code)
    ? await loadJiraDemoDataset(userId, missionId)
    : await loadRealisticJiraDemoDataset(userId, missionId);

  const loaded = await prisma.$transaction(async (tx) => {
    const dbTemplate = await tx.demoDatasetTemplate.upsert({
      where: { code: template.code },
      create: {
        code: template.code,
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        version: template.version,
        estimatedTickets: template.estimatedTickets,
        estimatedProjects: template.estimatedProjects,
        estimatedBoards: template.estimatedBoards,
        expectedPhenomena: template.expectedPhenomena
      },
      update: {
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        version: template.version,
        estimatedTickets: template.estimatedTickets,
        estimatedProjects: template.estimatedProjects,
        estimatedBoards: template.estimatedBoards,
        expectedPhenomena: template.expectedPhenomena
      }
    });
    await tx.demoDatasetLoaded.updateMany({ where: { missionId, isActive: true }, data: { isActive: false } });
    const savedLoaded = await tx.demoDatasetLoaded.create({
      data: {
        missionId,
        templateId: dbTemplate.id,
        version: template.version,
        isActive: true
      }
    });
    await attachDemoRowsToLoadedDataset(tx, missionId, savedLoaded.id);
    return savedLoaded;
  });

  const specializationNote = usesStructureOnlyGenerator(template.code)
    ? ""
    : "\nNote MVP : ce scenario utilise le generateur realiste partage. Les variantes fines seront specialisees dans les prochaines US sans dupliquer le dataset silencieusement.";

  return {
    ...result,
    status: "success",
    message: `Jeu DEMO charge : ${template.name}. Les donnees Jira reelles sont conservees.${specializationNote}`,
    summary: result.summary
  };
}

export async function loadJiraDemoDataset(userId: string, missionId: string): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  const dataset = buildJiraDemoDataset();

  await prisma.$transaction(async (tx) => {
    await resetDemoDataset(tx, missionId);
    const demoDataset = await activateDemoDataset(tx, missionId, {
      name: JIRA_DEMO_DATASET_NAME,
      description: "Structure Jira multi-niveaux de demonstration.",
      version: JIRA_STRUCTURE_DEMO_VERSION
    });
    const instance = await tx.jiraInstance.upsert({
      where: { missionId },
      create: {
        missionId,
        url: "https://demo.diagnostic-flash.local/jira",
        email: "demo-jira@diagnostic-flash.local",
        instanceName: `[DEMO] ${JIRA_DEMO_DATASET_NAME}`,
        status: JiraConnectionStatus.CONNECTED,
        lastSyncAt: new Date(),
        lastError: null
      },
      update: {
        lastSyncAt: new Date(),
        lastError: null
      }
    });

    const projectByExternalId = new Map<string, string>();
    for (const project of uniqueDemoProjects(dataset)) {
      const savedProject = await tx.jiraProject.upsert({
        where: { jiraInstanceId_externalId: { jiraInstanceId: instance.id, externalId: project.externalId } },
        create: {
          jiraInstanceId: instance.id,
          externalId: project.externalId,
          key: project.key,
          name: project.name,
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        },
        update: {
          key: project.key,
          name: project.name,
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        }
      });
      projectByExternalId.set(project.externalId, savedProject.id);
    }

    const boardIdByExternalId = new Map<number, string>();
    for (const board of dataset) {
      const savedBoard = await tx.jiraBoard.upsert({
        where: { jiraInstanceId_externalId: { jiraInstanceId: instance.id, externalId: board.externalId } },
        create: {
          jiraInstanceId: instance.id,
          externalId: board.externalId,
          projectId: projectByExternalId.get(board.projectExternalId),
          name: board.boardName,
          type: board.boardType,
          level: board.level,
          correctedLevel: board.level,
          classificationStatus: JiraClassificationStatus.CONFIRMED,
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        },
        update: {
          projectId: projectByExternalId.get(board.projectExternalId),
          name: board.boardName,
          type: board.boardType,
          level: board.level,
          correctedLevel: board.level,
          classificationStatus: JiraClassificationStatus.CONFIRMED,
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        }
      });
      boardIdByExternalId.set(board.externalId, savedBoard.id);

      const workflow = await tx.jiraWorkflow.upsert({
        where: { boardId: savedBoard.id },
        create: {
          jiraInstanceId: instance.id,
          boardId: savedBoard.id,
          name: `[DEMO] ${board.boardName} workflow`,
          type: demoWorkflowType(board.level),
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        },
        update: {
          name: `[DEMO] ${board.boardName} workflow`,
          type: demoWorkflowType(board.level),
          isDemo: true,
          demoDatasetName: JIRA_DEMO_DATASET_NAME,
          datasetId: demoDataset.id
        }
      });

      await tx.jiraWorkflowStep.deleteMany({ where: { workflowId: workflow.id, isDemo: true, demoDatasetName: JIRA_DEMO_DATASET_NAME } });
      for (const [index, stepName] of board.workflowSteps.entries()) {
        const step = await tx.jiraWorkflowStep.create({
          data: {
            workflowId: workflow.id,
            order: index + 1,
            name: stepName,
            isDemo: true,
            demoDatasetName: JIRA_DEMO_DATASET_NAME,
            datasetId: demoDataset.id
          }
        });
        await tx.jiraStatus.create({
          data: {
            stepId: step.id,
            externalId: `DEMO-${board.externalId}-${index + 1}`,
            name: stepName,
            isDemo: true,
            demoDatasetName: JIRA_DEMO_DATASET_NAME,
            datasetId: demoDataset.id
          }
        });
      }
    }

    for (const board of dataset) {
      await tx.jiraBoard.update({
        where: { id: boardIdByExternalId.get(board.externalId) },
        data: {
          parentBoardId: board.parentBoardExternalId ? boardIdByExternalId.get(board.parentBoardExternalId) ?? null : null
        }
      });
    }
  });

  // TODO: creer les tickets demo JIRA_MULTI_LEVEL_PAYMENT quand un modele JiraIssue sera disponible.
  return { status: "success", message: "Jeu de donnees Jira demo multi-niveaux charge sans appel a l'API Jira." };
}

export async function loadRealisticJiraDemoDataset(userId: string, missionId: string): Promise<JiraActionState> {
  await loadJiraDemoDataset(userId, missionId);
  const dataset = generateRealisticJiraDataset();
  const activeDataset = await prisma.demoDataset.findFirst({ where: { missionId, isActive: true, name: JIRA_DEMO_DATASET_NAME } });
  if (!activeDataset) throw new Error("Dataset demo actif introuvable.");
  await prisma.demoDataset.deleteMany({
    where: { missionId, name: JIRA_DEMO_DATASET_NAME, version: JIRA_REALISTIC_DEMO_VERSION, id: { not: activeDataset.id } }
  });
  const updatedDataset = await prisma.demoDataset.update({
    where: { id: activeDataset.id },
    data: {
      description: "Organisation SAFe multi-niveaux simulee avec tickets, transitions et phenomenes injectes.",
      version: JIRA_REALISTIC_DEMO_VERSION,
      loadedAt: new Date()
    }
  });
  const summary = await persistRealisticJiraDataset(missionId, dataset, updatedDataset.id);
  return {
    status: "success",
    message: [
      "Jeu de donnees Jira realiste charge sans appel a l'API Jira.",
      `${summary.issues} tickets, ${summary.transitions} transitions, ${summary.comments} commentaires, ${summary.dependencies} dependances, ${summary.expectedPhenomena} phenomenes attendus.`
    ].join("\n"),
    summary
  };
}

async function persistRealisticJiraDataset(missionId: string, dataset: RealisticJiraDataset, datasetId: string) {
  const instance = await prisma.jiraInstance.findUnique({
    where: { missionId },
    include: {
      projects: true,
      boards: { include: { project: true, workflow: true } },
      workflows: true
    }
  });
  if (!instance) throw new Error("Instance Jira demo absente.");

  return prisma.$transaction(async (tx) => {
    await tx.jiraIssueLink.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.jiraIssueEstimateHistory.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.jiraIssueSprint.deleteMany({ where: { isDemo: true, demoDatasetName: dataset.datasetName, issue: { missionId } } });
    await tx.jiraIssueComment.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.jiraIssueTransition.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.jiraIssue.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.jiraSprint.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });
    await tx.expectedPhenomenon.deleteMany({ where: { missionId, isDemo: true, demoDatasetName: dataset.datasetName } });

    const boardByName = new Map(instance.boards.map((board) => [board.name, board]));
    const sprintByName = new Map<string, string>();
    for (const sprint of dataset.sprints) {
      const board = boardByName.get(sprint.boardName);
      if (!board) throw new Error(`Board demo introuvable pour sprint ${sprint.name}.`);
      const savedSprint = await tx.jiraSprint.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          jiraBoardId: board.id,
          externalId: sprint.externalId,
          name: sprint.name,
          goal: sprint.goal,
          state: sprint.state,
          startDate: demoDate(sprint.startDay),
          endDate: demoDate(sprint.endDay),
          completedAt: demoDate(sprint.endDay, 17),
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
      sprintByName.set(sprint.name, savedSprint.id);
    }

    const issueIdByKey = new Map<string, string>();
    for (const issue of dataset.issues) {
      const board = boardByName.get(issue.boardName);
      if (!board || !board.projectId) throw new Error(`Board ou projet demo introuvable pour ticket ${issue.key}.`);
      const savedIssue = await tx.jiraIssue.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          jiraProjectId: board.projectId,
          jiraBoardId: board.id,
          jiraWorkflowId: board.workflow?.id ?? null,
          externalId: `DEMO-${issue.key}`,
          key: issue.key,
          title: issue.title,
          description: `DEMO ${dataset.datasetName} - ${issue.title}`,
          issueType: issue.issueType,
          priority: issue.priority,
          status: issue.status,
          assignee: issue.assignee,
          reporter: issue.reporter,
          createdAtJira: demoDate(issue.createdDay),
          updatedAtJira: demoDate(issue.updatedDay, 16),
          resolvedAtJira: issue.resolvedDay ? demoDate(issue.resolvedDay, 17) : null,
          storyPoints: issue.storyPoints,
          originalEstimate: issue.originalEstimate,
          remainingEstimate: issue.remainingEstimate,
          timeSpent: issue.timeSpent,
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
      issueIdByKey.set(issue.key, savedIssue.id);
    }

    for (const issue of dataset.issues) {
      if (!issue.parentKey) continue;
      const childId = issueIdByKey.get(issue.key);
      const parentId = issueIdByKey.get(issue.parentKey);
      if (childId && parentId) await tx.jiraIssue.update({ where: { id: childId }, data: { parentIssueId: parentId } });
    }

    for (const issue of dataset.issues) {
      const issueId = issueIdByKey.get(issue.key);
      if (!issueId) continue;
      for (const sprintName of issue.sprintNames ?? []) {
        const sprintId = sprintByName.get(sprintName);
        if (!sprintId) continue;
        await tx.jiraIssueSprint.create({
          data: {
            jiraIssueId: issueId,
            jiraSprintId: sprintId,
            addedAt: demoDate(issue.addedAfterStart ? issue.createdDay + 5 : issue.createdDay),
            addedAfterStart: Boolean(issue.addedAfterStart),
            isDemo: true,
            demoDatasetName: dataset.datasetName,
            datasetId
          }
        });
      }
    }

    for (const [index, transition] of dataset.transitions.entries()) {
      const issueId = issueIdByKey.get(transition.issueKey);
      if (!issueId) continue;
      await tx.jiraIssueTransition.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          jiraIssueId: issueId,
          externalId: `DEMO-TR-${index + 1}-${transition.issueKey}`,
          fromStatus: transition.fromStatus,
          toStatus: transition.toStatus,
          author: transition.author,
          transitionedAt: demoDate(transition.day, transition.hour ?? 10),
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
    }

    for (const [index, comment] of dataset.comments.entries()) {
      const issueId = issueIdByKey.get(comment.issueKey);
      if (!issueId) continue;
      await tx.jiraIssueComment.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          jiraIssueId: issueId,
          externalId: `DEMO-COM-${index + 1}-${comment.issueKey}`,
          author: comment.author,
          body: comment.body,
          createdAtJira: demoDate(comment.day, 14),
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
    }

    for (const link of dataset.links) {
      const sourceIssueId = issueIdByKey.get(link.sourceKey);
      const targetIssueId = issueIdByKey.get(link.targetKey);
      if (!sourceIssueId || !targetIssueId) continue;
      await tx.jiraIssueLink.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          sourceIssueId,
          targetIssueId,
          linkType: link.linkType,
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
    }

    for (const [index, estimate] of dataset.estimateHistory.entries()) {
      const issueId = issueIdByKey.get(estimate.issueKey);
      if (!issueId) continue;
      await tx.jiraIssueEstimateHistory.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          jiraIssueId: issueId,
          externalId: `DEMO-EST-${index + 1}-${estimate.issueKey}`,
          previousStoryPoints: estimate.previousStoryPoints,
          newStoryPoints: estimate.newStoryPoints,
          previousEstimate: estimate.previousEstimate,
          newEstimate: estimate.newEstimate,
          changedBy: estimate.changedBy,
          changedAt: demoDate(estimate.day, 11),
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
    }

    for (const phenomenon of dataset.expectedPhenomena) {
      await tx.expectedPhenomenon.create({
        data: {
          missionId,
          jiraInstanceId: instance.id,
          code: phenomenon.code,
          label: phenomenon.label,
          description: phenomenon.description,
          concernedData: phenomenon.concernedData,
          expectedResult: phenomenon.expectedResult,
          investigationQuestions: phenomenon.investigationQuestions,
          isDemo: true,
          demoDatasetName: dataset.datasetName,
          datasetId
        }
      });
    }

    return {
      projects: instance.projects.filter((project) => project.isDemo && project.demoDatasetName === dataset.datasetName).length,
      boards: instance.boards.filter((board) => board.isDemo && board.demoDatasetName === dataset.datasetName).length,
      workflows: instance.workflows.filter((workflow) => workflow.isDemo && workflow.demoDatasetName === dataset.datasetName).length,
      sprints: dataset.sprints.length,
      issues: dataset.issues.length,
      transitions: dataset.transitions.length,
      comments: dataset.comments.length,
      dependencies: dataset.links.length,
      expectedPhenomena: dataset.expectedPhenomena.length
    };
  });
}

export async function resetActiveDemoDataset(userId: string, missionId: string): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  await prisma.$transaction(async (tx) => {
    const active = await tx.demoDataset.findFirst({ where: { missionId, isActive: true } });
    const activeLoaded = await tx.demoDatasetLoaded.findFirst({ where: { missionId, isActive: true } });
    if (activeLoaded) await resetDemoDataset(tx, missionId, activeLoaded.id);
    else if (active) await resetDemoDataset(tx, missionId, active.id);
    await tx.demoDataset.deleteMany({ where: { missionId, isActive: true } });
    await tx.demoDatasetLoaded.deleteMany({ where: { missionId, isActive: true } });
  });
  return { status: "success", message: "Jeu DEMO actif reinitialise. Les donnees Jira reelles sont conservees." };
}

export async function deleteAllDemoData(userId: string, missionId: string): Promise<JiraActionState> {
  await assertMissionAccess(userId, missionId);
  await prisma.$transaction(async (tx) => {
    await resetDemoDataset(tx, missionId);
    await tx.demoDataset.deleteMany({ where: { missionId } });
    await tx.demoDatasetLoaded.deleteMany({ where: { missionId } });
  });
  return { status: "success", message: "Toutes les donnees DEMO ont ete supprimees. Les donnees Jira reelles sont conservees." };
}

type TxClient = Prisma.TransactionClient;

async function activateDemoDataset(tx: TxClient, missionId: string, data: { name: string; description: string; version: string }) {
  await tx.demoDataset.updateMany({ where: { missionId, isActive: true }, data: { isActive: false } });
  return tx.demoDataset.upsert({
    where: { missionId_name_version: { missionId, name: data.name, version: data.version } },
    create: { missionId, ...data, isActive: true, loadedAt: new Date() },
    update: { description: data.description, loadedAt: new Date(), isActive: true }
  });
}

async function attachDemoRowsToLoadedDataset(tx: TxClient, missionId: string, loadedDatasetId: string) {
  await tx.jiraProject.updateMany({ where: { jiraInstance: { missionId }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraBoard.updateMany({ where: { jiraInstance: { missionId }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraWorkflow.updateMany({ where: { jiraInstance: { missionId }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraWorkflowStep.updateMany({ where: { workflow: { jiraInstance: { missionId } }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraStatus.updateMany({ where: { step: { workflow: { jiraInstance: { missionId } } }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraSprint.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssue.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssueTransition.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssueComment.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssueLink.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssueSprint.updateMany({ where: { issue: { missionId }, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.jiraIssueEstimateHistory.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
  await tx.expectedPhenomenon.updateMany({ where: { missionId, isDemo: true }, data: { datasetId: loadedDatasetId } });
}

async function credentialsFromFormOrDb(missionId: string, formData?: FormData) {
  const existing = await prisma.jiraInstance.findUnique({ where: { missionId } });
  const url = formData ? readFormText(formData, "url", "_url") || existing?.url || "" : existing?.url || "";
  const email = formData ? readFormText(formData, "email", "_email") || existing?.email || "" : existing?.email || "";
  const rawToken = formData ? normalizeJiraTokenInput(readFormValue(formData, "apiToken", "_apiToken")) : "";
  const apiToken = rawToken || (existing?.apiTokenEncrypted ? decryptToken(existing.apiTokenEncrypted) : "");
  console.log({ jiraUrl: url, email, tokenLength: apiToken?.length });
  if (!url || !email || !apiToken) throw new Error("Configuration Jira incomplete.");
  return { url, email, apiToken };
}

function formatJiraConnectionError(error: unknown, email: string, token: string) {
  const tokenPresent = token ? "Oui" : "Non";
  const emailLine = `Email utilis\u00e9 : ${email || "non renseign\u00e9"}`;
  const tokenLine = `Token pr\u00e9sent : ${tokenPresent}`;
  if (error instanceof JiraRequestError) {
    return [
      error.message,
      `Endpoint appel\u00e9 : ${error.endpoint}`,
      `Code HTTP : ${error.status}`,
      `Message Jira retourn\u00e9 : ${error.responseBody || "Corps de r\u00e9ponse vide"}`,
      emailLine,
      tokenLine
    ].join("\n");
  }
  const message = error instanceof Error ? error.message : "Erreur Jira inconnue.";
  return `${message}\n${emailLine}\n${tokenLine}`;
}

function readFormText(formData: FormData, ...names: string[]) {
  const value = readFormValue(formData, ...names);
  return typeof value === "string" ? value.trim() : "";
}

function readFormValue(formData: FormData, ...names: string[]) {
  for (const name of names) {
    const value = formData.get(name);
    if (value !== null) return value;
  }
  return null;
}

export function normalizeJiraTokenInput(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return "";
  const token = value.trim();
  if (!token || token === "0" || token.toLowerCase() === "undefined" || token.toLowerCase() === "null") return "";
  return token;
}

export function effectiveJiraBoardLevel(board: { level: JiraBoardLevel; correctedLevel: JiraBoardLevel | null; classificationStatus: JiraClassificationStatus }) {
  if (board.classificationStatus === JiraClassificationStatus.REJECTED) return JiraBoardLevel.UNKNOWN;
  return board.correctedLevel ?? board.level;
}

export function buildJiraBoardSyncData(name: string, type: string | undefined, projectId: string | null | undefined, level: JiraBoardLevel) {
  return {
    name,
    type,
    projectId,
    level
  };
}

export function isValidJiraParentRelation(childLevel: JiraBoardLevel, parentLevel: JiraBoardLevel | null) {
  if (childLevel === JiraBoardLevel.PORTFOLIO) return parentLevel === null;
  if (childLevel === JiraBoardLevel.TRAIN) return parentLevel === null || parentLevel === JiraBoardLevel.PORTFOLIO;
  if (childLevel === JiraBoardLevel.TEAM) return parentLevel === null || parentLevel === JiraBoardLevel.TRAIN;
  if (childLevel === JiraBoardLevel.SUPPORT_OPS) return parentLevel === null || parentLevel === JiraBoardLevel.TRAIN;
  return parentLevel === null;
}

export function buildJiraDemoDataset(): JiraDemoBoardDefinition[] {
  return [
    {
      externalId: -220701,
      projectExternalId: "DEMO-PORTFOLIO-PAYMENT",
      projectKey: "DEMO-PORT-PAY",
      projectName: "PORTFOLIO Paiement",
      boardName: "Portfolio Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.PORTFOLIO,
      workflowSteps: ["Idea", "Initiative", "Epic", "Prioritized", "Done"],
      parentBoardExternalId: null
    },
    {
      externalId: -220702,
      projectExternalId: "DEMO-TRAIN-PAYMENT",
      projectKey: "DEMO-TRAIN-PAY",
      projectName: "TRAIN Paiement",
      boardName: "Train Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.TRAIN,
      workflowSteps: ["Funnel", "Feature", "Ready", "Implementing", "Validation", "Done"],
      parentBoardExternalId: -220701
    },
    {
      externalId: -220703,
      projectExternalId: "DEMO-API-PAYMENT",
      projectKey: "DEMO-API-PAY",
      projectName: "\u00c9quipe API Paiement",
      boardName: "\u00c9quipe API Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.TEAM,
      workflowSteps: ["To Do", "In Progress", "Code Review", "QA", "Done"],
      parentBoardExternalId: -220702
    },
    {
      externalId: -220704,
      projectExternalId: "DEMO-FRONT-PAYMENT",
      projectKey: "DEMO-FRONT-PAY",
      projectName: "\u00c9quipe Front Paiement",
      boardName: "\u00c9quipe Front Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.TEAM,
      workflowSteps: ["Backlog", "Ready", "In Progress", "In Review", "Done"],
      parentBoardExternalId: -220702
    },
    {
      externalId: -220705,
      projectExternalId: "DEMO-BACK-PAYMENT",
      projectKey: "DEMO-BACK-PAY",
      projectName: "\u00c9quipe Back Paiement",
      boardName: "\u00c9quipe Back Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.TEAM,
      workflowSteps: ["To Do", "In Progress", "Testing", "Done"],
      parentBoardExternalId: -220702
    },
    {
      externalId: -220706,
      projectExternalId: "DEMO-SUPPORT-PAYMENT",
      projectKey: "DEMO-SUPPORT-PAY",
      projectName: "Support Paiement",
      boardName: "Support & Exploitation Paiement",
      boardType: "DEMO",
      level: JiraBoardLevel.SUPPORT_OPS,
      workflowSteps: ["Open", "Analysis", "Fix", "Validation", "Closed"],
      parentBoardExternalId: -220702
    }
  ];
}

export function demoExternalIdsAreUnique(dataset = buildJiraDemoDataset()) {
  return new Set(dataset.map((board) => board.externalId)).size === dataset.length
    && new Set(dataset.map((board) => board.projectExternalId)).size === dataset.length;
}

function uniqueDemoProjects(dataset: JiraDemoBoardDefinition[]) {
  const projects = new Map<string, { externalId: string; key: string; name: string }>();
  for (const board of dataset) {
    if (!projects.has(board.projectExternalId)) {
      projects.set(board.projectExternalId, {
        externalId: board.projectExternalId,
        key: board.projectKey,
        name: board.projectName
      });
    }
  }
  return Array.from(projects.values());
}

function demoWorkflowType(level: JiraBoardLevel) {
  if (level === JiraBoardLevel.TRAIN) return JiraWorkflowType.TRAIN;
  if (level === JiraBoardLevel.TEAM) return JiraWorkflowType.TEAM;
  return JiraWorkflowType.UNKNOWN;
}

function parseJiraBoardLevel(value: string) {
  return Object.values(JiraBoardLevel).includes(value as JiraBoardLevel) ? value as JiraBoardLevel : null;
}

async function validateJiraParent(jiraInstanceId: string, boardId: string, childLevel: JiraBoardLevel, parentBoardId: string | null) {
  if (!parentBoardId) {
    return isValidJiraParentRelation(childLevel, null)
      ? { valid: true }
      : { valid: false, message: "Ce niveau necessite un parent compatible." };
  }
  if (parentBoardId === boardId) return { valid: false, message: "Un board ne peut pas etre son propre parent." };
  const parent = await prisma.jiraBoard.findFirst({ where: { id: parentBoardId, jiraInstanceId } });
  if (!parent) return { valid: false, message: "Parent Jira introuvable." };
  const parentLevel = effectiveJiraBoardLevel(parent);
  if (!isValidJiraParentRelation(childLevel, parentLevel)) {
    return { valid: false, message: `Parent incompatible : ${childLevel} ne peut pas etre rattache a ${parentLevel}.` };
  }
  return { valid: true };
}

async function markJiraError(missionId: string, error: unknown) {
  await prisma.jiraInstance.updateMany({
    where: { missionId },
    data: {
      status: JiraConnectionStatus.ERROR,
      lastTestedAt: new Date(),
      lastError: error instanceof Error ? error.message : "Erreur Jira inconnue."
    }
  });
}

async function assertMissionAccess(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({ where: { id: missionId, userId }, select: { id: true } });
  if (!mission) throw new Error("Mission introuvable.");
}

function encryptToken(token: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function decryptToken(value: string) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("Token Jira illisible.");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64")), decipher.final()]).toString("utf8");
}

function encryptionKey() {
  const secret = process.env.JIRA_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || process.env.DATABASE_URL;
  if (!secret) {
    throw new Error("JIRA_TOKEN_SECRET ou NEXTAUTH_SECRET requis pour proteger le token Jira.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}
