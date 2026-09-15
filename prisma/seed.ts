/**
 * Seeds the catalog from src/data/fixtures.ts.
 * Does not create users, attempts, rewards, or holdings.
 */

import { PrismaClient } from "@prisma/client";
import { companies, taskLines, tasks } from "../src/data/fixtures";
import { taskLineId } from "../src/lib/data/db/mappers";

const prisma = new PrismaClient();

async function main() {
  for (const [sortOrder, company] of companies.entries()) {
    await prisma.company.upsert({
      where: { id: company.id },
      create: { ...company, sortOrder },
      update: { ...company, sortOrder },
    });
  }

  for (const [sortOrder, task] of tasks.entries()) {
    const { reward, ...record } = task;

    await prisma.task.upsert({
      where: { id: record.id },
      create: { ...record, sortOrder },
      update: { ...record, sortOrder },
    });

    await prisma.rewardOffer.upsert({
      where: { taskId: record.id },
      create: {
        taskId: record.id,
        amountCents: reward.amountCents,
        ticker: reward.ticker,
      },
      update: {
        amountCents: reward.amountCents,
        ticker: reward.ticker,
      },
    });
  }

  const lineIds: string[] = [];

  for (const line of taskLines) {
    const id = taskLineId(line.taskId, line.kind, line.sortOrder);
    lineIds.push(id);

    await prisma.taskLine.upsert({
      where: { id },
      create: { id, ...line },
      update: { ...line },
    });
  }

  await prisma.taskLine.deleteMany({
    where: { id: { notIn: lineIds } },
  });

  const counts = {
    companies: await prisma.company.count(),
    tasks: await prisma.task.count(),
    rewardOffers: await prisma.rewardOffer.count(),
    taskLines: await prisma.taskLine.count(),
    users: await prisma.user.count(),
  };

  console.log("Catalog seed complete:", counts);
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
