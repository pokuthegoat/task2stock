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
  | "reward_issued";

export const workStatusLabels: Record<WorkStatus, string> = {
  in_progress: "In progress",
  proof_submitted: "Payout pending",
  verified: "Verified",
  reward_issued: "Reward issued",
};

export function deriveWorkStatus(progress: {
  submission: ProofSubmission | null;
  verification: VerificationRecord | null;
  reward: Reward | null;
}): WorkStatus {
  if (progress.reward?.status === "issued") {
    return "reward_issued";
  }

  if (progress.verification?.status === "verified") {
    return "verified";
  }

  if (progress.submission) {
    return "proof_submitted";
  }

  return "in_progress";
}

export function workHref(taskId: TaskId, status: WorkStatus): string {
  return status === "in_progress"
    ? `/tasks/${taskId}/run`
    : `/tasks/${taskId}/submit`;
}

export function workActionLabel(status: WorkStatus): string {
  return status === "in_progress" ? "Continue" : "View submission";
}
