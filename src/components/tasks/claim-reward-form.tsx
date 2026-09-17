"use client";

import { useState, useTransition } from "react";
import { claimRewardAction } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import { formatEthReward } from "@/lib/rewards/eth";
import type { SubmissionId } from "@/lib/domain/model";

export function ClaimRewardForm({
  submissionId,
  ethAmount,
}: {
  submissionId: SubmissionId;
  ethAmount: string;
}) {
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClaim() {
    setError(null);
    startTransition(async () => {
      const result = await claimRewardAction(submissionId, wallet);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-6 border-t border-white/8 pt-5">
      <p className="text-sm leading-6 text-foreground/68">
        Claim {formatEthReward(ethAmount)}. Enter the EVM wallet that should
        receive the manual treasury payout. This does not send ETH or open a
        wallet.
      </p>
      <label className="label mt-4 block" htmlFor={`payout-wallet-${submissionId}`}>
        Payout wallet
      </label>
      <input
        id={`payout-wallet-${submissionId}`}
        type="text"
        value={wallet}
        disabled={pending}
        spellCheck={false}
        autoComplete="off"
        placeholder="0x…"
        onChange={(event) => setWallet(event.target.value)}
        className="field-input mt-2 w-full font-mono text-sm"
      />
      <div className="mt-4">
        <Button type="button" size="md" disabled={pending} onClick={onClaim}>
          Claim reward
        </Button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[#d4b4ae]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
