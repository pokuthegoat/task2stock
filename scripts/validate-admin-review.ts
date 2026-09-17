/**
 * Local DAL check for admin approve/reject persistence.
 * Uses the Phase 5 seed user when present.
 */
import { PrismaClient } from "@prisma/client";
import {
  listSubmissionsForAdminReview,
  setVerificationStatus,
  submitProof,
} from "../src/lib/data/db/participation";
import {
  recordManualRejectionForActor,
  recordManualVerificationForActor,
} from "../src/lib/verification/record";
import { isVerificationAdmin } from "../src/lib/verification/decision";

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

  const adminId = "admin-review-test-actor";
  process.env.VERIFICATION_ADMIN_USER_IDS = adminId;

  const approveTask = "store-photos";
  const rejectTask = "listening-session";

  // Reset prior verification rows for these tasks so the script is re-runnable.
  for (const taskId of [approveTask, rejectTask]) {
    const existing = await prisma.proofSubmission.findFirst({
      where: { userId: user.id, taskId },
      include: { verification: true },
    });
    if (existing?.verification) {
      await prisma.verificationRecord.update({
        where: { submissionId: existing.id },
        data: {
          status: "submitted",
          rejectionReason: null,
          updatedAt: new Date(),
        },
      });
    }
  }

  const forApprove = await submitProof(user.id, approveTask, {
    details: "Admin review approve fixture proof.",
  });
  const forReject = await submitProof(user.id, rejectTask, {
    details: "Admin review reject fixture proof.",
  });

  const denied = await recordManualVerificationForActor(user.id, forApprove.id);
  if (denied.ok || denied.code !== "FORBIDDEN") {
    throw new Error("Non-admin must not approve.");
  }

  const approved = await recordManualVerificationForActor(adminId, forApprove.id);
  if (!approved.ok || approved.status !== "verified") {
    throw new Error("Admin approve failed.");
  }

  const approvedAgain = await recordManualVerificationForActor(
    adminId,
    forApprove.id,
  );
  if (!approvedAgain.ok || approvedAgain.status !== "verified") {
    throw new Error("Approve must be idempotent when already verified.");
  }

  const rejectApproved = await recordManualRejectionForActor(
    adminId,
    forApprove.id,
    "should fail",
  );
  if (rejectApproved.ok || rejectApproved.code !== "INVALID_STATE") {
    throw new Error("Must not reject an already approved submission.");
  }

  const rejected = await recordManualRejectionForActor(
    adminId,
    forReject.id,
    "Blurry evidence",
  );
  if (
    !rejected.ok ||
    rejected.status !== "rejected" ||
    rejected.rejectionReason !== "Blurry evidence"
  ) {
    throw new Error("Admin reject failed.");
  }

  const persistedApprove = await prisma.verificationRecord.findUniqueOrThrow({
    where: { submissionId: forApprove.id },
  });
  const persistedReject = await prisma.verificationRecord.findUniqueOrThrow({
    where: { submissionId: forReject.id },
  });

  if (persistedApprove.status !== "verified") {
    throw new Error("Approved status did not persist.");
  }
  if (
    persistedReject.status !== "rejected" ||
    persistedReject.rejectionReason !== "Blurry evidence"
  ) {
    throw new Error("Rejected status/reason did not persist.");
  }

  // Direct DAL: cannot approve a rejected row.
  try {
    await setVerificationStatus(forReject.id, "verified");
    throw new Error("Must not approve a rejected submission.");
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !error.message.includes("Cannot set verified")
    ) {
      throw error;
    }
  }

  const queue = await listSubmissionsForAdminReview();
  const approveRow = queue.find((row) => row.submissionId === forApprove.id);
  const rejectRow = queue.find((row) => row.submissionId === forReject.id);

  if (!approveRow || approveRow.status !== "verified") {
    throw new Error("Admin queue missing approved row.");
  }
  if (
    !rejectRow ||
    rejectRow.status !== "rejected" ||
    rejectRow.rejectionReason !== "Blurry evidence"
  ) {
    throw new Error("Admin queue missing rejected row.");
  }

  const pendingFirst = queue.findIndex((row) => row.status === "submitted");
  const decidedFirst = queue.findIndex(
    (row) => row.status === "verified" || row.status === "rejected",
  );
  if (pendingFirst !== -1 && decidedFirst !== -1 && pendingFirst > decidedFirst) {
    throw new Error("Pending submissions must sort before decided ones.");
  }

  console.log("validate-admin-review: ok");
  console.log({
    approvedSubmissionId: forApprove.id,
    rejectedSubmissionId: forReject.id,
    queueSize: queue.length,
  });

  // Leave rows pending so other validation scripts remain re-runnable.
  await prisma.verificationRecord.update({
    where: { submissionId: forApprove.id },
    data: { status: "submitted", rejectionReason: null, updatedAt: new Date() },
  });
  await prisma.verificationRecord.update({
    where: { submissionId: forReject.id },
    data: { status: "submitted", rejectionReason: null, updatedAt: new Date() },
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
