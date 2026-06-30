import type { Prisma } from "@prisma/client";
import { DEMO_DATASET_TEMPLATES } from "@/lib/demo-jira/demo-dataset-templates";
import { prisma } from "@/lib/prisma";

export async function ensureDemoDatasetTemplates() {
  await Promise.all(
    DEMO_DATASET_TEMPLATES.map((template) =>
      prisma.demoDatasetTemplate.upsert({
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
      })
    )
  );
}

export async function listDemoDatasetTemplates() {
  await ensureDemoDatasetTemplates();
  return prisma.demoDatasetTemplate.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });
}

export function templateExpectedPhenomenaLabels(value: Prisma.JsonValue) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}
