/**
 * Local persistence check for the real task flow.
 * Uses DATABASE_URL SQLite only — does not touch Turso.
 * Creates a disposable user, then deletes that user's rows.
 */

import { Prisma, PrismaClient } from "@prisma/client";
import { companies, taskLines, tasks } from "../src/data/fixtures";
import { taskLineId } from "../src/lib/data/db/mappers";

const TASK_ID = "product-video";
const prisma = new PrismaClient();

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function isForeignKeyError(error: unknown) {
  return (
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003") ||
    (error instanceof Error && /FOREIGN KEY constraint failed/i.test(error.message))
  );
}

async function ensureTask(taskId: string) {
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (existing) return;

  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  const task = taskIndex >= 0 ? tasks[taskIndex] : undefined;
  assert(task, `Fixture catalog missing ${taskId}`);

  const companyIndex = companies.findIndex(
    (company) => company.id === task.companyId,
  );
  const company = companyIndex >= 0 ? companies[companyIndex] : undefined;
  assert(company, `Fixture catalog missing company for ${taskId}`);

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
      amountCents: task.reward.amountCents,
      ticker: task.reward.ticker,
    },
    update: {},
  });

  for (const line of taskLines.filter((item) => item.taskId === task.id)) {
    const id = taskLineId(line.taskId, line.kind, line.sortOrder);
    await prisma.taskLine.upsert({
      where: { id },
      create: { id, ...line },
      update: {},
    });
  }
}

async function cleanupUser(userId: string) {
  const completions = await prisma.taskCompletion.findMany({
    where: { userId },
    select: { id: true },
  });
  const completionIds = completions.map((row) => row.id);
  const submissions = completionIds.length
    ? await prisma.proofSubmission.findMany({
        where: { completionId: { in: completionIds } },
        select: { id: true },
      })
    : [];
  const submissionIds = submissions.map((row) => row.id);

  if (submissionIds.length) {
    await prisma.verificationRecord.deleteMany({
      where: { submissionId: { in: submissionIds } },
    });
    await prisma.reward.deleteMany({
      where: { submissionId: { in: submissionIds } },
    });
    await prisma.proofSubmission.deleteMany({
      where: { id: { in: submissionIds } },
    });
  }

  await prisma.taskCompletion.deleteMany({ where: { userId } });
  await prisma.taskAttempt.deleteMany({ where: { userId } });
  await prisma.holding.deleteMany({ where: { userId } });
  await prisma.reward.deleteMany({ where: { userId } });
  await prisma.authSession.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
}

async function main() {
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;

  const userId = crypto.randomUUID();
  const username = `flow_${userId.slice(0, 8)}`;

  try {
    await prisma.user.create({
      data: {
        id: userId,
        name: "Task Flow Validate",
        username,
        email: `${username}@invalid.test`,
      },
    });

    let missingTaskFailed = false;
    try {
      await prisma.taskAttempt.create({
        data: {
          id: crypto.randomUUID(),
          userId,
          taskId: "not-a-real-task",
          status: "in_progress",
          checkedStepIndexes: "[]",
          startedAt: new Date(),
        },
      });
    } catch (error) {
      missingTaskFailed = isForeignKeyError(error);
      if (!missingTaskFailed) throw error;
    }

    assert(
      missingTaskFailed,
      "Expected a Task FK failure when the catalog row is missing.",
    );

    await ensureTask(TASK_ID);

    const first = await prisma.taskAttempt.upsert({
      where: { userId_taskId: { userId, taskId: TASK_ID } },
      update: {},
      create: {
        id: crypto.randomUUID(),
        userId,
        taskId: TASK_ID,
        status: "in_progress",
        checkedStepIndexes: "[]",
        startedAt: new Date(),
      },
    });

    const second = await prisma.taskAttempt.upsert({
      where: { userId_taskId: { userId, taskId: TASK_ID } },
      update: {},
      create: {
        id: crypto.randomUUID(),
        userId,
        taskId: TASK_ID,
        status: "in_progress",
        checkedStepIndexes: "[]",
        startedAt: new Date(),
      },
    });

    assert(first.id === second.id, "Resume must reuse the same TaskAttempt.");
    assert(
      (await prisma.taskAttempt.count({ where: { userId, taskId: TASK_ID } })) ===
        1,
      "Duplicate TaskAttempt rows were created.",
    );

    const now = new Date();
    await prisma.taskAttempt.update({
      where: { id: first.id },
      data: { status: "marked_complete", markedCompleteAt: now },
    });

    const completion = await prisma.taskCompletion.upsert({
      where: { attemptId: first.id },
      update: {},
      create: {
        id: crypto.randomUUID(),
        attemptId: first.id,
        userId,
        taskId: TASK_ID,
        markedCompleteAt: now,
      },
    });

    const submittedAt = new Date();
    const submission = await prisma.proofSubmission.create({
      data: {
        id: crypto.randomUUID(),
        completionId: completion.id,
        userId,
        taskId: TASK_ID,
        details: "Logged outdoor runs and attached a recap note.",
        submittedAt,
        verification: {
          create: {
            status: "submitted",
            updatedAt: submittedAt,
          },
        },
      },
      include: { verification: true },
    });

    assert(
      submission.verification?.status === "submitted",
      "Proof must remain pending verification.",
    );

    const [rewards, holdings, verified] = await Promise.all([
      prisma.reward.count({ where: { userId } }),
      prisma.holding.count({ where: { userId } }),
      prisma.verificationRecord.count({
        where: { submissionId: submission.id, status: "verified" },
      }),
    ]);

    assert(rewards === 0, "Reward issuance must not run in this flow.");
    assert(holdings === 0, "Portfolio holdings must stay empty.");
    assert(verified === 0, "Proof must not be auto-verified.");

    const persisted = await prisma.taskAttempt.findUnique({
      where: { userId_taskId: { userId, taskId: TASK_ID } },
      include: {
        completion: {
          include: { submission: { include: { verification: true } } },
        },
      },
    });

    assert(persisted?.status === "marked_complete", "Completion did not persist.");
    assert(
      persisted.completion?.submission?.details.includes("recap note"),
      "Proof submission did not persist.",
    );

    console.log("validate-task-flow: ok", {
      taskId: TASK_ID,
      attemptId: first.id,
      completionId: completion.id,
      submissionId: submission.id,
      verification: submission.verification?.status,
      rewards,
      holdings,
    });
  } finally {
    await cleanupUser(userId);
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.message : error);
  await prisma.$disconnect();
  process.exit(1);
});
