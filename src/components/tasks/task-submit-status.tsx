import { Button } from "@/components/ui/button";
import { formatRewardOffer, formatUsdCompact } from "@/lib/data";

export function TaskSubmitStatus({
  taskTitle,
  reward,
  submittedAt,
  details,
  videoUrl,
  file,
}: {
  taskTitle: string;
  reward: { amountCents: number; ticker: string };
  submittedAt?: string | null;
  details: string;
  videoUrl?: string | null;
  file?: { fileName: string; size: number; href: string } | null;
}) {
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="pt-2">
      <p className="max-w-lg text-sm leading-6 text-foreground/58">
        A moderator will review your proof and, if approved, your stock reward
        will be processed.
      </p>
      <dl className="mt-8 space-y-4 border-t border-white/8 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/40">Task</dt>
          <dd className="text-right text-foreground/80">{taskTitle}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/40">Reward</dt>
          <dd className="text-right font-mono text-foreground/80">
            {formatRewardOffer(reward)}
          </dd>
        </div>
        {submittedLabel ? (
          <div className="flex justify-between gap-4">
            <dt className="text-foreground/40">Submitted</dt>
            <dd className="text-right text-foreground/80">{submittedLabel}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-foreground/40">Status</dt>
          <dd className="text-right text-foreground/80">Payout pending</dd>
        </div>
      </dl>
      {details ? (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="label">What you did</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/70">
            {details}
          </p>
        </div>
      ) : null}
      {file ? (
        <div className="mt-6 border-t border-white/8 pt-5">
          <p className="label">Image proof</p>
          <a
            href={file.href}
            className="mt-3 inline-flex text-sm font-medium text-accent hover:text-foreground"
          >
            {file.fileName}
          </a>
          <p className="mt-1 text-xs text-foreground/40">
            {file.size < 1024
              ? `${file.size} B`
              : file.size < 1024 * 1024
                ? `${(file.size / 1024).toFixed(1)} KB`
                : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
          </p>
        </div>
      ) : null}
      {videoUrl ? (
        <div className="mt-6 border-t border-white/8 pt-5">
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
      <p className="mt-8 max-w-lg text-xs leading-5 text-foreground/38">
        {formatUsdCompact(reward.amountCents)} {reward.ticker} is not issued
        yet. Portfolio is unchanged.
      </p>
      <div className="mt-8">
        <Button href="/work">Back to my work</Button>
      </div>
    </div>
  );
}
