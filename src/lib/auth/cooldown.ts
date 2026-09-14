export const PROFILE_PATH = "/profile";
export const PROFILE_SETUP_PATH = "/profile/setup";
export const PROFILE_COOLDOWN_DAYS = 14;
export const PROFILE_COOLDOWN_MS = PROFILE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export type CooldownView = {
  availableNow: boolean;
  daysRemaining: number;
  label: string;
};

export function cooldownView(
  lastChangedAt: Date | null,
  noun: string,
  now = Date.now(),
): CooldownView {
  if (!lastChangedAt) {
    return {
      availableNow: true,
      daysRemaining: 0,
      label: `${noun} can be changed now.`,
    };
  }

  const availableAt = lastChangedAt.getTime() + PROFILE_COOLDOWN_MS;
  const remainingMs = availableAt - now;

  if (remainingMs <= 0) {
    return {
      availableNow: true,
      daysRemaining: 0,
      label: `${noun} can be changed now.`,
    };
  }

  const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
  const unit = daysRemaining === 1 ? "day" : "days";

  return {
    availableNow: false,
    daysRemaining,
    label: `${noun} can be changed again in ${daysRemaining} ${unit}.`,
  };
}

export function cooldownBlockedMessage(view: CooldownView) {
  return view.label;
}
