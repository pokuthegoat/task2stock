/**
 * Fixture-backed catalog and example books.
 * This is the live UI source until DATA_SOURCE switches to `database`.
 */

import {
  companies,
  examplePortfolioFixture,
  homeActivityFixtures,
  homeHoldingFixtures,
  homeRewardPreviewFixtures,
  portfolioHoldings,
  taskEarningFixtures,
  taskLines,
  tasks,
} from "@/data/fixtures";
import type {
  Company,
  CompanyId,
  RewardOffer,
  Task,
  TaskId,
  TaskLine,
} from "@/lib/domain/model";
import type {
  ExamplePortfolioView,
  HomeActivityView,
  HomeHoldingView,
  HomeRewardPreview,
  PortfolioHoldingView,
  TaskEarningView,
  TaskRewardOffer,
  TaskView,
} from "@/lib/data/types";

function companyById(id: CompanyId): Company {
  const company = companies.find((item) => item.id === id);

  if (!company) {
    throw new Error(`Missing company fixture: ${id}`);
  }

  return company;
}

function taskById(id: TaskId): Task {
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    throw new Error(`Missing task fixture: ${id}`);
  }

  return task;
}

function bodies(taskId: TaskId, kind: TaskLine["kind"]): string[] {
  return taskLines
    .filter((line) => line.taskId === taskId && line.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((line) => line.body);
}

function toTaskView(task: Task): TaskView {
  const requirement = bodies(task.id, "requirement")[0] ?? "";

  return {
    ...task,
    company: companyById(task.companyId),
    requirement,
    steps: bodies(task.id, "step"),
    instructions: bodies(task.id, "instruction"),
    eligibility: bodies(task.id, "eligibility"),
  };
}

export function listCompanies(): Company[] {
  return companies;
}

export function getCompanyById(id: CompanyId): Company | undefined {
  return companies.find((company) => company.id === id);
}

export function listTaskRecords(): Task[] {
  return tasks;
}

export function listTaskLines(taskId?: TaskId): TaskLine[] {
  if (!taskId) {
    return taskLines;
  }

  return taskLines.filter((line) => line.taskId === taskId);
}

export function listTasks(): TaskView[] {
  return tasks.map(toTaskView);
}

export function getTaskById(id: TaskId): TaskView | undefined {
  const task = tasks.find((item) => item.id === id);
  return task ? toTaskView(task) : undefined;
}

export function listFeaturedTasks(): TaskView[] {
  return listTasks().filter((task) => task.featured);
}

export function listHomeTasks(): TaskView[] {
  return listTasks().filter((task) => task.onHome);
}

export function listRewardOffers(): TaskRewardOffer[] {
  return tasks.map((task) => ({
    taskId: task.id,
    offer: task.reward,
  }));
}

export function getRewardOfferByTaskId(id: TaskId): RewardOffer | undefined {
  return tasks.find((task) => task.id === id)?.reward;
}

export function listTaskTickers(): string[] {
  return [...new Set(tasks.map((task) => task.reward.ticker))];
}

export function listHomeRewardPreviews(): HomeRewardPreview[] {
  return homeRewardPreviewFixtures.map((item) => {
    const task = taskById(item.taskId);

    return {
      taskId: task.id,
      title: task.title,
      companyName: companyById(task.companyId).name,
      offer: task.reward,
    };
  });
}

export function listHomeHoldings(): HomeHoldingView[] {
  return homeHoldingFixtures;
}

export function listHomeActivity(): HomeActivityView[] {
  return homeActivityFixtures;
}

export function getExamplePortfolio(): ExamplePortfolioView {
  return examplePortfolioFixture;
}

export function listPortfolioHoldings(): PortfolioHoldingView[] {
  return portfolioHoldings.map((holding) => ({
    ...holding,
    sourceTaskTitle: holding.sourceTaskId
      ? taskById(holding.sourceTaskId).title
      : "",
  }));
}

export function listTaskEarnings(): TaskEarningView[] {
  return taskEarningFixtures.map((item) => {
    const task = toTaskView(taskById(item.reward.taskId));

    return {
      reward: item.reward,
      taskTitle: task.title,
      companyName: task.company.name,
      completedLabel: item.completedLabel,
      statusLabel: item.statusLabel,
    };
  });
}
