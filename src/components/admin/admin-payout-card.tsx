"use client";

import { useState, useTransition } from "react";
import { markRewardPaidAction } from "@/app/actions/rewards";
import { Button } from "@/components/ui/button";
import type { AdminPayoutView } from "@/lib/data";
import {
  formatEthReward,
  shortenEvmAddress,
} from "@/lib/rewards/eth";

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AdminPayoutCard({ item }: { item: AdminPayoutView }) {
  const [txHash, setTxHash] = useState(item.txHash ?? "");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const payable = item.status === "claim_requested";
  const wallet = item.payoutWalletAddress;

  async function copyWallet() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy wallet address.");
    }
  }

  function markPaid() {
    setError(null);
    startTransition(async () => {
      const result = await markRewardPaidAction(item.rewardId, txHash.trim() || null);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <article className="glass-tile p-6 md:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {item.userName}
          </p>
          {item.userEmail ? (
            <p className="mt-1 text-sm text-foreground/55">{item.userEmail}</p>
          ) : null}
          <p className="mt-3 text-[15px] font-medium text-foreground/88">
            {item.taskTitle}
          </p>
          <p className="mt-1 font-mono text-sm text-accent">
            Reward: {formatEthReward(item.ethAmount)}
          </p>
          <p className="mt-2 text-xs text-foreground/45">
            Claimed {formatWhen(item.claimedAt)}
            {item.paidAt ? ` · Paid ${formatWhen(item.paidAt)}` : ""}
          </p>
        </div>
        <span
          className={`glass-chip inline-flex shrink-0 px-3 py-1 text-[11px] font-medium tracking-[0.04em] ${
            item.status === "paid"
              ? "border-accent/30 text-accent"
              : "border-white/16 text-foreground/85"
          }`}
        >
          Status: {item.status === "paid" ? "PAID" : "Claim requested"}
        </span>
      </div>

      <div className="mt-5">
        <p className="label">Payout wallet</p>
        {wallet ? (
          <>
            <p className="mt-2 break-all font-mono text-sm text-foreground/80">
              {wallet}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground/45">
              {shortenEvmAddress(wallet)}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#d4b4ae]">No payout wallet on file.</p>
        )}
      </div>

      {item.txHash ? (
        <div className="mt-4">
          <p className="label">Tx hash</p>
          <p className="mt-2 break-all font-mono text-xs text-foreground/70">
            {item.txHash}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!wallet || pending}
          onClick={() => void copyWallet()}
        >
          {copied ? "Copied" : "Copy wallet"}
        </Button>
      </div>

      {payable ? (
        <div className="mt-5 border-t border-white/8 pt-5">
          <label className="label" htmlFor={`tx-${item.rewardId}`}>
            Transaction hash (optional)
          </label>
          <input
            id={`tx-${item.rewardId}`}
            type="text"
            value={txHash}
            disabled={pending}
            spellCheck={false}
            autoComplete="off"
            placeholder="0x… after you send from MetaMask"
            onChange={(event) => setTxHash(event.target.value)}
            className="field-input mt-2 w-full font-mono text-sm"
          />
          <div className="mt-4">
            <Button type="button" size="sm" disabled={pending} onClick={markPaid}>
              Mark as paid
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-4 text-sm text-[#d4b4ae]">
          {error}
        </p>
      ) : null}
    </article>
  );
}
