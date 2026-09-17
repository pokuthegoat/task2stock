import { deriveWorkStatus, workHref, workStatusLabels } from "../src/lib/data/work";
import type {
  ProofSubmission,
  Reward,
  VerificationRecord,
} from "../src/lib/domain/model";

const submission: ProofSubmission = {
  id: "sub-1",
  completionId: "cmp-1",
  userId: "user-1",
  taskId: "run-20km",
  details: "Done",
  submittedAt: "2026-09-13T00:00:00.000Z",
  file: null,
  videoUrl: null,
};

const submitted: VerificationRecord = {
  submissionId: "sub-1",
  status: "submitted",
  rejectionReason: null,
  updatedAt: "2026-09-13T00:00:00.000Z",
};

const verified: VerificationRecord = {
  ...submitted,
  status: "verified",
};

const rejected: VerificationRecord = {
  ...submitted,
  status: "rejected",
  rejectionReason: "Photo does not show distance.",
};

const claimed: Reward = {
  id: "rwd-1",
  userId: "user-1",
  taskId: "run-20km",
  submissionId: "sub-1",
  amountCents: 1500,
  ticker: "NVDA",
  ethAmount: "0.01",
  status: "claim_requested",
  payoutWalletAddress: "0x65b4aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1e39aa",
  claimedAt: "2026-09-17T00:00:00.000Z",
  paidAt: null,
  txHash: null,
};

const paid: Reward = {
  ...claimed,
  status: "paid",
  paidAt: "2026-09-17T12:00:00.000Z",
  txHash: "0xabc",
};

function expectStatus(
  label: string,
  actual: ReturnType<typeof deriveWorkStatus>,
  expected: ReturnType<typeof deriveWorkStatus>,
) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function main() {
  expectStatus(
    "attempt only",
    deriveWorkStatus({
      submission: null,
      verification: null,
      reward: null,
    }),
    "in_progress",
  );

  expectStatus(
    "proof submitted",
    deriveWorkStatus({
      submission,
      verification: submitted,
      reward: null,
    }),
    "proof_submitted",
  );

  expectStatus(
    "verified pending claim",
    deriveWorkStatus({
      submission,
      verification: verified,
      reward: null,
    }),
    "verified",
  );

  expectStatus(
    "rejected proof",
    deriveWorkStatus({
      submission,
      verification: rejected,
      reward: null,
    }),
    "rejected",
  );

  expectStatus(
    "claim requested",
    deriveWorkStatus({
      submission,
      verification: verified,
      reward: claimed,
    }),
    "claim_requested",
  );

  expectStatus(
    "reward paid",
    deriveWorkStatus({
      submission,
      verification: verified,
      reward: paid,
    }),
    "reward_paid",
  );

  if (workHref("run-20km") !== "/tasks/run-20km/submit") {
    throw new Error("In progress must link to the submit page.");
  }

  if (
    workStatusLabels.in_progress !== "In progress" ||
    workStatusLabels.proof_submitted !== "Awaiting review" ||
    workStatusLabels.verified !== "Reward approved" ||
    workStatusLabels.rejected !== "Proof rejected" ||
    workStatusLabels.claim_requested !== "Claim requested" ||
    workStatusLabels.reward_paid !== "Reward paid"
  ) {
    throw new Error("Unexpected work status labels.");
  }

  console.log("validate-work: ok");
}

main();
