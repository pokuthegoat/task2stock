import type {
  Company,
  Holding,
  ProofSubmission,
  Reward,
  RewardOffer,
  RewardStatus,
  Task,
  TaskAttempt,
  TaskCompletion,
  TaskLine,
  TaskLineKind,
  User,
  VerificationRecord,
  VerificationStatus,
} from "@/lib/domain/model";
import type { TaskView } from "@/lib/data/types";

type CompanyRow = { id: string; name: string };
type RewardOfferRow = { amountCents: number; ticker: string };
type TaskRow = {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimate: string;
  timeBucket: string;
  featured: boolean;
  onHome: boolean;
};
type TaskLineRow = {
  taskId: string;
  kind: string;
  sortOrder: number;
  body: string;
};
type UserRow = { id: string; name: string; email: string; createdAt: Date };
type AttemptRow = {
  id: string;
  userId: string;
  taskId: string;
  status: string;
  checkedStepIndexes: string;
  startedAt: Date;
  markedCompleteAt: Date | null;
};
type CompletionRow = {
  id: string;
  attemptId: string;
  userId: string;
  taskId: string;
  markedCompleteAt: Date;
};
type SubmissionRow = {
  id: string;
  completionId: string;
  userId: string;
  taskId: string;
  details: string;
  submittedAt: Date;
  fileName?: string | null;
  fileContentType?: string | null;
  fileSize?: number | null;
  fileStorageKey?: string | null;
  videoUrl?: string | null;
};
type VerificationRow = {
  submissionId: string;
  status: string;
  rejectionReason?: string | null;
  updatedAt: Date;
};
type RewardRow = {
  id: string;
  userId: string;
  taskId: string;
  submissionId: string | null;
  amountCents: number;
  ticker: string;
  ethAmount?: string | null;
  status: string;
  payoutWalletAddress?: string | null;
  claimedAt?: Date | null;
  paidAt?: Date | null;
  txHash?: string | null;
};
type HoldingRow = {
  id: string;
  userId: string;
  ticker: string;
  name: string;
  valueCents: number;
  sourceTaskId: string | null;
  status: string;
};

function asCategory(value: string): Task["category"] {
  if (
    value === "Fitness" ||
    value === "Creative" ||
    value === "Community" ||
    value === "Retail"
  ) {
    return value;
  }

  throw new Error(`Unknown task category: ${value}`);
}

function asDifficulty(value: string): Task["difficulty"] {
  if (value === "Easy" || value === "Moderate" || value === "Advanced") {
    return value;
  }

  throw new Error(`Unknown task difficulty: ${value}`);
}

function asTimeBucket(value: string): Task["timeBucket"] {
  if (
    value === "Under 2 hours" ||
    value === "A few hours" ||
    value === "About a week" ||
    value === "A few weeks"
  ) {
    return value;
  }

  throw new Error(`Unknown task time bucket: ${value}`);
}

function asLineKind(value: string): TaskLineKind {
  if (
    value === "requirement" ||
    value === "step" ||
    value === "instruction" ||
    value === "eligibility"
  ) {
    return value;
  }

  throw new Error(`Unknown task line kind: ${value}`);
}

function asAttemptStatus(value: string): TaskAttempt["status"] {
  if (value === "in_progress" || value === "marked_complete") {
    return value;
  }

  throw new Error(`Unknown attempt status: ${value}`);
}

function asVerificationStatus(value: string): VerificationStatus {
  if (
    value === "none" ||
    value === "submitted" ||
    value === "verified" ||
    value === "rejected"
  ) {
    return value;
  }

  throw new Error(`Unknown verification status: ${value}`);
}

function asRewardStatus(value: string): RewardStatus {
  if (
    value === "not_issued" ||
    value === "claim_requested" ||
    value === "paid" ||
    value === "issued"
  ) {
    return value;
  }

  throw new Error(`Unknown reward status: ${value}`);
}

function asHoldingStatus(value: string): Holding["status"] {
  if (value === "preview" || value === "not_settled") {
    return value;
  }

  throw new Error(`Unknown holding status: ${value}`);
}

export function toCompany(row: CompanyRow): Company {
  return { id: row.id, name: row.name };
}

export function toRewardOffer(row: RewardOfferRow): RewardOffer {
  return { amountCents: row.amountCents, ticker: row.ticker };
}

