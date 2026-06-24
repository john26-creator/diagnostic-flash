import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function listWorkspace(userId: string) {
  return prisma.client.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      missions: {
        orderBy: { updatedAt: "desc" },
        include: {
          _count: { select: { sources: true, observations: true, hypotheses: true, interviews: true } }
        }
      }
    }
  });
}

export async function getMission(userId: string, missionId: string) {
  const mission = await prisma.mission.findFirst({
    where: { id: missionId, userId },
    include: {
      client: true,
      need: { include: { symptoms: true, aiClarifications: true } },
      sources: true,
      roles: true,
      persons: { include: { role: true } },
      activities: { include: { raciAssignments: { include: { role: true } } } },
      roleMappings: true,
      theoreticalFlows: { include: { steps: { orderBy: { order: "asc" }, include: { responsibleRole: true, validatorRole: true } } } },
      canonicalArtifacts: { include: { assignee: true }, orderBy: { createdAt: "asc" } },
      metrics: true,
      observations: { include: { proofs: true, hypotheses: true, investigationQuestions: true }, orderBy: { createdAt: "desc" } },
      gaps: { include: { observation: true } },
      hypotheses: { include: { observation: true, investigationQuestions: true, hypothesisPersons: { include: { person: { include: { role: true } } } } } },
      interviews: { include: { person: { include: { role: true } } } },
      investigationSynthesis: { include: { observations: { include: { observation: { include: { proofs: true } } } }, hypotheses: { include: { hypothesis: true } } } },
      deliverables: true,
      _count: { select: { sources: true, observations: true, hypotheses: true, interviews: true } }
    }
  });
  if (!mission) notFound();
  return mission;
}

export async function createClient(userId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom du client est obligatoire.");
  return prisma.client.create({
    data: {
      userId,
      name,
      industry: String(formData.get("industry") ?? "") || null,
      description: String(formData.get("description") ?? "") || null
    }
  });
}

export async function createMission(userId: string, formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!clientId || !name) throw new Error("Client et nom de mission obligatoires.");
  const client = await prisma.client.findFirst({ where: { id: clientId, userId } });
  if (!client) throw new Error("Client introuvable ou non autorise.");
  return prisma.mission.create({
    data: {
      userId,
      clientId,
      name,
      description: String(formData.get("description") ?? "") || null,
      investigationStartDate: parseDate(formData.get("investigationStartDate")),
      investigationEndDate: parseDate(formData.get("investigationEndDate")),
      need: { create: {} }
    }
  });
}

export function missionProgress(status: string) {
  const order = [
    "DRAFT",
    "NEED_VALIDATED",
    "THEORETICAL_MODEL_READY",
    "DATA_IMPORTED",
    "OBSERVED_MODEL_READY",
    "GAPS_IDENTIFIED",
    "INVESTIGATION_READY",
    "SYNTHESIS_READY",
    "COMPLETED"
  ];
  const index = Math.max(0, order.indexOf(status));
  return Math.round((index / (order.length - 1)) * 100);
}

function parseDate(value: FormDataEntryValue | null) {
  const raw = String(value ?? "");
  return raw ? new Date(raw) : null;
}
