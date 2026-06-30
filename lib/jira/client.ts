import type { JiraBoardLevel, JiraWorkflowType } from "@prisma/client";

export type JiraCredentials = {
  url: string;
  email: string;
  apiToken: string;
};

export type JiraProjectSnapshot = {
  externalId: string;
  key: string;
  name: string;
};

export type JiraBoardSnapshot = {
  externalId: number;
  name: string;
  type?: string;
  projectKey?: string;
};

export type JiraWorkflowStepSnapshot = {
  order: number;
  name: string;
  statuses: { externalId?: string; name: string }[];
};

export type JiraWorkflowSnapshot = {
  boardExternalId: number;
  name: string;
  type: JiraWorkflowType;
  steps: JiraWorkflowStepSnapshot[];
};

export type JiraSyncSnapshot = {
  instanceName?: string;
  projects: JiraProjectSnapshot[];
  boards: JiraBoardSnapshot[];
  workflows: JiraWorkflowSnapshot[];
};

export class JiraRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly endpoint: string,
    public readonly responseBody: string
  ) {
    super(`Erreur Jira ${status}${statusText ? ` ${statusText}` : ""}`);
    this.name = "JiraRequestError";
  }
}

export function createJiraClient(credentials: JiraCredentials) {
  const baseUrl = normalizeJiraUrl(credentials.url);
  const authorization = buildJiraAuthorizationHeader(credentials.email, credentials.apiToken);
  console.log({ jiraUrl: baseUrl, email: credentials.email, tokenLength: credentials.apiToken?.length });

  async function request<T>(path: string): Promise<T> {
    const endpoint = `${baseUrl}${path}`;
    const response = await fetch(endpoint, {
      headers: {
        Authorization: authorization,
        Accept: "application/json"
      },
      cache: "no-store"
    });
    if (!response.ok) {
      const responseBody = await response.text();
      throw new JiraRequestError(response.status, response.statusText, endpoint, responseBody);
    }
    return response.json() as Promise<T>;
  }

  return {
    async testConnection() {
      const user = await request<{ displayName?: string; emailAddress?: string }>("/rest/api/3/myself");
      return { instanceName: user.displayName ?? user.emailAddress ?? baseUrl };
    },
    async fetchProjects() {
      const payload = await request<{ values?: Array<{ id: string; key: string; name: string }> }>("/rest/api/3/project/search?maxResults=100");
      return (payload.values ?? []).map((project) => ({
        externalId: project.id,
        key: project.key,
        name: project.name
      }));
    },
    async fetchBoards() {
      const boards: JiraBoardSnapshot[] = [];
      let startAt = 0;
      let isLast = false;
      while (!isLast) {
        const payload = await request<{ values?: JiraBoardApi[]; startAt?: number; maxResults?: number; isLast?: boolean }>(`/rest/agile/1.0/board?startAt=${startAt}&maxResults=50`);
        boards.push(...(payload.values ?? []).map(toBoardSnapshot));
        isLast = payload.isLast ?? true;
        startAt = (payload.startAt ?? startAt) + (payload.maxResults ?? 50);
      }
      return boards;
    },
    async fetchBoardWorkflow(board: JiraBoardSnapshot) {
      const config = await request<JiraBoardConfigurationApi>(`/rest/agile/1.0/board/${board.externalId}/configuration`);
      const columns = config.columnConfig?.columns ?? [];
      console.log({
        boardId: board.externalId,
        boardName: board.name,
        jiraStatusesPayload: columns.map((column) => ({
          column: column.name,
          statuses: column.statuses ?? []
        }))
      });
      const statusNameById = await fetchStatusNamesForConfig(config);
      return mapBoardToWorkflow(board, config, statusNameById);
    },
    async fetchSnapshot() {
      const [connection, projects, boards] = await Promise.all([
        this.testConnection(),
        this.fetchProjects(),
        this.fetchBoards()
      ]);
      const workflows = await Promise.all(boards.map((board) => this.fetchBoardWorkflow(board)));
      return deduplicateJiraSyncSnapshot({
        instanceName: connection.instanceName,
        projects,
        boards,
        workflows
      });
    }
  };

  async function fetchStatusNamesForConfig(config: JiraBoardConfigurationApi) {
    const statusIds = new Set<string>();
    for (const column of config.columnConfig?.columns ?? []) {
      for (const status of column.statuses ?? []) {
        const currentName = extractStatusName(status);
        if (!currentName && status.id) statusIds.add(status.id);
      }
    }

    const statusNameById = new Map<string, string>();
    await Promise.all(Array.from(statusIds).map(async (statusId) => {
      try {
        const detail = await request<JiraStatusApi>(`/rest/api/3/status/${statusId}`);
        console.log({ jiraStatusDetailPayload: detail });
        const name = extractStatusName(detail);
        if (name) statusNameById.set(statusId, name);
      } catch (error) {
        console.warn({ message: "Statut Jira ignore: detail impossible a recuperer.", statusId, error: error instanceof Error ? error.message : String(error) });
      }
    }));
    return statusNameById;
  }
}

