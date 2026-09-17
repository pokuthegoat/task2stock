"use client";

import Link from "next/link";
import { useState } from "react";
import { submitProofAction } from "@/app/actions/task-progress";
import { TaskProgressRail } from "@/components/tasks/task-progress-rail";
import { TaskSubmitForm } from "@/components/tasks/task-submit-form";
import { TaskSubmitStatus } from "@/components/tasks/task-submit-status";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, workStatusLabels, type TaskView, type WorkStatus } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";
import {
  getProofInputError,
  validateVideoProofUrl,
} from "@/lib/proof/input";
import { isAllowedProofFileName, PROOF_MAX_BYTES } from "@/lib/proof/types";
import { uploadProofBlob } from "@/lib/storage/client-upload";
import { formatEthReward } from "@/lib/rewards/eth";

export function TaskSubmit({
  task,
  initialDetails,
  initialVideoUrl,
  initialFile,
  submittedAt,
  submitted: initialSubmitted,
  reviewStatus,
  rejectionReason,
  submissionId,
  ethAmount,
  payoutWalletAddress,
  txHash,
}: {
  task: TaskView;
  initialDetails: string;
  initialVideoUrl: string;
  initialFile?: { fileName: string; size: number; href: string } | null;
  submittedAt?: string | null;
  submitted: boolean;
  reviewStatus: WorkStatus;
  rejectionReason?: string | null;
  submissionId?: string | null;
  ethAmount: string;
  payoutWalletAddress?: string | null;
  txHash?: string | null;
}) {
  const { user } = useAuth();
  const [details, setDetails] = useState(initialDetails);
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState(initialFile ?? null);
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState(submittedAt ?? null);

  async function submit() {
    if (pending || submitted) return;

    const videoError = validateVideoProofUrl(videoUrl);
    if (videoError) {
      setError(videoError);
      return;
    }

    const inputError = getProofInputError({
      details,
      hasFile: Boolean(file),
      hasVideoUrl: Boolean(videoUrl.trim()),
    });

    if (inputError) {
      setError(inputError);
      return;
    }

    if (file && file.size > PROOF_MAX_BYTES) {
      setError("Images must be 10 MB or smaller.");
      return;
    }

    if (file && !isAllowedProofFileName(file.name)) {
      setError("Use a PNG, JPEG, or WEBP image.");
      return;
    }

    setError(undefined);
    setPending(true);

    try {
      const data = new FormData();
      data.set("taskId", task.id);
      data.set("details", details);
      data.set("videoUrl", videoUrl.trim());

      if (file && user?.id) {
        try {
          const blob = await uploadProofBlob(user.id, file);
          data.set("blobUrl", blob.url);
          data.set("fileName", file.name);
        } catch {
          data.set("file", file);
        }
      } else if (file) {
        data.set("file", file);
      }

      const result = await submitProofAction(data);

      if (!result.ok) {
        if ("code" in result && result.code === "UNAUTHENTICATED") {
          setError("Sign in to submit proof.");
          return;
        }

        if ("code" in result && result.code === "ALREADY_SUBMITTED") {
          setSubmitted(true);
          setSavedAt(savedAt ?? new Date().toISOString());
          return;
        }

        setError(result.error);
        return;
      }

      setSubmitted(true);
      setSavedAt(new Date().toISOString());
      if (file) {
        setExistingFile({
          fileName: file.name,
          size: file.size,
          href: `/api/proofs/${result.submissionId}`,
        });
        setFile(null);
      }
    } catch {
      setError("Unable to save your proof. Try again.");
    } finally {
      setPending(false);
    }
  }

  const statusLabel = submitted
    ? workStatusLabels[reviewStatus]
    : "Not submitted";
  const headline = submitted ? statusLabel : "Submit proof";
  const lead = submitted
    ? reviewStatus === "verified"
      ? "Your proof was approved."
      : reviewStatus === "rejected"
        ? "Your proof was rejected."
        : "Your submission has been sent for review."
    : task.requirement;

  return (
    <PageContainer className="pb-24 pt-10 md:pb-32 md:pt-14">
      <Link
        href={`/tasks/${task.id}`}
        className="glass-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground hover:brightness-110"
      >
        <span aria-hidden="true">←</span>
        Back to task
      </Link>

      <div className="mt-6">
        <TaskProgressRail current={submitted ? 2 : 1} />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="glass-panel p-7 md:p-10">
          <p className="label">{task.company.name}</p>

          <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">
            {headline}
          </h1>

          <p className="mt-5 font-mono text-lg tracking-tight text-accent">
            {formatRewardOffer(task.reward)}
          </p>

          <p className="mt-6 max-w-xl text-lg font-normal leading-8 text-foreground/72">
            {lead}
          </p>

          <hr className="hairline my-9" />

          {submitted && submissionId ? (
            <div>
              <TaskSubmitStatus
                taskTitle={task.title}
                reward={task.reward}
                ethAmount={ethAmount}
                submittedAt={savedAt}
                details={details.trim()}
                videoUrl={videoUrl.trim() || null}
                file={existingFile}
                reviewStatus={reviewStatus}
                rejectionReason={rejectionReason}
                submissionId={submissionId}
                payoutWalletAddress={payoutWalletAddress}
                txHash={txHash}
              />
            </div>
          ) : (
            <section>
              <TaskSubmitForm
                details={details}
                videoUrl={videoUrl}
                error={error}
                pending={pending}
                selectedFile={file}
                onDetailsChange={(value) => {
                  setDetails(value);
                  if (error) setError(undefined);
                }}
                onVideoUrlChange={(value) => {
                  setVideoUrl(value);
                  if (error) setError(undefined);
                }}
                onFileChange={(next) => {
                  if (next && next.size > PROOF_MAX_BYTES) {
                    setError("Images must be 10 MB or smaller.");
                    return;
                  }
                  if (next && !isAllowedProofFileName(next.name)) {
                    setError("Use a PNG, JPEG, or WEBP image.");
                    return;
                  }
                  setFile(next);
                  if (error) setError(undefined);
                }}
                onSubmit={submit}
              />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="glass-panel p-7">
            <div className="text-center">
              <p className="label">Reward</p>
              <p className="stat-value mt-3 text-4xl text-foreground">
                {formatUsdCompact(task.reward.amountCents)}
              </p>
              <p className="mt-2 font-mono text-sm text-accent">
                {task.reward.ticker}
              </p>
            </div>

            <hr className="hairline my-7" />

            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Task</dt>
                <dd className="text-right font-medium text-foreground/88">
                  {task.title}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Status</dt>
                <dd className="text-right font-medium text-foreground/88">
                  {statusLabel}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Reward</dt>
                <dd className="text-right font-medium text-foreground/88">
                  {reviewStatus === "reward_paid"
                    ? "Paid"
                    : reviewStatus === "claim_requested"
                      ? "Claim requested"
                      : formatEthReward(ethAmount)}
                </dd>
              </div>
            </dl>
            <p className="mt-7 text-center text-xs leading-5 text-foreground/55">
              {reviewStatus === "rejected"
                ? "Rejected proofs cannot be claimed."
                : reviewStatus === "reward_paid"
                  ? "This reward has been paid."
                  : "ETH payouts are sent manually after you claim."}
            </p>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
