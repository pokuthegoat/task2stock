import "server-only";

import { getPrisma } from "@/lib/data/db/client";
import {
  toCompany,
  toHolding,
  toReward,
  toRewardOffer,
  toTask,
  toTaskLine,
  toTaskView,
} from "@/lib/data/db/mappers";
import type {
  Company,
  CompanyId,
  Holding,
  Reward,
  RewardOffer,
  Task,
  TaskId,
  TaskLine,
} from "@/lib/domain/model";
import type { TaskRewardOffer, TaskView } from "@/lib/data/types";

type OfferRow = { amountCents: number; ticker: string };

const taskInclude = {
  company: true,
  lines: true,
  rewardOffer: true,
} as const;

function requireOffer<T extends { id: string; rewardOffer: OfferRow | null }>(
  row: T,
): OfferRow {
  if (!row.rewardOffer) {
    throw new Error(`Task ${row.id} is missing a reward offer`);
  }

  return row.rewardOffer;
}

/** Database-backed catalog. Async. Do not import from client components. */
export async function listCompanies(): Promise<Company[]> {
  const rows = await getPrisma().company.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toCompany);
}

export async function getCompanyById(
  id: CompanyId,
): Promise<Company | undefined> {
  const row = await getPrisma().company.findUnique({ where: { id } });
  return row ? toCompany(row) : undefined;
}

export async function listTaskRecords(): Promise<Task[]> {
  const rows = await getPrisma().task.findMany({
    include: { rewardOffer: true },
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((row) => toTask(row, requireOffer(row)));
}

export async function listTaskLines(taskId?: TaskId): Promise<TaskLine[]> {
  const rows = await getPrisma().taskLine.findMany({
    where: taskId ? { taskId } : undefined,
    orderBy: [{ taskId: "asc" }, { sortOrder: "asc" }],
  });

  return rows.map(toTaskLine);
}

export async function listTasks(): Promise<TaskView[]> {
  const rows = await getPrisma().task.findMany({
    include: taskInclude,
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((row) => toTaskView(row, requireOffer(row)));
}

export async function getTaskById(id: TaskId): Promise<TaskView | undefined> {
  const row = await getPrisma().task.findUnique({
    where: { id },
    include: taskInclude,
  });

  return row ? toTaskView(row, requireOffer(row)) : undefined;
}

export async function listFeaturedTasks(): Promise<TaskView[]> {
  const rows = await getPrisma().task.findMany({
    where: { featured: true },
    include: taskInclude,
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((row) => toTaskView(row, requireOffer(row)));
}

export async function listHomeTasks(): Promise<TaskView[]> {
  const rows = await getPrisma().task.findMany({
    where: { onHome: true },
    include: taskInclude,
    orderBy: { sortOrder: "asc" },
  });

  return rows.map((row) => toTaskView(row, requireOffer(row)));
}

export async function listRewardOffers(): Promise<TaskRewardOffer[]> {
  const rows = await getPrisma().rewardOffer.findMany({
    include: { task: true },
    orderBy: { task: { sortOrder: "asc" } },
  });
  return rows.map((row) => ({
    taskId: row.taskId,
    offer: toRewardOffer(row),
  }));
}

export async function getRewardOfferByTaskId(
  id: TaskId,
): Promise<RewardOffer | undefined> {
  const row = await getPrisma().rewardOffer.findUnique({
    where: { taskId: id },
  });

  return row ? toRewardOffer(row) : undefined;
}

export async function listTaskTickers(): Promise<string[]> {
  const rows = await getPrisma().rewardOffer.findMany({
    include: { task: true },
    orderBy: { task: { sortOrder: "asc" } },
  });

  return [...new Set(rows.map((row) => row.ticker))];
}

export async function listRewards(): Promise<Reward[]> {
  const rows = await getPrisma().reward.findMany();
  return rows.map(toReward);
}

export async function listHoldings(): Promise<Holding[]> {
  const rows = await getPrisma().holding.findMany();
  return rows.map(toHolding);
}
