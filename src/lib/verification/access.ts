import "server-only";

import { getSession } from "@/lib/auth/session";
import {
  canRecordManualVerification,
  isVerificationAdmin,
} from "@/lib/verification/decision";

export {
  canIssueManualReward,
  canRecordManualVerification,
  isVerificationAdmin,
  listVerificationAdminUserIds,
} from "@/lib/verification/decision";

export async function getManualVerificationActorId(): Promise<string | null> {
  const session = await getSession();

  if (!session?.user.id || !isVerificationAdmin(session.user.id)) {
    return null;
  }

  return session.user.id;
}
