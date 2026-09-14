import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/data/db/client";
import { ensureCatalogTask } from "@/lib/data/db/ensure-catalog";
import {
  isForeignKeyConstraintError,
  logDatabaseError,
} from "@/lib/data/db/errors";
import {
  toAttempt,
  toCompletion,
  toReward,
  toRewardOffer,
  toSubmission,
  toTask,
  toVerification,
} from "@/lib/data/db/mappers";
import type { TaskEarningView, TaskProgress, WorkItemView } from "@/lib/data/types";
import {
  deriveWorkStatus,
  workHref,
  workStatusLabels,
} from "@/lib/data/work";
import type {
  AttemptId,
  ProofSubmission,
  Reward,
  SubmissionId,
  TaskAttempt,
  TaskId,
  UserId,
  VerificationRecord,
} from "@/lib/domain/model";

const attemptInclude = {
  completion: {
    include: {
      submission: {
        include: {
          verification: true,
          rewards: true,
        },
      },
    },
  },
} satisfies Prisma.TaskAttemptInclude;

const workInclude = {
  ...attemptInclude,
  task: {
    include: {
      company: true,
      rewardOffer: true,
    },
  },
} satisfies Prisma.TaskAttemptInclude;

type AttemptWithChain = Prisma.TaskAttemptGetPayload<{
  include: typeof attemptInclude;
}>;

type WorkAttemptRow = Prisma.TaskAttemptGetPayload<{
  include: typeof workInclude;
}>;

function latestActivityMs(row: WorkAttemptRow): number {
  const times: Date[] = [row.startedAt];

  if (row.markedCompleteAt) {
    times.push(row.markedCompleteAt);
  }

  if (row.completion?.markedCompleteAt) {
    times.push(row.completion.markedCompleteAt);
  }

  if (row.completion?.submission?.submittedAt) {
    times.push(row.completion.submission.submittedAt);
  }

  if (row.completion?.submission?.verification?.updatedAt) {
    times.push(row.completion.submission.verification.updatedAt);
  }

  return Math.max(...times.map((time) => time.getTime()));
}

function pickReward(
  rows:
    | Array<{
        id: string;
        userId: string;
        taskId: string;
        submissionId: string | null;
        amountCents: number;
        ticker: string;
        status: string;
      }>
    | undefined,
): TaskProgress["reward"] {
  if (!rows?.length) {
    return null;
  }

  const issued = rows.find((row) => row.status === "issued");
  return toReward(issued ?? rows[0]);
}

function toProgress(row: AttemptWithChain | null): TaskProgress {
  if (!row) {
    return {
      attempt: null,
      completion: null,
      submission: null,
      verification: null,
      reward: null,
    };
  }

  return {
    attempt: toAttempt(row),
    completion: row.completion ? toCompletion(row.completion) : null,
    submission: row.completion?.submission
      ? toSubmission(row.completion.submission)
      : null,
    verification: row.completion?.submission?.verification
      ? toVerification(row.completion.submission.verification)
      : null,
    reward: pickReward(row.completion?.submission?.rewards),
  };
}

export async function getCurrentAttempt(
  userId: UserId,
  taskId: TaskId,
): Promise<TaskAttempt | undefined> {
  const row = await getPrisma().taskAttempt.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });

  return row ? toAttempt(row) : undefined;
}

async function upsertTaskAttempt(
  userId: UserId,
  taskId: TaskId,
): Promise<TaskAttempt> {
  const created = await getPrisma().taskAttempt.upsert({
    where: { userId_taskId: { userId, taskId } },
    update: {},
    create: {
      id: crypto.randomUUID(),
      userId,
      taskId,
      status: "in_progress",
      checkedStepIndexes: "[]",
      startedAt: new Date(),
      markedCompleteAt: null,
    },
  });

  return toAttempt(created);
}

export async function startTaskAttempt(
  userId: UserId,
  taskId: TaskId,
): Promise<TaskAttempt> {
  const ready = await ensureCatalogTask(taskId);

  if (!ready) {
    throw new Error(`Unknown task ${taskId}`);
  }

  try {
    return await upsertTaskAttempt(userId, taskId);
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      const retried = await ensureCatalogTask(taskId);

      if (retried) {
        try {
          return await upsertTaskAttempt(userId, taskId);
        } catch (retryError) {
          logDatabaseError("startTaskAttempt", retryError);
          throw new Error("Unable to start this task.");
        }
      }
    }

    logDatabaseError("startTaskAttempt", error);
    throw new Error("Unable to start this task.");
  }
}

