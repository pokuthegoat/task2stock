import { ClaimRewardForm } from "@/components/tasks/claim-reward-form";
import { Button } from "@/components/ui/button";
import { formatRewardOffer, formatUsdCompact, workStatusLabels } from "@/lib/data";
import type { WorkStatus } from "@/lib/data";
import { formatEthReward } from "@/lib/rewards/eth";

export function TaskSubmitStatus({
  taskTitle,
  reward,
  ethAmount,
  submittedAt,
  details,
  videoUrl,
  file,
  reviewStatus,
  rejectionReason,
  submissionId,
  payoutWalletAddress,
  txHash,
}: {
  taskTitle: string;
  reward: { amountCents: number; ticker: string };
  ethAmount: string;
  submittedAt?: string | null;
  details: string;
  videoUrl?: string | null;
  file?: { fileName: string; size: number; href: string } | null;
  reviewStatus: WorkStatus;
  rejectionReason?: string | null;
  submissionId: string;
  payoutWalletAddress?: string | null;
  txHash?: string | null;
}) {
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const statusLabel = workStatusLabels[reviewStatus];
  const statusCopy =
    reviewStatus === "verified"
      ? "Your proof was approved. Enter a payout wallet and claim your ETH reward."
      : reviewStatus === "claim_requested"
        ? "Claim requested. Task2Stock will pay manually from the treasury wallet."
        : reviewStatus === "reward_paid"
          ? "Reward paid. This claim is complete."
          : reviewStatus === "rejected"
            ? "Your proof was rejected. This submission cannot be claimed."
            : "Proof stays pending until review.";

  return (
    <div>
      <p className="max-w-lg text-sm leading-6 text-foreground/68">{statusCopy}</p>

      <dl className="glass-tile mt-7 space-y-4 p-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/42">Task</dt>
          <dd className="text-right text-foreground/82">{taskTitle}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/42">Catalog reward</dt>
          <dd className="text-right font-mono text-foreground/82">
            {formatRewardOffer(reward)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/42">ETH payout</dt>
          <dd className="text-right font-mono text-foreground/82">
            {formatEthReward(ethAmount)}
          </dd>
        </div>
        {submittedLabel ? (
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/42">Submitted</dt>
            <dd className="text-right text-foreground/82">{submittedLabel}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/42">Status</dt>
          <dd className="text-right text-foreground/82">{statusLabel}</dd>
        </div>
        {reviewStatus === "rejected" && rejectionReason ? (
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/42">Reason</dt>
            <dd className="max-w-[16rem] text-right text-[#d4b4ae]">
              {rejectionReason}
            </dd>
          </div>
        ) : null}
        {payoutWalletAddress ? (
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/42">Payout wallet</dt>
            <dd className="max-w-[16rem] break-all text-right font-mono text-xs text-foreground/70">
              {payoutWalletAddress}
            </dd>
          </div>
        ) : null}
        {txHash ? (
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/42">Tx hash</dt>
            <dd className="max-w-[16rem] break-all text-right font-mono text-xs text-foreground/70">
              {txHash}
            </dd>
          </div>
        ) : null}
      </dl>

      {details ? (
        <div className="glass-tile mt-3 p-6">
          <p className="label">What you did</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/72">
            {details}
          </p>
        </div>
      ) : null}

      {file ? (
        <div className="glass-tile mt-3 p-6">
          <p className="label">Image proof</p>
          <a
            href={file.href}
            className="mt-3 inline-flex text-sm font-medium text-accent hover:text-foreground"
          >
            {file.fileName}
          </a>
          <p className="mt-1 text-xs text-foreground/42">
            {file.size < 1024
              ? `${file.size} B`
              : file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
          </p>
        </div>
      ) : null}

      {videoUrl ? (
        <div className="glass-tile mt-3 p-6">
          <p className="label">Video proof</p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex break-all text-sm font-medium text-accent hover:text-foreground"
          >
            {videoUrl}
          </a>
        </div>
      ) : null}

      {reviewStatus === "verified" ? (
        <ClaimRewardForm submissionId={submissionId} ethAmount={ethAmount} />
      ) : null}

      <p className="mt-7 max-w-lg text-xs leading-5 text-foreground/40">
        {reviewStatus === "reward_paid"
          ? `${formatEthReward(ethAmount)} marked paid. Portfolio catalog figures are unchanged.`
          : reviewStatus === "claim_requested"
            ? `${formatEthReward(ethAmount)} claim is waiting on a manual treasury payout.`
            : `${formatUsdCompact(reward.amountCents)} ${reward.ticker} catalog reward · payout is ${formatEthReward(ethAmount)}.`}
      </p>
      <div className="mt-8">
        <Button href="/work" size="lg">
          Back to my work
        </Button>
      </div>
    </div>
  );
}
