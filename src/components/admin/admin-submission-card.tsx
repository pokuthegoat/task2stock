"use client";

import { useState, useTransition } from "react";
import {
  recordManualRejectionAction,
  recordManualVerificationAction,
} from "@/app/actions/verification";
import { Button } from "@/components/ui/button";
import type { AdminSubmissionView } from "@/lib/data";
import { formatRewardOffer } from "@/lib/data";

const statusLabels = {
  submitted: "PENDING",
  verified: "APPROVED",
  rejected: "REJECTED",
} as const;

function formatSubmittedAt(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminSubmissionCard({ item }: { item: AdminSubmissionView }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const reviewable = item.status === "submitted";

  function approve() {
    setError(null);
    startTransition(async () => {
      const result = await recordManualVerificationAction(item.submissionId);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const result = await recordManualRejectionAction(
        item.submissionId,
        reason.trim() || null,
      );
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <article className="glass-tile p-6 md:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            {formatRewardOffer({
              amountCents: item.rewardAmountCents,
              ticker: item.rewardTicker,
            })}
          </p>
          <p className="mt-2 text-xs text-foreground/45">
            Submitted {formatSubmittedAt(item.submittedAt)}
          </p>
        </div>

        <div className="shrink-0">
          <span
            className={`glass-chip inline-flex px-3 py-1 text-[11px] font-medium tracking-[0.04em] ${
              item.status === "verified"
                ? "border-positive/35 text-positive"
                : item.status === "rejected"
                  ? "border-[#c9a9a2]/45 text-[#d4b4ae]"
                  : "border-white/16 text-foreground/85"
            }`}
          >
            Status: {statusLabels[item.status]}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="label">Proof</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/72">
            {item.details.trim() || "—"}
          </p>
        </div>

        {item.file ? (
          <div>
            <p className="label">Evidence</p>
            <a
              href={item.file.href}
              className="mt-2 inline-flex text-sm font-medium text-accent hover:text-foreground"
            >
              {item.file.fileName}
            </a>
            <p className="mt-1 text-xs text-foreground/42">
              {item.file.contentType} · {formatFileSize(item.file.size)}
            </p>
          </div>
        ) : null}

        {item.videoUrl ? (
          <div>
            <p className="label">Video</p>
            <a
              href={item.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex break-all text-sm font-medium text-accent hover:text-foreground"
            >
              {item.videoUrl}
            </a>
          </div>
        ) : null}

        {item.userWalletAddress ? (
          <div>
            <p className="label">Payout wallet</p>
            <p className="mt-2 break-all font-mono text-xs text-foreground/70">
              {item.userWalletAddress}
            </p>
          </div>
        ) : null}

        {item.status === "rejected" && item.rejectionReason ? (
          <div>
            <p className="label">Reason</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#d4b4ae]">
              {item.rejectionReason}
            </p>
          </div>
        ) : null}
      </div>

      {reviewable ? (
        <div className="mt-6 border-t border-white/8 pt-5">
          <label className="label" htmlFor={`reject-reason-${item.submissionId}`}>
            Rejection reason (optional)
          </label>
          <textarea
            id={`reject-reason-${item.submissionId}`}
            rows={3}
            value={reason}
            disabled={pending}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is this proof being rejected?"
            className="field-textarea mt-2"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={approve}
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={reject}
            >
              Reject
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
