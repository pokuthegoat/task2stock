/**
 * Trusted operator authorization rules.
 * No session I/O here — access.ts reads the session and calls these.
 *
 * VERIFICATION_ADMIN_USER_IDS is a temporary allow-list, not a User role.
 * It gates both manual verification and reward issuance.
 * Replace isVerificationAdmin() when a real admin role exists.
 * A user can never act on their own submission or reward.
 */

export function canActAsTrustedOperator(input: {
  actorUserId: string;
  subjectUserId: string;
}): boolean {
  if (input.actorUserId === input.subjectUserId) {
    return false;
  }

  return isVerificationAdmin(input.actorUserId);
}

export function listVerificationAdminUserIds(): string[] {
  return (process.env.VERIFICATION_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function isVerificationAdmin(userId: string): boolean {
  return listVerificationAdminUserIds().includes(userId);
}

export function canRecordManualVerification(input: {
  actorUserId: string;
  submissionUserId: string;
}): boolean {
  return canActAsTrustedOperator({
    actorUserId: input.actorUserId,
    subjectUserId: input.submissionUserId,
  });
}

export function canIssueManualReward(input: {
  actorUserId: string;
  rewardUserId: string;
}): boolean {
  return canActAsTrustedOperator({
    actorUserId: input.actorUserId,
    subjectUserId: input.rewardUserId,
  });
}
