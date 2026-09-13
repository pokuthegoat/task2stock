/**
 * Prisma catalog implementation. Server-only.
 * Pages import `@/lib/data/catalog`, which selects this source when
 * DATA_SOURCE=database.
 */

export { getPrisma } from "@/lib/data/db/client";
export {
  getCurrentAttempt,
  getProofSubmissionById,
  getProofSubmissionForAttempt,
  getRewardForSubmission,
  getTaskProgress,
  getVerificationForAttempt,
  issueReward,
  listIssuedRewardsForUser,
  listIssuedTaskEarnings,
  markAttemptComplete,
  saveAttemptChecklist,
  setVerificationStatus,
  startTaskAttempt,
  submitProof,
} from "@/lib/data/db/participation";
export {
  getCompanyById,
  getRewardOfferByTaskId,
  getTaskById,
  listCompanies,
  listFeaturedTasks,
  listHoldings,
  listHomeTasks,
  listRewardOffers,
  listRewards,
  listTaskLines,
  listTaskRecords,
  listTaskTickers,
  listTasks,
} from "@/lib/data/db/catalog";
