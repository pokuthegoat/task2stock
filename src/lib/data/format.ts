import type { Holding, RewardOffer } from "@/lib/domain/model";

/** Whole dollars as `$15`; otherwise two decimals. Matches current task-offer copy. */
export function formatUsdCompact(amountCents: number): string {
  if (amountCents % 100 === 0) {
    return `$${amountCents / 100}`;
  }

  return formatUsd(amountCents);
}

/** Always two decimals: `$85.00`. Matches current holding / portfolio copy. */
export function formatUsd(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}

export function formatRewardOffer(offer: RewardOffer): string {
  return `${formatUsdCompact(offer.amountCents)} ${offer.ticker}`;
}

export function formatHoldingStatus(status: Holding["status"]): string {
  if (status === "not_settled") {
    return "Not settled";
  }

  return "Preview";
}
