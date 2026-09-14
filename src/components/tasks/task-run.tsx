"use client";

import Link from "next/link";
import { useState } from "react";
import {
  markAttemptCompleteAction,
  saveAttemptChecklistAction,
} from "@/app/actions/task-progress";
import { TaskRunComplete } from "@/components/tasks/task-run-complete";
import { TaskRunProgress } from "@/components/tasks/task-run-progress";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, type TaskView } from "@/lib/data";

export function TaskRun({
  task,
  initialChecked,
  complete: initialComplete,
}: {
  task: TaskView;
  initialChecked: boolean[];
  complete: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [complete, setComplete] = useState(initialComplete);
  const [pending, setPending] = useState(false);
  const checkedCount = checked.filter(Boolean).length;

  async function toggleItem(index: number) {
    if (complete || pending) return;

    const next = checked.map((value, itemIndex) =>
      itemIndex === index ? !value : value,
    );
    setChecked(next);

    const indexes = next.flatMap((value, itemIndex) =>
      value ? [itemIndex] : [],
    );

    try {
      const result = await saveAttemptChecklistAction(task.id, indexes);

      if (!result.ok && !("code" in result && result.code === "UNAUTHENTICATED")) {
        setChecked(checked);
      }
    } catch {
      setChecked(checked);
    }
  }

  async function markComplete() {
    if (complete || pending) return;

    setPending(true);

    try {
      const result = await markAttemptCompleteAction(task.id);

      if (result.ok || ("code" in result && result.code === "UNAUTHENTICATED")) {
        setComplete(true);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <PageContainer className="pb-24 pt-16 md:pb-32 md:pt-20">
      <Link
        href={`/tasks/${task.id}`}
        className="text-sm text-foreground/55 transition-colors hover:text-foreground"
      >
        Back to task
      </Link>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="label">
              {task.company.name}
            </p>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground/45">
              In progress
            </span>
          </div>

          <h1 className="display mt-4 text-4xl text-foreground md:text-5xl">
            {task.title}
          </h1>

          <p className="mt-5 font-mono text-lg tracking-tight text-accent">
            {formatRewardOffer(task.reward)}
          </p>

          <p className="mt-6 max-w-xl text-lg leading-8 text-foreground/58">
            {task.description}
          </p>

          <section className="mt-12">
            <TaskRunProgress
              complete={complete}
              checked={checkedCount}
              total={task.steps.length}
            />
          </section>

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              Instructions
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/52">
              {task.requirement}
            </p>
            <ol className="mt-6 space-y-4">
              {task.instructions.map((instruction, index) => (
                <li key={instruction} className="flex gap-4 text-sm leading-6">
                  <span className="font-mono text-xs tracking-[0.14em] text-foreground/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/72">{instruction}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              Checklist
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/52">
              Mark the work as you go. Checking items is not verification.
            </p>
            <ul className="mt-6 space-y-3">
              {task.steps.map((step, index) => {
                const isChecked = checked[index];

                return (
                  <li key={step}>
                    <button
                      type="button"
                      aria-pressed={isChecked}
                      disabled={complete}
                      onClick={() => toggleItem(index)}
                      className="flex w-full items-start gap-4 border-t border-white/8 py-4 text-left transition-colors hover:bg-white/[0.02] disabled:opacity-70"
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] ${
                          isChecked
                            ? "border-accent bg-accent text-[#161513]"
                            : "border-white/18 text-transparent"
                        }`}
                      >
                        ✓
                      </span>
                      <span className="text-sm leading-6 text-foreground/80">
                        {step}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              Requirements
            </h2>
            <ul className="mt-6 space-y-3">
              {task.eligibility.map((item) => (
                <li key={item} className="text-sm leading-6 text-foreground/62">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {complete ? (
            <div className="mt-14">
              <TaskRunComplete taskId={task.id} />
            </div>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28">
          <div className="border-t border-white/8 pt-6">
            <p className="label">
              Reward
            </p>
            <p className="stat-value mt-3 text-4xl text-foreground">
              {formatUsdCompact(task.reward.amountCents)}
            </p>
            <p className="mt-1 font-mono text-sm text-accent">{task.reward.ticker}</p>

            <dl className="mt-8 space-y-4 border-t border-white/8 pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Time</dt>
                <dd className="text-foreground/80">{task.estimate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Difficulty</dt>
                <dd className="text-foreground/80">{task.difficulty}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Category</dt>
                <dd className="text-foreground/80">{task.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/40">Status</dt>
                <dd className="text-right text-foreground/80">
                  {complete ? "Marked complete" : "In progress"}
                </dd>
              </div>
            </dl>

            <div className="mt-8">
              {complete ? (
                <p className="text-xs leading-5 text-foreground/38">
                  Continue to submit proof. Verification is not live, and stock
                  is not issued.
                </p>
              ) : (
                <>
                  <Button
                    className="w-full"
                    disabled={pending}
                    onClick={() => {
                      void markComplete();
                    }}
                  >
                    Mark task as complete
                  </Button>
                  <p className="mt-3 text-center text-xs leading-5 text-foreground/38">
                    Completing this task does not issue stock until verification.
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