export function toTask(row: TaskRow, offer: RewardOfferRow): Task {
  return {
    id: row.id,
    companyId: row.companyId,
    title: row.title,
    description: row.description,
    category: asCategory(row.category),
    difficulty: asDifficulty(row.difficulty),
    estimate: row.estimate,
    timeBucket: asTimeBucket(row.timeBucket),
    featured: row.featured,
    onHome: row.onHome,
    reward: toRewardOffer(offer),
  };
}

export function toTaskLine(row: TaskLineRow): TaskLine {
  return {
    taskId: row.taskId,
    kind: asLineKind(row.kind),
    sortOrder: row.sortOrder,
    body: row.body,
  };
}

export function toTaskView(
  row: TaskRow & { company: CompanyRow; lines: TaskLineRow[] },
  offer: RewardOfferRow,
): TaskView {
  const lines = row.lines
    .map(toTaskLine)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const requirement =
    lines.find((line) => line.kind === "requirement")?.body ?? "";

  return {
    ...toTask(row, offer),
    company: toCompany(row.company),
    requirement,
    steps: lines.filter((line) => line.kind === "step").map((line) => line.body),
    instructions: lines
      .filter((line) => line.kind === "instruction")
      .map((line) => line.body),
    eligibility: lines
      .filter((line) => line.kind === "eligibility")
      .map((line) => line.body)
      .filter(
        (body) => body !== "Example listing only — not a live offer.",
      ),
  };
}

export function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toAttempt(row: AttemptRow): TaskAttempt {
  const checked = JSON.parse(row.checkedStepIndexes) as unknown;

  if (
    !Array.isArray(checked) ||
    checked.some((item) => typeof item !== "number")
  ) {
    throw new Error(`Invalid checkedStepIndexes on attempt ${row.id}`);
  }

  return {
    id: row.id,
    userId: row.userId,
    taskId: row.taskId,
    status: asAttemptStatus(row.status),
    checkedStepIndexes: checked,
    startedAt: row.startedAt.toISOString(),
    markedCompleteAt: row.markedCompleteAt?.toISOString() ?? null,
  };
}

export function toCompletion(row: CompletionRow): TaskCompletion {
  return {
    id: row.id,
    attemptId: row.attemptId,
    userId: row.userId,
    taskId: row.taskId,
    markedCompleteAt: row.markedCompleteAt.toISOString(),
  };
}

export function toSubmission(row: SubmissionRow): ProofSubmission {
  const fileName = row.fileName;
  const contentType = row.fileContentType;
  const storageKey = row.fileStorageKey;
  const size = row.fileSize;

  return {
    id: row.id,
    completionId: row.completionId,
    userId: row.userId,
    taskId: row.taskId,
    details: row.details,
    submittedAt: row.submittedAt.toISOString(),
    file:
      fileName && contentType && storageKey && size != null
        ? { fileName, contentType, size, storageKey }
        : null,
    videoUrl: row.videoUrl?.trim() || null,
  };
}

export function toVerification(row: VerificationRow): VerificationRecord {
  return {
    submissionId: row.submissionId,
    status: asVerificationStatus(row.status),
    rejectionReason: row.rejectionReason?.trim() || null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toReward(row: RewardRow): Reward {
  return {
    id: row.id,
    userId: row.userId,
    taskId: row.taskId,
    submissionId: row.submissionId,
    amountCents: row.amountCents,
    ticker: row.ticker,
    ethAmount: row.ethAmount?.trim() || "0.01",
    status: asRewardStatus(row.status),
    payoutWalletAddress: row.payoutWalletAddress?.trim() || null,
    claimedAt: row.claimedAt ? row.claimedAt.toISOString() : null,
    paidAt: row.paidAt ? row.paidAt.toISOString() : null,
    txHash: row.txHash?.trim() || null,
  };
}

export function toHolding(row: HoldingRow): Holding {
  return {
    id: row.id,
    userId: row.userId,
    ticker: row.ticker,
    name: row.name,
    valueCents: row.valueCents,
    sourceTaskId: row.sourceTaskId,
    status: asHoldingStatus(row.status),
  };
}

export function taskLineId(taskId: string, kind: string, sortOrder: number) {
  return `${taskId}:${kind}:${sortOrder}`;
}
