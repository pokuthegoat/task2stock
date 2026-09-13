import { PrismaClient } from "@prisma/client";
import {
  getTaskProgress,
  issueReward,
  listIssuedRewardsForUser,
  listIssuedTaskEarnings,
  setVerificationStatus,
} from "../src/lib/data/db/participation";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "phase5@example.com" },
  });

  if (!user) {
    throw new Error("Expected the Phase 5 test user to exist.");
  }

  const submitted = await getTaskProgress(user.id, "product-video");

  if (
    submitted.verification?.status !== "submitted" ||
    submitted.reward?.status === "issued"
  ) {
    throw new Error("product-video must stay submitted with no issued reward.");
  }

  const storePhotos = await prisma.proofSubmission.findFirst({
    where: { userId: user.id, taskId: "store-photos" },
  });

  if (!storePhotos) {
    throw new Error("Expected a store-photos submission.");
  }

  await setVerificationStatus(storePhotos.id, "verified");

  const verified = await getTaskProgress(user.id, "store-photos");

  if (
    verified.verification?.status !== "verified" ||
    verified.reward?.status === "issued"
  ) {
    throw new Error("store-photos must be verified without an issued reward.");
  }

  const issued = await getTaskProgress(user.id, "listening-session");
  const first = await issueReward(issued.submission?.id ?? "");
  const second = await issueReward(issued.submission?.id ?? "");
  const earnings = await listIssuedTaskEarnings(user.id);
  const none = await listIssuedRewardsForUser("no-such-user");
  const [rewardCount, holdings] = await Promise.all([
    prisma.reward.count({
      where: { userId: user.id, status: "issued" },
    }),
    prisma.holding.count(),
  ]);

  if (
    issued.verification?.status !== "verified" ||
    issued.reward?.status !== "issued" ||
    issued.reward.amountCents !== 1800 ||
    issued.reward.ticker !== "AAPL"
  ) {
    throw new Error("listening-session must show the issued $18 AAPL reward.");
  }

  if (first.id !== second.id || earnings.length !== 1) {
    throw new Error("Issuing twice must not duplicate reward history.");
  }

  if (
    earnings[0]?.reward.amountCents !== 1800 ||
    earnings[0]?.reward.ticker !== "AAPL" ||
    earnings[0]?.statusLabel !== "Issued"
  ) {
    throw new Error("Issued earnings must use the persisted Reward record.");
  }

  if (none.length !== 0 || rewardCount !== 1 || holdings !== 0) {
    throw new Error("Empty users stay empty, and no Holding may be created.");
  }

  console.log("Reward display checks passed.");
  console.log({
    submitted: submitted.verification?.status,
    verifiedPending: verified.verification?.status,
    issuedStatus: issued.reward.status,
    issuedAmount: issued.reward.amountCents,
    issuedTicker: issued.reward.ticker,
    earnings: earnings.length,
    rewards: rewardCount,
    holdings,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