export async function saveAttemptChecklist(
  userId: UserId,
  taskId: TaskId,
  checkedStepIndexes: number[],
): Promise<TaskAttempt> {
  const attempt = await startTaskAttempt(userId, taskId);

  if (attempt.status === "marked_complete") {
    return attempt;
  }

  const updated = await getPrisma().taskAttempt.update({
    where: { id: attempt.id },
    data: { checkedStepIndexes: JSON.stringify(checkedStepIndexes) },
  });

  return toAttempt(updated);
}

export async function markAttemptComplete(
  userId: UserId,
  taskId: TaskId,
): Promise<TaskAttempt> {
  const attempt = await startTaskAttempt(userId, taskId);
  const now = new Date();

  const updated = await getPrisma().taskAttempt.update({
    where: { id: attempt.id },
    data: {
      status: "marked_complete",
      markedCompleteAt: attempt.markedCompleteAt
        ? new Date(attempt.markedCompleteAt)
        : now,
    },
  });

  await getPrisma().taskCompletion.upsert({
    where: { attemptId: attempt.id },
    update: {},
    create: {
      id: crypto.randomUUID(),
      attemptId: attempt.id,
      userId,
      taskId,
      markedCompleteAt: now,
    },
  });

  return toAttempt(updated);
}

export async function getProofSubmissionForAttempt(
  attemptId: AttemptId,
): Promise<ProofSubmission | undefined> {
  const completion = await getPrisma().taskCompletion.findUnique({
    where: { attemptId },
    include: { submission: true },
  });

  return completion?.submission
    ? toSubmission(completion.submission)
    : undefined;
}

export async function getVerificationForAttempt(
  attemptId: AttemptId,
): Promise<VerificationRecord | undefined> {
  const submission = await getProofSubmissionForAttempt(attemptId);

  if (!submission) {
    return undefined;
  }

  const row = await getPrisma().verificationRecord.findUnique({
    where: { submissionId: submission.id },
  });

  return row ? toVerification(row) : undefined;
}

export type ProofWriteInput = {
  id?: string;
  details: string;
  file?: {
    fileName: string;
    contentType: string;
    size: number;
    storageKey: string;
  } | null;
};

export async function submitProof(
  userId: UserId,
  taskId: TaskId,
  input: ProofWriteInput,
): Promise<ProofSubmission> {
  const attempt = await markAttemptComplete(userId, taskId);
  const completion = await getPrisma().taskCompletion.findUnique({
    where: { attemptId: attempt.id },
  });

  if (!completion) {
    throw new Error(`Missing completion for attempt ${attempt.id}`);
  }

  const existing = await getPrisma().proofSubmission.findUnique({
    where: { completionId: completion.id },
    include: { verification: true },
  });

  const fileData =
    input.file === undefined
      ? {}
      : input.file
        ? {
            fileName: input.file.fileName,
            fileContentType: input.file.contentType,
            fileSize: input.file.size,
            fileStorageKey: input.file.storageKey,
          }
        : {
            fileName: null,
            fileContentType: null,
            fileSize: null,
            fileStorageKey: null,
          };

  if (existing) {
    if (existing.verification?.status === "verified") {
      return toSubmission(existing);
    }

    const updated = await getPrisma().proofSubmission.update({
      where: { id: existing.id },
      data: {
        details: input.details,
        ...fileData,
      },
    });

    return toSubmission(updated);
  }

  const submittedAt = new Date();
  const created = await getPrisma().proofSubmission.create({
    data: {
      id: input.id ?? crypto.randomUUID(),
      completionId: completion.id,
      userId,
      taskId,
      details: input.details,
      submittedAt,
      ...fileData,
      verification: {
        create: {
          status: "submitted",
          updatedAt: submittedAt,
        },
      },
    },
  });

  return toSubmission(created);
}

export async function getProofSubmissionById(
  submissionId: SubmissionId,
): Promise<ProofSubmission | undefined> {
  const row = await getPrisma().proofSubmission.findUnique({
    where: { id: submissionId },
  });

  return row ? toSubmission(row) : undefined;
}

/**
 * Records submitted → verified only.
 * Does not create a VerificationRecord, Reward, or Holding.
 */
export async function setVerificationStatus(
  submissionId: SubmissionId,
  status: "verified",
): Promise<VerificationRecord> {
  if (status !== "verified") {
    throw new Error("Only submitted → verified is allowed");
  }

  const existing = await getPrisma().verificationRecord.findUnique({
    where: { submissionId },
  });

  if (!existing) {
    throw new Error(`No verification record for submission ${submissionId}`);
  }

  if (existing.status === "verified") {
    return toVerification(existing);
  }

  if (existing.status !== "submitted") {
    throw new Error(
      `Cannot set verified from status ${existing.status} on ${submissionId}`,
    );
  }

  const updated = await getPrisma().verificationRecord.update({
    where: { submissionId },
    data: {
      status: "verified",
      updatedAt: new Date(),
    },
  });

  return toVerification(updated);
}

