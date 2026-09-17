import type {
  ProofSubmission,
  Reward,
  TaskId,
  VerificationRecord,
} from "@/lib/domain/model";

/** User-facing My Work states. Derived from persisted records only. */
export type WorkStatus =
  | "in_progress"
  | "proof_submitted"
  | "verified"
  | "rejected"
  | "claim_requested"
  | "reward_paid";

export const workStatusLabels: Record<WorkStatus, string> = {
  in_progress: "In progress",
  proof_submitted: "Awaiting review",
  verified: "Reward approved",
  rejected: "Proof rejected",
  claim_requested: "Claim requested",
  reward_paid: "Reward paid",
};

export function isRewardPaidStatus(status: Reward["status"] | undefined) {
  return status === "paid" || status === "issued";
}

export function deriveWorkStatus(progress: {
  submission: ProofSubmission | null;
  verification: VerificationRecord | null;
  reward: Reward | null;
}): WorkStatus {
  if (isRewardPaidStatus(progress.reward?.status)) {
    return "reward_paid";
  }

  if (progress.reward?.status === "claim_requested") {
    return "claim_requested";
  }

  if (progress.verification?.status === "verified") {
    return "verified";
  }

  if (progress.verification?.status === "rejected") {
    return "rejected";
  }

  if (progress.submission) {
    return "proof_submitted";
  }

  return "in_progress";
}

export function workHref(taskId: TaskId): string {
  return `/tasks/${taskId}/submit`;
}

export function workActionLabel(status: WorkStatus): string {
  if (status === "verified") return "Claim reward";
  return status === "in_progress" ? "Submit proof" : "View submission";
}