export function buildJiraAuthorizationHeader(email: string, token: string) {
  return `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`;
}

export function classifyJiraWorkflow(boardName: string | null | undefined): JiraWorkflowType {
  const normalized = normalize(boardName ?? "");
  if (!normalized) return "UNKNOWN";
  if (["train", "art", "program", "paiement"].some((signal) => normalized.includes(signal))) return "TRAIN";
  return "TEAM";
}

export function classifyJiraBoardLevel(boardName: string | null | undefined, projectName?: string | null): JiraBoardLevel {
  const normalized = normalize(`${boardName ?? ""} ${projectName ?? ""}`);
  if (!normalized) return "UNKNOWN";
  if (["portfolio", "initiative", "epic", "strategy"].some((signal) => normalized.includes(signal))) return "PORTFOLIO";
  if (["train", "art", "program"].some((signal) => normalized.includes(signal)) || /\bpi\b/.test(normalized)) return "TRAIN";
  if (["support", "run", "ops", "incident", "exploitation"].some((signal) => normalized.includes(signal))) return "SUPPORT_OPS";
  return "TEAM";
}

export function mapBoardToWorkflow(board: JiraBoardSnapshot, config: JiraBoardConfigurationApi, statusNameById = new Map<string, string>()): JiraWorkflowSnapshot {
  const columns = config.columnConfig?.columns ?? [];
  return {
    boardExternalId: board.externalId,
    name: `${board.name} workflow`,
    type: classifyJiraWorkflow(board.name),
    steps: columns.map((column, index) => ({
      order: index + 1,
      name: column.name,
      statuses: dedupeBy(
        (column.statuses ?? []).flatMap((status) => {
          const currentMapping = { externalId: status.id, name: status.name };
          const correctedName = extractStatusName(status, statusNameById);
          const correctedMapping = { externalId: status.id, name: correctedName };
          console.log({ jiraStatusMapping: { current: currentMapping, corrected: correctedMapping, raw: status } });
          if (!correctedName) {
            console.warn({ message: "Statut Jira ignore: nom absent.", currentMapping, correctedMapping, raw: status });
            return [];
          }
          return [{ externalId: status.id, name: correctedName }];
        }),
        (status) => status.externalId ?? status.name
      )
    }))
  };
}

export function deduplicateJiraSyncSnapshot(snapshot: JiraSyncSnapshot): JiraSyncSnapshot {
  return {
    instanceName: snapshot.instanceName,
    projects: dedupeBy(snapshot.projects, (project) => project.externalId),
    boards: dedupeBy(snapshot.boards, (board) => String(board.externalId)),
    workflows: dedupeBy(snapshot.workflows, (workflow) => String(workflow.boardExternalId)).map((workflow) => ({
      ...workflow,
      steps: dedupeBy(workflow.steps, (step) => normalize(step.name)).map((step, index) => ({
        ...step,
        order: index + 1,
        statuses: dedupeBy(step.statuses, (status) => status.externalId ?? status.name)
      }))
    }))
  };
}

function normalizeJiraUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) throw new Error("URL Jira invalide. Elle doit commencer par http:// ou https://.");
  return trimmed;
}

function toBoardSnapshot(board: JiraBoardApi): JiraBoardSnapshot {
  return {
    externalId: board.id,
    name: board.name,
    type: board.type,
    projectKey: board.location?.projectKey
  };
}

function dedupeBy<T>(items: T[], keyFn: (item: T) => string) {
  const seen = new Map<string, T>();
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) seen.set(key, item);
  }
  return Array.from(seen.values());
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extractStatusName(status: JiraStatusApi, statusNameById = new Map<string, string>()) {
  const candidates = [
    status.name,
    status.status?.name,
    status.statusDetails?.name,
    status.statusCategory?.name,
    statusIdLookup(status.id, statusNameById)
  ];
  return candidates.find((candidate) => typeof candidate === "string" && candidate.trim())?.trim();
}

function statusIdLookup(statusId: string | undefined, statusNameById: Map<string, string>) {
  return statusId ? statusNameById.get(statusId) : undefined;
}

type JiraBoardApi = {
  id: number;
  name: string;
  type?: string;
  location?: {
    projectKey?: string;
  };
};

export type JiraBoardConfigurationApi = {
  columnConfig?: {
    columns?: Array<{
      name: string;
      statuses?: JiraStatusApi[];
    }>;
  };
};

type JiraStatusApi = {
  id?: string;
  self?: string;
  name?: string;
  status?: {
    name?: string;
  };
  statusDetails?: {
    name?: string;
  };
  statusCategory?: {
    name?: string;
  };
};
