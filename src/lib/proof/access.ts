import "server-only";

import { getSession } from "@/lib/auth/session";
import { getProofSubmissionById } from "@/lib/data/participation";
import { isVerificationAdmin } from "@/lib/verification/decision";

export async function canAccessProofFile(submissionId: string) {
  const session = await getSession();

  if (!session?.user.username) {
    return { ok: false as const, submission: null };
  }

  const submission = await getProofSubmissionById(submissionId);

  if (!submission?.file) {
    return { ok: false as const, submission: null };
  }

  if (
    submission.userId !== session.user.id &&
    !isVerificationAdmin(session.user.id)
  ) {
    return { ok: false as const, submission: null };
  }

  return { ok: true as const, submission };
}
