/**
 * Server-only task participation writes and reads.
 * Client components must not import this module.
 *
 * userId is the authenticated User.id. Anonymous cookie identity is retired.
 */

import "server-only";

import type { TaskProgress } from "@/lib/data/types";

export type { TaskProgress };

export {
  getCurrentAttempt,
  getProofSubmissionById,
  getProofSubmissionForAttempt,
  getRewardForSubmission,
  getTaskProgress,
  getVerificationForAttempt,
  claimReward,
  issueReward,
  listIssuedRewardsForUser,
  listIssuedTaskEarnings,
  listPayoutClaimsForAdmin,
  listSubmissionsForAdminReview,
  listWorkForUser,
  markAttemptComplete,
  markRewardPaid,
  saveAttemptChecklist,
  setVerificationStatus,
  startTaskAttempt,
  submitProof,
} from "@/lib/data/db/participation";
export type { ProofWriteInput } from "@/lib/data/db/participation";

export const emptyTaskProgress: TaskProgress = {
  attempt: null,
  completion: null,
  submission: null,
  verification: null,
  reward: null,
};
