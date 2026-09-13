import type {
  Company,
  Holding,
  PortfolioView,
  ProofSubmission,
  Reward,
  RewardOffer,
  Task,
  TaskAttempt,
  TaskCompletion,
  TaskId,
  VerificationRecord,
} from "@/lib/domain/model";
import type { WorkStatus } from "@/lib/data/work";

/** Composed catalog read model: domain Task + company + line copy. */
export type TaskView = Task & {
  company: Company;
  requirement: string;
  steps: string[];
  instructions: string[];
  eligibility: string[];
};

export type TaskRewardOffer = {
  taskId: TaskId;
  offer: RewardOffer;
};

export type HomeRewardPreview = {
  taskId: TaskId;
  title: string;
  companyName: string;
  offer: RewardOffer;
};

export type HomeHoldingView = Holding & {
  allocation: number;
  fromLabel: string;
};

export type HomeActivityView = {
  taskId: TaskId | null;
  label: string;
  amountCents: number;
  ticker: string;
  when: string;
};

export type PortfolioHoldingView = Holding & {
  sourceTaskTitle: string;
};

export type ExamplePortfolioView = PortfolioView & {
  /** Fixture caption only — not live market data. */
  performanceCaption: string;
};

export type TaskEarningView = {
  reward: Reward;
  taskTitle: string;
  companyName: string;
  completedLabel: string;
  statusLabel: string;
};

export type { WorkStatus };

/** One started task for the signed-in user. Offer is the catalog RewardOffer. */
export type WorkItemView = {
  taskId: TaskId;
  title: string;
  companyName: string;
  offer: RewardOffer;
  difficulty: Task["difficulty"];
  estimate: string;
  timeBucket: Task["timeBucket"];
  status: WorkStatus;
  statusLabel: string;
  href: string;
};

/** Current participation chain for one participant + task. */
export type TaskProgress = {
  attempt: TaskAttempt | null;
  completion: TaskCompletion | null;
  submission: ProofSubmission | null;
  verification: VerificationRecord | null;
  reward: Reward | null;
};

export type TaskCategory = Task["category"];
export type TaskDifficulty = Task["difficulty"];
export type TaskTimeBucket = Task["timeBucket"];
