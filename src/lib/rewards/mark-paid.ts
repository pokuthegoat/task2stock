import "server-only";

import {
  getPrisma,
} from "@/lib/data/db/client";
import { markRewardPaid } from "@/lib/data/participation";
import { canIssueManualReward } from "@/lib/verification/decision";
import { toReward } from "@/lib/data/db/mappers";

export async function markRewardPaidForActor(
  actorUserId: string | null,
  rewardId: string,
  txHash?: string | null,
) {
  if (!actorUserId) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to mark a reward as paid.",
    };
  }

  const row = await getPrisma().reward.findUnique({
    where: { id: rewardId },
  });

  if (!row) {
    return {
      ok: false as const,
      code: "NOT_FOUND" as const,
      error: "Reward claim not found.",
    };
  }

  const reward = toReward(row);

  if (
    !canIssueManualReward({
      actorUserId,
      rewardUserId: reward.userId,
    })
  ) {
    return {
      ok: false as const,
      code: "FORBIDDEN" as const,
      error: "Not allowed to mark a reward as paid.",
    };
  }

  try {
    const updated = await markRewardPaid({ rewardId, txHash });
    return {
      ok: true as const,
      rewardId: updated.id,
      status: updated.status,
      taskId: updated.taskId,
    };
  } catch (error) {
    return {
      ok: false as const,
      code: "INVALID_STATE" as const,
      error:
        error instanceof Error
          ? error.message
          : "Claim is not payable.",
    };
  }
}
