/**
 * Domain contract for persistence. Types only — no storage providers here.
 * Catalog reads go through `src/lib/data/catalog` (Prisma when DATA_SOURCE=database).
 * Participation writes go through `src/lib/data/participation`,
 * keyed by the authenticated User.id from `src/lib/auth/session`.
 * Example portfolio/holdings still read fixtures.
 * PortfolioView is computed, not a table.
 *
 * Verification is a status field. Manual decisions go through
 * `src/app/actions/verification`. Automated verification is not connected.
 * Reward issuance is a separate operator action in `src/app/actions/rewards`.
 * It does not pay, settle, or create a Holding.
 * My Work (`/work`) lists the signed-in user's TaskAttempts and derives
 * status from this same chain. It does not store a second activity table.
 * Profile (`/profile`) reads and updates the authenticated User row only.
 */

export type UserId = string;
export type CompanyId = string;
export type TaskId = string;
export type AttemptId = string;
export type CompletionId = string;
export type SubmissionId = string;
export type RewardId = string;
export type HoldingId = string;

export type User = {
  id: UserId;
  name: string;
  email: string;
  createdAt: string;
};

export type Company = {
  id: CompanyId;
  name: string;
};

export type RewardOffer = {
  amountCents: number;
  ticker: string;
};

export type Task = {
  id: TaskId;
  companyId: CompanyId;
  title: string;
  description: string;
  category: "Fitness" | "Creative" | "Community" | "Retail";
  difficulty: "Easy" | "Moderate" | "Advanced";
  estimate: string;
  timeBucket: "Under 2 hours" | "A few hours" | "About a week" | "A few weeks";
  reward: RewardOffer;
  featured: boolean;
  onHome: boolean;
};

export type TaskLineKind = "requirement" | "step" | "instruction" | "eligibility";

export type TaskLine = {
  taskId: TaskId;
  kind: TaskLineKind;
  sortOrder: number;
  body: string;
};

export type AttemptStatus = "in_progress" | "marked_complete";

export type TaskAttempt = {
  id: AttemptId;
  userId: UserId;
  taskId: TaskId;
  status: AttemptStatus;
  checkedStepIndexes: number[];
  startedAt: string;
  markedCompleteAt: string | null;
};

export type TaskCompletion = {
  id: CompletionId;
  attemptId: AttemptId;
  userId: UserId;
  taskId: TaskId;
  markedCompleteAt: string;
};

export type ProofFile = {
  fileName: string;
  contentType: string;
  size: number;
  storageKey: string;
};

export type ProofSubmission = {
  id: SubmissionId;
  completionId: CompletionId;
  userId: UserId;
  taskId: TaskId;
  details: string;
  submittedAt: string;
  file: ProofFile | null;
  videoUrl: string | null;
};

/** Status only. Manual approve/reject goes through admin review actions. */
export type VerificationStatus =
  | "none"
  | "submitted"
  | "verified"
  | "rejected";

export type VerificationRecord = {
  submissionId: SubmissionId;
  status: VerificationStatus;
  rejectionReason: string | null;
  updatedAt: string;
};

/**
 * ETH payout claim after proof verification.
 * `claim_requested` = user asked for payout; `paid` = admin confirmed manual send.
 * Legacy `issued` rows are treated as paid. `not_issued` is unused by the claim flow.
 */
export type RewardStatus =
  | "not_issued"
  | "claim_requested"
  | "paid"
  | "issued";

export type Reward = {
  id: RewardId;
  userId: UserId;
  taskId: TaskId;
  submissionId: SubmissionId | null;
  amountCents: number;
  ticker: string;
  ethAmount: string;
  status: RewardStatus;
  payoutWalletAddress: string | null;
  claimedAt: string | null;
  paidAt: string | null;
  txHash: string | null;
};

export type Holding = {
  id: HoldingId;
  userId: UserId;
  ticker: string;
  name: string;
  valueCents: number;
  sourceTaskId: TaskId | null;
  status: "preview" | "not_settled";
};

/** Computed view over holdings and rewards — not a stored row. */
export type PortfolioView = {
  userId: UserId | null;
  totalValueCents: number;
  totalEarnedCents: number;
  completedTaskCount: number;
};
