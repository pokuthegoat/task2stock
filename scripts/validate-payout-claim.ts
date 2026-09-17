/**
 * Local DAL check for claim → admin mark-paid persistence.
 */
import { PrismaClient } from "@prisma/client";
import {
  claimReward,
  listPayoutClaimsForAdmin,
  markRewardPaid,
  setVerificationStatus,
  submitProof,
} from "../src/lib/data/db/participation";
import { claimRewardForUser } from "../src/lib/rewards/claim";
import { markRewardPaidForActor } from "../src/lib/rewards/mark-paid";
import { isVerificationAdmin } from "../src/lib/verification/decision";

const prisma = new PrismaClient();
const WALLET = "0x65b4aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1e39aa";

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "phase5@example.com" },
  });

  if (!user) {
    throw new Error("Expected the Phase 5 test user to exist.");
  }

  if (isVerificationAdmin(user.id)) {
    throw new Error("Ordinary test user must not be a verification admin.");
  }

  const adminId = "admin-payout-test-actor";
  process.env.VERIFICATION_ADMIN_USER_IDS = adminId;

  const taskId = "store-photos";
  const submission = await submitProof(user.id, taskId, {
    details: "Payout claim fixture proof.",
  });

  await prisma.verificationRecord.update({
    where: { submissionId: submission.id },
    data: { status: "submitted", rejectionReason: null, updatedAt: new Date() },
  });

  await prisma.reward.deleteMany({ where: { submissionId: submission.id } });

  const rejectedClaim = await claimRewardForUser(user.id, submission.id, WALLET);
  if (rejectedClaim.ok) {
    throw new Error("Must not claim before approval.");
  }

  await setVerificationStatus(submission.id, "verified");

  const badWallet = await claimRewardForUser(user.id, submission.id, "not-a-wallet");
  if (badWallet.ok || badWallet.code !== "INVALID_WALLET") {
    throw new Error("Invalid wallet must be rejected.");
  }

  const first = await claimRewardForUser(user.id, submission.id, WALLET);
  if (!first.ok || first.status !== "claim_requested") {
    throw new Error("Claim failed.");
  }

  const second = await claimRewardForUser(user.id, submission.id, WALLET);
  if (!second.ok || second.rewardId !== first.rewardId) {
    throw new Error("Duplicate claim must return the same reward.");
  }

  const otherUser = await claimRewardForUser("someone-else", submission.id, WALLET);
  if (otherUser.ok || otherUser.code !== "FORBIDDEN") {
    throw new Error("Other users must not claim.");
  }

  const selfPay = await markRewardPaidForActor(user.id, first.rewardId, null);
  if (selfPay.ok || selfPay.code !== "FORBIDDEN") {
    throw new Error("Users must not mark their own reward paid.");
  }

  const paid = await markRewardPaidForActor(adminId, first.rewardId, "0xdeadbeef");
  if (!paid.ok || (paid.status !== "paid" && paid.status !== "issued")) {
    throw new Error("Admin mark paid failed.");
  }

  const paidAgain = await markRewardPaidForActor(adminId, first.rewardId, "0xother");
  if (!paidAgain.ok) {
    throw new Error("Mark paid must be idempotent.");
  }

  const reclaim = await claimRewardForUser(user.id, submission.id, WALLET);
  if (reclaim.ok) {
    throw new Error("Must not claim after paid.");
  }

  const row = await prisma.reward.findUniqueOrThrow({
    where: { id: first.rewardId },
  });

  if (
    row.status !== "paid" ||
    row.payoutWalletAddress !== WALLET ||
    row.txHash !== "0xdeadbeef"
  ) {
    throw new Error("Paid reward did not persist correctly.");
  }

  // Fresh claim on another task for queue listing.
  const rejectTask = "listening-session";
  const other = await submitProof(user.id, rejectTask, {
    details: "Second payout fixture.",
  });
  await prisma.verificationRecord.update({
    where: { submissionId: other.id },
    data: { status: "verified", rejectionReason: null, updatedAt: new Date() },
  });
  await prisma.reward.deleteMany({ where: { submissionId: other.id } });
  await claimReward({
    userId: user.id,
    submissionId: other.id,
    payoutWalletAddress: WALLET,
  });

  const queue = await listPayoutClaimsForAdmin();
  const pending = queue.find((item) => item.submissionId === other.id);
  const completed = queue.find((item) => item.submissionId === submission.id);

  if (!pending || pending.status !== "claim_requested") {
    throw new Error("Queue missing pending claim.");
  }
  if (!completed || completed.status !== "paid") {
    throw new Error("Queue missing paid claim.");
  }

  // Cleanup pending claim so other scripts stay re-runnable.
  await markRewardPaid({ rewardId: pending.rewardId, txHash: null });
  await prisma.reward.deleteMany({
    where: { submissionId: { in: [submission.id, other.id] } },
  });
  await prisma.verificationRecord.updateMany({
    where: { submissionId: { in: [submission.id, other.id] } },
    data: { status: "submitted", rejectionReason: null, updatedAt: new Date() },
  });

  console.log("validate-payout-claim: ok");
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
