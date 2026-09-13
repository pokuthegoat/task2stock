import { PrismaClient } from "@prisma/client";
import {
  getTaskProgress,
  setVerificationStatus,
  submitProof,
} from "../src/lib/data/db/participation";
import { recordManualVerificationForActor } from "../src/lib/verification/record";
import {
  canRecordManualVerification,
  isVerificationAdmin,
} from "../src/lib/verification/decision";
import { evaluateProof } from "../src/lib/verification/provider";

const prisma = new PrismaClient();

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

  if (
    canRecordManualVerification({
      actorUserId: user.id,
      submissionUserId: user.id,
    })
  ) {
    throw new Error("Submitter must not verify their own proof.");
  }

  const provider = await evaluateProof({ submissionId: "unused" });

  if (provider.ok || provider.code !== "NOT_CONNECTED") {
    throw new Error("Verification provider must stay NOT_CONNECTED.");
  }

  const created = await submitProof(user.id, "listening-session", {
    details: "Recorded a 90-second listening session for Phase 6.",
  });

  const afterSubmit = await getTaskProgress(user.id, "listening-session");

  if (afterSubmit.verification?.status !== "submitted" || !afterSubmit.submission) {
    throw new Error("Expected listening-session proof to stay submitted.");
  }

  const asOwner = await recordManualVerificationForActor(
    user.id,
    created.id,
  );
  const asStranger = await recordManualVerificationForActor(
    "not-an-admin",
    created.id,
  );
  const asAnonymous = await recordManualVerificationForActor(null, created.id);

  if (
    asOwner.ok ||
    asStranger.ok ||
    asAnonymous.ok ||
    asOwner.code !== "FORBIDDEN" ||
    asStranger.code !== "FORBIDDEN" ||
    asAnonymous.code !== "FORBIDDEN"
  ) {
    throw new Error("Ordinary actors must not record verification.");
  }

  try {
    await setVerificationStatus("does-not-exist", "verified");
    throw new Error("setVerificationStatus must not create a record from nothing.");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("No verification record")
    ) {
      throw error;
    }
  }

  const first = await setVerificationStatus(created.id, "verified");
  const second = await setVerificationStatus(created.id, "verified");

  if (first.status !== "verified" || second.status !== "verified") {
    throw new Error("Expected submitted → verified to be idempotent.");
  }

  const afterVerify = await getTaskProgress(user.id, "listening-session");
  const [rewards, holdings] = await Promise.all([
    prisma.reward.count(),
    prisma.holding.count(),
  ]);

  if (afterVerify.verification?.status !== "verified") {
    throw new Error("getTaskProgress must return verified.");
  }

  if (rewards !== 0 || holdings !== 0) {
    throw new Error("Verification must not issue a reward or holding.");
  }

  console.log("Verification DAL and access seam checks passed.");
  console.log({
    userId: user.id,
    submissionId: created.id,
    status: afterVerify.verification.status,
    rewards,
    holdings,
    provider: provider.code,
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
