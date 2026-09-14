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
  updatedAt: "2026-09-13T00:00:00.000Z",
};

const verified: VerificationRecord = {
  ...submitted,
  status: "verified",
};

const issued: Reward = {
  id: "rwd-1",
  userId: "user-1",
  taskId: "run-20km",
  submissionId: "sub-1",
  amountCents: 1500,
  ticker: "NVDA",
  status: "issued",
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
    "verified pending reward",
    deriveWorkStatus({
      submission,
      verification: verified,
      reward: null,
    }),
    "verified",
  );

  expectStatus(
    "reward issued",
    deriveWorkStatus({
      submission,
      verification: verified,
      reward: issued,
    }),
    "reward_issued",
  );

  if (workHref("run-20km") !== "/tasks/run-20km/submit") {
    throw new Error("In progress must link to the submit page.");
  }

  for (const status of ["proof_submitted", "verified", "reward_issued"] as const) {
    if (workHref("run-20km") !== "/tasks/run-20km/submit") {
      throw new Error(`${status} must link to the submit page.`);
    }
  }

  if (
    workStatusLabels.in_progress !== "In progress" ||
    workStatusLabels.proof_submitted !== "Payout pending" ||
    workStatusLabels.verified !== "Verified" ||
    workStatusLabels.reward_issued !== "Reward issued"
  ) {
    throw new Error("Unexpected work status labels.");
  }

  console.log("validate-work: ok");
}

main();
