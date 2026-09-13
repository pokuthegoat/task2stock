import "server-only";

/**
 * Automated verification adapter.
 *
 * Swap this body when a real method is connected.
 * Do not invent a pass, reviewer, or scoring engine here.
 */

export type VerificationEvaluation =
  | { ok: true }
  | { ok: false; code: "NOT_CONNECTED"; message: string };

const NOT_CONNECTED: VerificationEvaluation = {
  ok: false,
  code: "NOT_CONNECTED",
  message:
    "Automated verification is not connected. Record decisions with the manual verification action.",
};

export async function evaluateProof(_input: {
  submissionId: string;
}): Promise<VerificationEvaluation> {
  return NOT_CONNECTED;
}
