"use client";

import Link from "next/link";
import { useState } from "react";
import { submitProofAction } from "@/app/actions/task-progress";
import { TaskSubmitForm } from "@/components/tasks/task-submit-form";
import { TaskSubmitProgress } from "@/components/tasks/task-submit-progress";
import { TaskSubmitStatus } from "@/components/tasks/task-submit-status";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, type TaskView } from "@/lib/data";
import { useAuth } from "@/components/auth/auth-provider";
import { getProofInputError } from "@/lib/proof/input";
import { isAllowedProofFileName, PROOF_MAX_BYTES } from "@/lib/proof/types";
import { uploadProofBlob } from "@/lib/storage/client-upload";

export function TaskSubmit({
  task,
  initialDetails,
  initialFile,
  submittedAt,
  submitted: initialSubmitted,
}: {
  task: TaskView;
  initialDetails: string;
  initialFile?: { fileName: string; size: number; href: string } | null;
  submittedAt?: string | null;
  submitted: boolean;
}) {
  const { user } = useAuth();
  const [details, setDetails] = useState(initialDetails);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState(initialFile ?? null);
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(initialSubmitted);
  const [pending, setPending] = useState(false);
  const [savedAt, setSavedAt] = useState(submittedAt ?? null);

  async function submit() {
    if (pending || submitted) return;

    const inputError = getProofInputError({
      details,
      hasFile: Boolean(file),
    });

    if (inputError) {
      setError(inputError);
      return;
    }

    if (file && file.size > PROOF_MAX_BYTES) {
      setError("Files must be 10 MB or smaller.");
      return;
    }

    if (file && !isAllowedProofFileName(file.name)) {
      setError("Use a PNG, JPEG, WEBP, or PDF file.");
      return;
    }

    setError(undefined);
    setPending(true);

    try {
      const data = new FormData();
      data.set("taskId", task.id);
      data.set("details", details);

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
            {submitted ? "Payout pending" : "Proof"}
          </h1>

          <p className="mt-5 font-mono text-lg tracking-tight text-accent">
            {formatRewardOffer(task.reward)}
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/58">
            {submitted
              ? "Your submission is waiting on moderator review."
              : "Upload a proof file and describe the work. A moderator will review both before any reward is processed."}
          </p>

          <section className="mt-12">
            <TaskSubmitProgress submitted={submitted} />
          </section>

          {submitted ? (
            <div className="mt-14">
              <TaskSubmitStatus
                taskTitle={task.title}
                reward={task.reward}
                submittedAt={savedAt}
                details={details.trim()}
                file={existingFile}
              />
            </div>
          ) : (
            <section className="mt-14">
              <h2 className="heading text-3xl text-foreground">Proof</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/52">
                {task.requirement} Include a file and a description. Both are
                required.
              </p>
              <div className="mt-8">
                <TaskSubmitForm
                  details={details}
                  error={error}
                  pending={pending}
                  selectedFile={file}
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
                    if (error) setError(undefined);
                  }}
                  onSubmit={submit}
                />
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="border-t border-white/8 pt-6">
            <p className="label">Reward</p>
            <p className="stat-value mt-3 text-4xl text-foreground">
              {formatUsdCompact(task.reward.amountCents)}
            </p>
            <p className="mt-1 font-mono text-sm text-accent">
              {task.reward.ticker}
            </p>

            <dl className="mt-8 space-y-4 border-t border-white/8 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Status</dt>
                <dd className="text-right text-foreground/80">
                  {submitted ? "Payout pending" : "Proof required"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Review</dt>
                <dd className="text-right text-foreground/80">Moderator</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Reward</dt>
                <dd className="text-right text-foreground/80">Not issued</dd>
              </div>
            </dl>

            <p className="mt-8 text-xs leading-5 text-foreground/38">
              Verify sends this proof for moderator review. It does not approve
              the task or issue stock.
            </p>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
