import "server-only";

import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/data/db/client";
import { ensureCatalogTask } from "@/lib/data/db/ensure-catalog";
import {
  isDuplicateConstraintError,
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
import type {
  AdminPayoutView,
  AdminSubmissionView,
  TaskEarningView,
  TaskProgress,
  WorkItemView,
} from "@/lib/data/types";
import {
  deriveWorkStatus,
  isRewardPaidStatus,
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
import {
  getEthRewardAmount,
  isValidEvmAddress,
  normalizeEvmAddress,
} from "@/lib/rewards/eth";

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
  videoUrl?: string | null;
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
  const attempt = await startTaskAttempt(userId, taskId);
  const existing = await getProofSubmissionForAttempt(attempt.id);

  if (existing) {
    return existing;
  }

  const now = new Date();
  const fileData = input.file
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
  const videoUrl = input.videoUrl?.trim() || null;

  try {
    const created = await getPrisma().$transaction(async (tx) => {
      await tx.taskAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "marked_complete",
          markedCompleteAt: attempt.markedCompleteAt
            ? new Date(attempt.markedCompleteAt)
            : now,
        },
      });

      const completion = await tx.taskCompletion.upsert({
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

      const raced = await tx.proofSubmission.findUnique({
        where: { completionId: completion.id },
      });

      if (raced) {
        return raced;
      }

      return tx.proofSubmission.create({
        data: {
          id: input.id ?? crypto.randomUUID(),
          completionId: completion.id,
          userId,
          taskId,
          details: input.details,
          submittedAt: now,
          videoUrl,
          ...fileData,
          verification: {
            create: {
              status: "submitted",
              updatedAt: now,
            },
          },
        },
      });
    });

    return toSubmission(created);
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      const raced = await getProofSubmissionForAttempt(attempt.id);

      if (raced) {
        return raced;
      }
    }

    throw error;
  }
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
 * Records submitted → verified or submitted → rejected.
 * Idempotent for the same terminal status. Does not create a Reward or Holding.
 */
export async function setVerificationStatus(
  submissionId: SubmissionId,
  status: "verified" | "rejected",
  options?: { rejectionReason?: string | null },
): Promise<VerificationRecord> {
  if (status !== "verified" && status !== "rejected") {
    throw new Error("Only submitted → verified|rejected is allowed");
  }

  const existing = await getPrisma().verificationRecord.findUnique({
    where: { submissionId },
  });

  if (!existing) {
    throw new Error(`No verification record for submission ${submissionId}`);
  }

  if (existing.status === status) {
    if (status === "rejected") {
      const nextReason = options?.rejectionReason?.trim() || null;
      const currentReason = existing.rejectionReason?.trim() || null;

      if (nextReason && nextReason !== currentReason) {
        const updated = await getPrisma().verificationRecord.update({
          where: { submissionId },
          data: {
            rejectionReason: nextReason,
            updatedAt: new Date(),
          },
        });
        return toVerification(updated);
      }
    }

    return toVerification(existing);
  }

  if (existing.status !== "submitted") {
    throw new Error(
      `Cannot set ${status} from status ${existing.status} on ${submissionId}`,
    );
  }

  const updated = await getPrisma().verificationRecord.update({
    where: { submissionId },
    data: {
      status,
      rejectionReason:
        status === "rejected"
          ? options?.rejectionReason?.trim() || null
          : null,
      updatedAt: new Date(),
    },
  });

  return toVerification(updated);
}

export async function getRewardForSubmission(
  submissionId: SubmissionId,
): Promise<Reward | undefined> {
  const row = await getPrisma().reward.findUnique({
    where: { submissionId },
  });

  return row ? toReward(row) : undefined;
}

/**
 * Legacy operator path: marks a verified submission's reward as paid.
 * Prefer claimReward + markRewardPaid for the ETH payout flow.
 * Idempotent. Does not create a Holding or send ETH.
 */
