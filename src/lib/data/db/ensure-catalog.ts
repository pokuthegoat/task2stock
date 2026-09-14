import "server-only";

import { companies, taskLines, tasks } from "@/data/fixtures";
import { getPrisma } from "@/lib/data/db/client";
import { taskLineId } from "@/lib/data/db/mappers";
import type { TaskId } from "@/lib/domain/model";

export async function ensureCatalogTask(taskId: TaskId): Promise<boolean> {
  const prisma = getPrisma();
  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (existing) {
    return true;
  }

  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  const task = taskIndex >= 0 ? tasks[taskIndex] : undefined;

  if (!task) {
    return false;
  }

  const companyIndex = companies.findIndex(
    (company) => company.id === task.companyId,
  );
  const company = companyIndex >= 0 ? companies[companyIndex] : undefined;

  if (!company) {
    return false;
  }

  const { reward } = task;

  await prisma.company.upsert({
    where: { id: company.id },
    create: {
      id: company.id,
      name: company.name,
      sortOrder: companyIndex,
    },
    update: {},
  });

  await prisma.task.upsert({
    where: { id: task.id },
    create: {
      id: task.id,
      companyId: task.companyId,
      title: task.title,
      description: task.description,
      category: task.category,
      difficulty: task.difficulty,
      estimate: task.estimate,
      timeBucket: task.timeBucket,
      featured: task.featured,
      onHome: task.onHome,
      sortOrder: taskIndex,
    },
    update: {},
  });

  await prisma.rewardOffer.upsert({
    where: { taskId: task.id },
    create: {
      taskId: task.id,
      amountCents: reward.amountCents,
      ticker: reward.ticker,
    },
    update: {},
  });

  const lines = taskLines.filter((line) => line.taskId === task.id);

  for (const line of lines) {
    const id = taskLineId(line.taskId, line.kind, line.sortOrder);

    await prisma.taskLine.upsert({
      where: { id },
      create: { id, ...line },
      update: {},
    });
  }

  await prisma.taskLine.deleteMany({
    where: {
      taskId: task.id,
      body: "Example listing only — not a live offer.",
    },
  });

  return true;
}
