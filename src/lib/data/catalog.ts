/**
 * Server-only catalog reads.
 * DATA_SOURCE=database uses Prisma; fixtures remain the fallback.
 * Do not import this module from client components.
 */

import "server-only";

import { homeRewardPreviewFixtures } from "@/data/fixtures";
import { isDatabaseSource } from "@/lib/data/config";
import * as database from "@/lib/data/db/catalog";
import * as fixtures from "@/lib/data/fixtures-source";
import type {
  Company,
  CompanyId,
  RewardOffer,
  Task,
  TaskId,
  TaskLine,
} from "@/lib/domain/model";
import type {
  HomeRewardPreview,
  TaskRewardOffer,
  TaskView,
} from "@/lib/data/types";

export async function listCompanies(): Promise<Company[]> {
  return isDatabaseSource()
    ? database.listCompanies()
    : fixtures.listCompanies();
}

export async function getCompanyById(
  id: CompanyId,
): Promise<Company | undefined> {
  return isDatabaseSource()
    ? database.getCompanyById(id)
    : fixtures.getCompanyById(id);
}

export async function listTaskRecords(): Promise<Task[]> {
  return isDatabaseSource()
    ? database.listTaskRecords()
    : fixtures.listTaskRecords();
}

export async function listTaskLines(taskId?: TaskId): Promise<TaskLine[]> {
  return isDatabaseSource()
    ? database.listTaskLines(taskId)
    : fixtures.listTaskLines(taskId);
}

export async function listTasks(): Promise<TaskView[]> {
  return isDatabaseSource() ? database.listTasks() : fixtures.listTasks();
}

export async function getTaskById(id: TaskId): Promise<TaskView | undefined> {
  return isDatabaseSource()
    ? database.getTaskById(id)
    : fixtures.getTaskById(id);
}

export async function listFeaturedTasks(): Promise<TaskView[]> {
  return isDatabaseSource()
    ? database.listFeaturedTasks()
    : fixtures.listFeaturedTasks();
}

export async function listHomeTasks(): Promise<TaskView[]> {
  return isDatabaseSource()
    ? database.listHomeTasks()
    : fixtures.listHomeTasks();
}

export async function listRewardOffers(): Promise<TaskRewardOffer[]> {
  return isDatabaseSource()
    ? database.listRewardOffers()
    : fixtures.listRewardOffers();
}

export async function getRewardOfferByTaskId(
  id: TaskId,
): Promise<RewardOffer | undefined> {
  return isDatabaseSource()
    ? database.getRewardOfferByTaskId(id)
    : fixtures.getRewardOfferByTaskId(id);
}

export async function listTaskTickers(): Promise<string[]> {
  return isDatabaseSource()
    ? database.listTaskTickers()
    : fixtures.listTaskTickers();
}

/** Offers come from the catalog; short hero labels stay presentation copy. */
export async function listHomeRewardPreviews(): Promise<HomeRewardPreview[]> {
  if (!isDatabaseSource()) {
    return fixtures.listHomeRewardPreviews();
  }

  return Promise.all(
    homeRewardPreviewFixtures.map(async (item) => {
      const task = await database.getTaskById(item.taskId);

      if (!task) {
        throw new Error(`Missing catalog task for ${item.taskId}`);
      }

      return {
        taskId: task.id,
        title: task.title,
        companyName: task.company.name,
        offer: task.reward,
      };
    }),
  );
}