export async function issueReward(submissionId: SubmissionId): Promise<Reward> {
  const existing = await getRewardForSubmission(submissionId);

  if (existing) {
    if (isRewardPaidStatus(existing.status)) {
      return existing;
    }

    if (existing.status !== "claim_requested" && existing.status !== "not_issued") {
      throw new Error(
        `Cannot issue reward from status ${existing.status} on ${submissionId}`,
      );
    }

    const updated = await getPrisma().reward.update({
      where: { id: existing.id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
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

  const now = new Date();
  const created = await getPrisma().reward.create({
    data: {
      id: crypto.randomUUID(),
      userId: submission.userId,
      taskId: submission.taskId,
      submissionId: submission.id,
      amountCents: offer.amountCents,
      ticker: offer.ticker,
      ethAmount: getEthRewardAmount(),
      status: "paid",
      paidAt: now,
    },
  });

  return toReward(created);
}

/**
 * User claim: creates exactly one claim_requested reward for a verified submission.
 * Requires an explicit EVM payout wallet. Does not send ETH.
 */
export async function claimReward(input: {
  userId: UserId;
  submissionId: SubmissionId;
  payoutWalletAddress: string;
}): Promise<Reward> {
  const wallet = normalizeEvmAddress(input.payoutWalletAddress);

  if (!isValidEvmAddress(wallet)) {
    throw new Error("Enter a valid EVM payout wallet address.");
  }

  const existing = await getRewardForSubmission(input.submissionId);

  if (existing) {
    if (existing.userId !== input.userId) {
      throw new Error("Not allowed to claim this reward.");
    }

    if (isRewardPaidStatus(existing.status) || existing.status === "claim_requested") {
      return existing;
    }

    throw new Error(
      `Cannot claim reward from status ${existing.status} on ${input.submissionId}`,
    );
  }

  const submission = await getPrisma().proofSubmission.findUnique({
    where: { id: input.submissionId },
    include: { verification: true },
  });

  if (!submission) {
    throw new Error(`No proof submission ${input.submissionId}`);
  }

  if (submission.userId !== input.userId) {
    throw new Error("Not allowed to claim this reward.");
  }

  if (submission.verification?.status !== "verified") {
    throw new Error("Proof must be approved before claiming a reward.");
  }

  const offer = await getPrisma().rewardOffer.findUnique({
    where: { taskId: submission.taskId },
  });

  if (!offer) {
    throw new Error(`No reward offer for task ${submission.taskId}`);
  }

  const now = new Date();

  try {
    const created = await getPrisma().reward.create({
      data: {
        id: crypto.randomUUID(),
        userId: submission.userId,
        taskId: submission.taskId,
        submissionId: submission.id,
        amountCents: offer.amountCents,
        ticker: offer.ticker,
        ethAmount: getEthRewardAmount(),
        status: "claim_requested",
        payoutWalletAddress: wallet,
        claimedAt: now,
      },
    });

    return toReward(created);
  } catch (error) {
    if (isDuplicateConstraintError(error)) {
      const raced = await getRewardForSubmission(input.submissionId);
      if (raced && raced.userId === input.userId) {
        return raced;
      }
    }

    throw error;
  }
}

/**
 * Admin confirms a manual ETH send. claim_requested → paid only.
 */
export async function markRewardPaid(input: {
  rewardId: string;
  txHash?: string | null;
}): Promise<Reward> {
  const existing = await getPrisma().reward.findUnique({
    where: { id: input.rewardId },
  });

  if (!existing) {
    throw new Error(`No reward ${input.rewardId}`);
  }

  if (isRewardPaidStatus(existing.status as Reward["status"])) {
    return toReward(existing);
  }

  if (existing.status !== "claim_requested") {
    throw new Error(
      `Cannot mark paid from status ${existing.status} on ${input.rewardId}`,
    );
  }

  const updated = await getPrisma().reward.update({
    where: { id: input.rewardId },
    data: {
      status: "paid",
      paidAt: new Date(),
      txHash: input.txHash?.trim() || null,
    },
  });

  return toReward(updated);
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
    where: { userId, status: { in: ["paid", "issued"] } },
    include: { submission: true },
    orderBy: { submission: { submittedAt: "desc" } },
  });

  return rows.map(toReward);
}

export async function listIssuedTaskEarnings(
  userId: UserId,
): Promise<TaskEarningView[]> {
  const rows = await getPrisma().reward.findMany({
    where: { userId, status: { in: ["paid", "issued"] } },
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
      : "Paid",
    statusLabel: "Reward paid",
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
        href: workHref(task.id),
      };
    });
}

const reviewStatusRank: Record<string, number> = {
  submitted: 0,
  verified: 1,
  rejected: 2,
};

/**
 * All proof submissions for the admin review queue.
 * Pending (`submitted`) rows sort first, then newest submission first.
 */
export async function listSubmissionsForAdminReview(): Promise<
  AdminSubmissionView[]
> {
  const rows = await getPrisma().proofSubmission.findMany({
    include: {
      verification: true,
      task: {
        include: {
          rewardOffer: true,
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const userIds = [...new Set(rows.map((row) => row.userId))];
  const users = userIds.length
    ? await getPrisma().user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          name: true,
          email: true,
          walletAddress: true,
        },
      })
    : [];
  const usersById = new Map(users.map((user) => [user.id, user]));

  return rows
    .filter((row) => row.verification && row.verification.status !== "none")
    .map((row) => {
      const verification = row.verification!;
      const status = verification.status;

      if (
        status !== "submitted" &&
        status !== "verified" &&
        status !== "rejected"
      ) {
        throw new Error(
          `Unexpected verification status ${status} on ${row.id}`,
        );
      }

      const reviewStatus: AdminSubmissionView["status"] = status;

      if (!row.task.rewardOffer) {
        throw new Error(`Task ${row.taskId} is missing a reward offer`);
      }

      const user = usersById.get(row.userId);
      const submission = toSubmission(row);

      return {
        submissionId: row.id,
        userId: row.userId,
        userName: user?.name?.trim() || "Unknown user",
        userEmail: user?.email ?? null,
        userWalletAddress: user?.walletAddress ?? null,
        taskId: row.taskId,
        taskTitle: row.task.title,
        rewardAmountCents: row.task.rewardOffer.amountCents,
        rewardTicker: row.task.rewardOffer.ticker,
        submittedAt: row.submittedAt.toISOString(),
        details: row.details,
        file: submission.file
          ? {
              fileName: submission.file.fileName,
              contentType: submission.file.contentType,
              size: submission.file.size,
              href: `/api/proofs/${row.id}`,
            }
          : null,
        videoUrl: submission.videoUrl,
        status: reviewStatus,
        rejectionReason: verification.rejectionReason?.trim() || null,
        updatedAt: verification.updatedAt.toISOString(),
      };
    })
    .sort((left, right) => {
      const rank =
        (reviewStatusRank[left.status] ?? 9) -
        (reviewStatusRank[right.status] ?? 9);
      if (rank !== 0) return rank;
      return (
        new Date(right.submittedAt).getTime() -
        new Date(left.submittedAt).getTime()
      );
    });
}

const payoutStatusRank: Record<string, number> = {
  claim_requested: 0,
  paid: 1,
  issued: 1,
};

/**
 * Admin ETH payout queue. Pending claims first, then newest claim first.
 */
export async function listPayoutClaimsForAdmin(): Promise<AdminPayoutView[]> {
  const rows = await getPrisma().reward.findMany({
    where: {
      status: { in: ["claim_requested", "paid", "issued"] },
      submissionId: { not: null },
    },
    include: {
      task: true,
    },
    orderBy: [{ claimedAt: "desc" }, { paidAt: "desc" }],
  });

  const userIds = [...new Set(rows.map((row) => row.userId))];
  const users = userIds.length
    ? await getPrisma().user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const usersById = new Map(users.map((user) => [user.id, user]));

  return rows
    .map((row) => {
      const reward = toReward(row);
      const user = usersById.get(row.userId);
      const status =
        reward.status === "issued" ? ("paid" as const) : reward.status;

      if (status !== "claim_requested" && status !== "paid") {
        throw new Error(`Unexpected payout status ${reward.status}`);
      }

      return {
        rewardId: reward.id,
        submissionId: reward.submissionId!,
        userId: reward.userId,
        userName: user?.name?.trim() || "Unknown user",
        userEmail: user?.email ?? null,
        taskId: reward.taskId,
        taskTitle: row.task.title,
        ethAmount: reward.ethAmount,
        payoutWalletAddress: reward.payoutWalletAddress,
        status,
        claimedAt: reward.claimedAt,
        paidAt: reward.paidAt,
        txHash: reward.txHash,
      };
    })
    .sort((left, right) => {
      const rank =
        (payoutStatusRank[left.status] ?? 9) -
        (payoutStatusRank[right.status] ?? 9);
      if (rank !== 0) return rank;
      const leftTime = left.claimedAt ?? left.paidAt ?? "";
      const rightTime = right.claimedAt ?? right.paidAt ?? "";
      return new Date(rightTime).getTime() - new Date(leftTime).getTime();
    });
}