export async function getRewardForSubmission(
  submissionId: SubmissionId,
): Promise<Reward | undefined> {
  const row = await getPrisma().reward.findFirst({
    where: { submissionId },
  });

  return row ? toReward(row) : undefined;
}

/**
 * Marks a verified submission's promised RewardOffer as issued.
 * Idempotent. Does not create a Holding or move money.
 */
export async function issueReward(submissionId: SubmissionId): Promise<Reward> {
  const existing = await getRewardForSubmission(submissionId);

  if (existing) {
    if (existing.status === "issued") {
      return existing;
    }

    if (existing.status !== "not_issued") {
      throw new Error(
        `Cannot issue reward from status ${existing.status} on ${submissionId}`,
      );
    }

    const updated = await getPrisma().reward.update({
      where: { id: existing.id },
      data: { status: "issued" },
    });

    return toReward(updated);
  }

  const submission = await getPrisma().proofSubmission.findUnique({
    where: { id: submissionId },
    include: {
      verification: true,
    },
  });

  if (!submission) {
    throw new Error(`No proof submission ${submissionId}`);
  }

  const user = await getPrisma().user.findUnique({
    where: { id: submission.userId },
  });

  if (!user) {
    throw new Error(`No authenticated user for submission ${submissionId}`);
  }

  if (submission.verification?.status !== "verified") {
    throw new Error(
      `Reward can only be issued after verification is verified on ${submissionId}`,
    );
  }

  const offer = await getPrisma().rewardOffer.findUnique({
    where: { taskId: submission.taskId },
  });

  if (!offer) {
    throw new Error(`No reward offer for task ${submission.taskId}`);
  }

  const created = await getPrisma().reward.create({
    data: {
      id: crypto.randomUUID(),
      userId: submission.userId,
      taskId: submission.taskId,
      submissionId: submission.id,
      amountCents: offer.amountCents,
      ticker: offer.ticker,
      status: "issued",
    },
  });

  return toReward(created);
}

export async function getTaskProgress(
  userId: UserId,
  taskId: TaskId,
): Promise<TaskProgress> {
  const row = await getPrisma().taskAttempt.findUnique({
    where: { userId_taskId: { userId, taskId } },
    include: attemptInclude,
  });

  return toProgress(row);
}

export async function listIssuedRewardsForUser(
  userId: UserId,
): Promise<Reward[]> {
  const rows = await getPrisma().reward.findMany({
    where: { userId, status: "issued" },
    include: { submission: true },
    orderBy: { submission: { submittedAt: "desc" } },
  });

  return rows.map(toReward);
}

export async function listIssuedTaskEarnings(
  userId: UserId,
): Promise<TaskEarningView[]> {
  const rows = await getPrisma().reward.findMany({
    where: { userId, status: "issued" },
    include: {
      task: { include: { company: true } },
      submission: true,
    },
    orderBy: { submission: { submittedAt: "desc" } },
  });

  return rows.map((row) => ({
    reward: toReward(row),
    taskTitle: row.task.title,
    companyName: row.task.company.name,
    completedLabel: row.submission
      ? row.submission.submittedAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Issued",
    statusLabel: "Issued",
  }));
}

/**
 * Started tasks for one authenticated user.
 * Status and order come from the existing participation chain.
 */
export async function listWorkForUser(userId: UserId): Promise<WorkItemView[]> {
  if (!userId) {
    throw new Error("listWorkForUser requires a user id");
  }

  const rows = await getPrisma().taskAttempt.findMany({
    where: { userId },
    include: workInclude,
  });

  return rows
    .map((row) => ({ row, activityMs: latestActivityMs(row) }))
    .sort((left, right) => right.activityMs - left.activityMs)
    .map(({ row }) => {
      if (!row.task.rewardOffer) {
        throw new Error(`Task ${row.task.id} is missing a reward offer`);
      }

      const task = toTask(row.task, row.task.rewardOffer);
      const progress = toProgress(row);
      const status = deriveWorkStatus(progress);

      return {
        taskId: task.id,
        title: task.title,
        companyName: row.task.company.name,
        offer: toRewardOffer(row.task.rewardOffer),
        difficulty: task.difficulty,
        estimate: task.estimate,
        timeBucket: task.timeBucket,
        status,
        statusLabel: workStatusLabels[status],
        href: workHref(task.id, status),
      };
    });
}
