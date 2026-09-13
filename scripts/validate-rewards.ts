import { PrismaClient } from "@prisma/client";
import { issueReward } from "../src/lib/data/db/participation";
import { issueRewardForActor } from "../src/lib/rewards/issue";
import {
  canIssueManualReward,
  isVerificationAdmin,
} from "../src/lib/verification/decision";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "phase5@example.com" },
  });

  if (!user) {
    throw new Error("Expected the Phase 5 test user to exist.");
  }

  if (isVerificationAdmin(user.id)) {
    throw new Error("Ordinary test user must not be a reward admin.");
  }

  if (
    canIssueManualReward({
      actorUserId: user.id,
      rewardUserId: user.id,
    })
  ) {
    throw new Error("A user must not issue their own reward.");
  }

  const submitted = await prisma.proofSubmission.findFirst({
    where: {
      userId: user.id,
      taskId: "store-photos",
      verification: { status: "submitted" },
    },
  });

  if (!submitted) {
    throw new Error("Expected an unverified store-photos submission.");
  }

  try {
    await issueReward(submitted.id);
    throw new Error("Unverified submission must not produce a reward.");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("only be issued after verification")
    ) {
      throw error;
    }
  }

  const unverifiedDenied = await issueRewardForActor(user.id, submitted.id);

  if (unverifiedDenied.ok || unverifiedDenied.code !== "FORBIDDEN") {
    throw new Error("Ordinary user must not issue a reward.");
  }

  const verified = await prisma.proofSubmission.findFirst({
    where: {
      userId: user.id,
      taskId: "listening-session",
      verification: { status: "verified" },
    },
  });

  if (!verified) {
    throw new Error("Expected a verified listening-session submission.");
  }

  const asOwner = await issueRewardForActor(user.id, verified.id);
  const asStranger = await issueRewardForActor("not-an-admin", verified.id);
  const asAnonymous = await issueRewardForActor(null, verified.id);

  if (
    asOwner.ok ||
    asStranger.ok ||
    asAnonymous.ok ||
    asOwner.code !== "FORBIDDEN" ||
    asStranger.code !== "FORBIDDEN" ||
    asAnonymous.code !== "FORBIDDEN"
  ) {
    throw new Error("Ordinary actors must not issue a reward.");
  }

  const first = await issueReward(verified.id);
  const second = await issueReward(verified.id);
  const [rewardCount, holdings, offer] = await Promise.all([
    prisma.reward.count({ where: { submissionId: verified.id } }),
    prisma.holding.count(),
    prisma.rewardOffer.findUnique({ where: { taskId: "listening-session" } }),
  ]);

  if (first.id !== second.id || first.status !== "issued" || second.status !== "issued") {
    throw new Error("Issuing twice must return the same issued reward.");
  }

  if (rewardCount !== 1) {
    throw new Error("Issuing twice must not create a duplicate reward.");
  }

  if (
    first.userId !== user.id ||
    first.taskId !== "listening-session" ||
    first.submissionId !== verified.id ||
    first.amountCents !== offer?.amountCents ||
    first.ticker !== offer?.ticker
  ) {
    throw new Error("Issued reward must copy the task RewardOffer and submission.");
  }

  if (holdings !== 0) {
    throw new Error("Issuing a reward must not create a Holding.");
  }

  console.log("Reward issuance checks passed.");
  console.log({
    userId: user.id,
    unverifiedSubmissionId: submitted.id,
    verifiedSubmissionId: verified.id,
    rewardId: first.id,
    status: first.status,
    amountCents: first.amountCents,
    ticker: first.ticker,
    rewardCount,
    holdings,
    ownerDenied: asOwner.code,
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
