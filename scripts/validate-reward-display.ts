import { PrismaClient } from "@prisma/client";
import {
  getTaskProgress,
  issueReward,
  listIssuedRewardsForUser,
  listIssuedTaskEarnings,
  setVerificationStatus,
} from "../src/lib/data/db/participation";
import { isRewardPaidStatus } from "../src/lib/data/work";

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
    isRewardPaidStatus(submitted.reward?.status)
  ) {
    throw new Error("product-video must stay submitted with no paid reward.");
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
    isRewardPaidStatus(verified.reward?.status)
  ) {
    throw new Error("store-photos must be verified without a paid reward.");
  }

  const listening = await getTaskProgress(user.id, "listening-session");
  if (!listening.submission?.id) {
    throw new Error("Expected listening-session submission.");
  }

  await setVerificationStatus(listening.submission.id, "verified");
  const first = await issueReward(listening.submission.id);
  const second = await issueReward(listening.submission.id);
  const issued = await getTaskProgress(user.id, "listening-session");
  const earnings = await listIssuedTaskEarnings(user.id);
  const none = await listIssuedRewardsForUser("no-such-user");
  const [rewardCount, holdings] = await Promise.all([
    prisma.reward.count({
      where: { userId: user.id, status: { in: ["paid", "issued"] } },
    }),
    prisma.holding.count(),
  ]);

  if (
    issued.verification?.status !== "verified" ||
    !isRewardPaidStatus(issued.reward?.status) ||
    issued.reward?.amountCents !== 1800 ||
    issued.reward?.ticker !== "AAPL"
  ) {
    throw new Error("listening-session must show the paid $18 AAPL reward.");
  }

  if (first.id !== second.id || earnings.length < 1) {
    throw new Error("Issuing twice must not duplicate reward history.");
  }

  const listeningEarning = earnings.find(
    (item) => item.reward.taskId === "listening-session",
  );

  if (
    listeningEarning?.reward.amountCents !== 1800 ||
    listeningEarning?.reward.ticker !== "AAPL" ||
    listeningEarning?.statusLabel !== "Reward paid"
  ) {
    throw new Error("Paid earnings must use the persisted Reward record.");
  }

  if (none.length !== 0 || rewardCount < 1 || holdings !== 0) {
    throw new Error("Empty users stay empty, and no Holding may be created.");
  }

  console.log("Reward display checks passed.");
  console.log({
    submitted: submitted.verification?.status,
    verifiedPending: verified.verification?.status,
    issuedStatus: issued.reward?.status,
    issuedAmount: issued.reward?.amountCents,
    issuedTicker: issued.reward?.ticker,
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
