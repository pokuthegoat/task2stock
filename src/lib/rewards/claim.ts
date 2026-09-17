import "server-only";

import {
  claimReward,
  getProofSubmissionById,
  getRewardForSubmission,
} from "@/lib/data/participation";
import type { SubmissionId } from "@/lib/domain/model";
import { isValidEvmAddress, normalizeEvmAddress } from "@/lib/rewards/eth";

export async function claimRewardForUser(
  userId: string | null,
  submissionId: SubmissionId,
  payoutWalletAddress: string,
) {
  if (!userId) {
    return {
      ok: false as const,
      code: "UNAUTHORIZED" as const,
      error: "Sign in to claim a reward.",
    };
  }

  const wallet = normalizeEvmAddress(payoutWalletAddress);
  if (!isValidEvmAddress(wallet)) {
    return {
      ok: false as const,
      code: "INVALID_WALLET" as const,
      error: "Enter a valid EVM payout wallet address (0x…).",
    };
  }

  const submission = await getProofSubmissionById(submissionId);
  if (!submission) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      error: "Proof submission not found.",
    };
  }

  if (submission.userId !== userId) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "You can only claim rewards for your own submissions.",
    };
  }

  const existing = await getRewardForSubmission(submissionId);
  if (existing?.status === "claim_requested") {
    return {
      ok: true as const,
      rewardId: existing.id,
      status: existing.status,
      taskId: submission.taskId,
      alreadyClaimed: true as const,
    };
  }

  if (existing?.status === "paid" || existing?.status === "issued") {
    return {
      ok: false as const,
      code: "ALREADY_PAID" as const,
      error: "This reward has already been paid.",
    };
  }

  try {
    const reward = await claimReward({
      userId,
      submissionId,
      payoutWalletAddress: wallet,
    });

    return {
      ok: true as const,
      rewardId: reward.id,
      status: reward.status,
      taskId: submission.taskId,
      alreadyClaimed: false as const,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not claim reward.";

    if (message.includes("must be approved")) {
      return {
        ok: false as const,
        code: "NOT_ELIGIBLE" as const,
        error: message,
      };
    }

    return {
      ok: false as const,
      code: "INVALID_STATE" as const,
      error: message,
    };
  }
}
