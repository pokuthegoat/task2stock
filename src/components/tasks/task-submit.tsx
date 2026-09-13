"use client";

import Link from "next/link";
import { useState } from "react";
import { submitProofAction } from "@/app/actions/task-progress";
import { TaskSubmitForm } from "@/components/tasks/task-submit-form";
import { TaskSubmitProgress } from "@/components/tasks/task-submit-progress";
import { TaskSubmitStatus } from "@/components/tasks/task-submit-status";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, type TaskView } from "@/lib/data";
import { isAllowedProofFileName, PROOF_MAX_BYTES } from "@/lib/proof/types";

export function TaskSubmit({
  task,
  initialDetails,
  initialFile,
  submitted: initialSubmitted,
  verified = false,
  issued = false,
  issuedReward = null,
}: {
  task: TaskView;
  initialDetails: string;
  initialFile?: { fileName: string; size: number; href: string } | null;
  submitted: boolean;
  verified?: boolean;
  issued?: boolean;
  issuedReward?: { amountCents: number; ticker: string } | null;
}) {
  const [details, setDetails] = useState(initialDetails);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState(initialFile ?? null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | undefined>();

  async function submit() {
    if (pending) return;

    const hasNote = Boolean(details.trim());
    const hasFile = Boolean(file) || (Boolean(existingFile) && !removeExisting);

    if (!hasNote && !hasFile) {
      setError("Add a note or attach a PNG, JPEG, WEBP, or PDF file.");
      return;
    }

    setError(undefined);
    setPending(true);
    setStatus("Saving proof…");

    try {
      const data = new FormData();
      data.set("taskId", task.id);
      data.set("details", details);
      if (file) data.set("file", file);
      if (removeExisting && !file) data.set("removeFile", "1");

      const result = await submitProofAction(data);

      if (!result.ok) {
        if ("code" in result && result.code === "UNAUTHENTICATED") {
          setError("Sign in to submit proof.");
          return;
        }

        setError(result.error);
        setStatus(undefined);
        return;
      }

      setSubmitted(true);
      setStatus("Proof submitted.");
      if (file) {
        setExistingFile({
          fileName: file.name,
          size: file.size,
          href: `/api/proofs/${result.submissionId}`,
        });
        setFile(null);
        setRemoveExisting(false);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContainer className="pb-24 pt-16 md:pb-32 md:pt-20">
      <Link
        href={`/tasks/${task.id}/run`}
        className="text-sm text-foreground/55 transition-colors hover:text-foreground"
      >
        Back to run
      </Link>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <p className="label">{task.company.name}</p>

          <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">
            {task.title}
          </h1>

          <p className="mt-5 font-mono text-lg tracking-tight text-accent">
            {formatRewardOffer(task.reward)}
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/58">
            Proof is required before a reward can be issued. Verification stays
            a manual operator step.
          </p>

          <section className="mt-12">
            <TaskSubmitProgress
              submitted={submitted}
              verified={verified}
              issued={issued}
            />
          </section>

          {submitted && verified ? (
            <div className="mt-14">
              <TaskSubmitStatus
                details={details.trim()}
                file={existingFile}
                verified={verified}
                issued={issued}
                issuedLabel={
                  issuedReward
                    ? formatRewardOffer(issuedReward)
                    : undefined
                }
              />
            </div>
          ) : (
            <section className="mt-14">
              <h2 className="heading text-3xl text-foreground">
                Submit proof
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/52">
                {task.requirement} Add a short note, attach a file, or both.
              </p>
              <div className="mt-8">
                <TaskSubmitForm
                  details={details}
                  error={error}
                  pending={pending}
                  selectedFile={file}
                  existingFileName={
                    removeExisting ? null : existingFile?.fileName
                  }
                  existingFileSize={
                    removeExisting ? null : existingFile?.size
                  }
                  onDetailsChange={(value) => {
                    setDetails(value);
                    if (error) setError(undefined);
                  }}
                  onFileChange={(next) => {
                    if (next && next.size > PROOF_MAX_BYTES) {
                      setError("Files must be 10 MB or smaller.");
                      return;
                    }
                    if (next && !isAllowedProofFileName(next.name)) {
                      setError("Use a PNG, JPEG, WEBP, or PDF file.");
                      return;
                    }
                    setFile(next);
                    setRemoveExisting(false);
                    if (error) setError(undefined);
                  }}
                  onRemoveExistingFile={() => {
                    setExistingFile(null);
                    setRemoveExisting(true);
                  }}
                  onSubmit={submit}
                />
              </div>
              {status ? (
                <p className="mt-4 text-sm text-foreground/55">{status}</p>
              ) : null}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="border-t border-white/8 pt-6">
            <p className="label">{issued ? "Issued reward" : "Reward"}</p>
            <p className="stat-value mt-3 text-4xl text-foreground">
              {formatUsdCompact(
                issuedReward?.amountCents ?? task.reward.amountCents,
              )}
            </p>
            <p className="mt-1 font-mono text-sm text-accent">
              {issuedReward?.ticker ?? task.reward.ticker}
            </p>

            <dl className="mt-8 space-y-4 border-t border-white/8 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Status</dt>
                <dd className="text-right text-foreground/80">
                  {issued
                    ? "Issued"
                    : verified
                      ? "Verified"
                      : submitted
                        ? "Submitted — not verified"
                        : "Completed"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Verification</dt>
                <dd className="text-right text-foreground/80">
                  {verified ? "Verified" : "Manual"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Reward</dt>
                <dd className="text-right text-foreground/80">
                  {issued
                    ? "Issued"
                    : verified
                      ? "Pending issuance"
                      : "Not issued"}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              {verified ? (
                <p className="text-xs leading-5 text-foreground/38">
                  {issued
                    ? "Issued. No holding was created."
                    : "Verified. Reward is pending issuance."}
                </p>
              ) : (
                <>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={pending}
                    onClick={() => {
                      void submit();
                    }}
                  >
                    {pending ? "Saving…" : "Submit for verification"}
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-foreground/38">
                    Submitting does not start a review or issue stock.
                  </p>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
