import { PrismaClient } from "@prisma/client";
import { companies, taskLines, tasks } from "../src/data/fixtures";
import { toTaskView } from "../src/lib/data/db/mappers";
import {
  listFeaturedTasks,
  listHomeTasks,
  listTaskTickers,
  listTasks,
} from "../src/lib/data/fixtures-source";

const prisma = new PrismaClient();

function sameIds(actual: string[], expected: string[], label: string) {
  const missing = expected.filter((id) => !actual.includes(id));
  const extra = actual.filter((id) => !expected.includes(id));

  if (missing.length || extra.length) {
    throw new Error(
      `${label} mismatch. missing=${missing.join(",") || "none"} extra=${extra.join(",") || "none"}`,
    );
  }
}

function sameList(actual: string[], expected: string[], label: string) {
  if (actual.length !== expected.length) {
    throw new Error(
      `${label} length: expected ${expected.length}, found ${actual.length}`,
    );
  }

  actual.forEach((value, index) => {
    if (value !== expected[index]) {
      throw new Error(
        `${label}[${index}]: expected ${expected[index]}, found ${value}`,
      );
    }
  });
}

async function main() {
  const companyRows = await prisma.company.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const taskRows = await prisma.task.findMany({
    include: { company: true, lines: true, rewardOffer: true },
    orderBy: { sortOrder: "asc" },
  });
  const lineRows = await prisma.taskLine.findMany();
  const userCount = await prisma.user.count();
  const rewardCount = await prisma.reward.count();
  const holdingCount = await prisma.holding.count();

  sameIds(
    companyRows.map((row) => row.id),
    companies.map((item) => item.id),
    "companies",
  );
  sameIds(
    taskRows.map((row) => row.id),
    tasks.map((item) => item.id),
    "tasks",
  );

  if (lineRows.length !== taskLines.length) {
    throw new Error(
      `task lines: expected ${taskLines.length}, found ${lineRows.length}`,
    );
  }

  const catalog = taskRows.map((row) => {
    if (!row.rewardOffer) {
      throw new Error(`Missing reward offer for ${row.id}`);
    }

    return toTaskView(row, row.rewardOffer);
  });
  const fixtureCatalog = listTasks();

  sameList(
    catalog.map((task) => task.id),
    fixtureCatalog.map((task) => task.id),
    "task order",
  );

  for (const expected of fixtureCatalog) {
    const actual = catalog.find((task) => task.id === expected.id);

    if (!actual) {
      throw new Error(`Mapped catalog missing ${expected.id}`);
    }

    if (
      actual.title !== expected.title ||
      actual.company.name !== expected.company.name ||
      actual.requirement !== expected.requirement ||
      actual.reward.amountCents !== expected.reward.amountCents ||
      actual.reward.ticker !== expected.reward.ticker ||
      actual.featured !== expected.featured ||
      actual.onHome !== expected.onHome ||
      actual.steps.join("|") !== expected.steps.join("|") ||
      actual.instructions.join("|") !== expected.instructions.join("|") ||
      actual.eligibility.join("|") !== expected.eligibility.join("|")
    ) {
      throw new Error(`Catalog view mismatch for ${expected.id}`);
    }
  }

  sameList(
    catalog.filter((task) => task.featured).map((task) => task.id),
    listFeaturedTasks().map((task) => task.id),
    "featured tasks",
  );
  sameList(
    catalog.filter((task) => task.onHome).map((task) => task.id),
    listHomeTasks().map((task) => task.id),
    "home tasks",
  );
  sameList(
    [...new Set(catalog.map((task) => task.reward.ticker))],
    listTaskTickers(),
    "task tickers",
  );

  if (holdingCount !== 0) {
    throw new Error("Expected empty holding table.");
  }

  console.log("Database-backed catalog matches fixture catalog.");
  console.log({
    companies: companyRows.length,
    tasks: catalog.length,
    taskLines: lineRows.length,
    rewardOffers: catalog.length,
    featured: catalog.filter((task) => task.featured).length,
    onHome: catalog.filter((task) => task.onHome).length,
    users: userCount,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
