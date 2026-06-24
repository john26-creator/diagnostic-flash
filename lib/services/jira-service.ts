import crypto from "node:crypto";
import { JiraConnectionStatus } from "@prisma/client";
import { createJiraClient, JiraRequestError, type JiraSyncSnapshot } from "@/lib/jira/client";
import { prisma } from "@/lib/prisma";

export type JiraActionState = {
  status: "idle" | "success" | "error";
  message?: string;
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
      const savedBoard = await tx.jiraBoard.upsert({
        where: { jiraInstanceId_externalId: { jiraInstanceId: instance.id, externalId: board.externalId } },
        create: {
          jiraInstanceId: instance.id,
          externalId: board.externalId,
          name: board.name,
          type: board.type,
          projectId: board.projectKey ? projectByKey.get(board.projectKey) : null
        },
        update: {
          name: board.name,
          type: board.type,
          projectId: board.projectKey ? projectByKey.get(board.projectKey) : null
        }
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
