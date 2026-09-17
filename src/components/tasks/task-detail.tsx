import Link from "next/link";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, type TaskView } from "@/lib/data";
import { companyAccent, taskKind } from "@/lib/tasks/presentation";
import { TaskProgressRail } from "@/components/tasks/task-progress-rail";
import { TaskStill } from "@/components/tasks/task-still";

const modelSteps = [
  "Complete the task",
  "Submit proof",
  "Verification",
  "Stock reward",
];

export function TaskDetail({ task }: { task: TaskView }) {
  const kind = taskKind(task);
  const accent = companyAccent(task.company.name);

  return (
    <PageContainer className="pb-24 pt-10 md:pb-32 md:pt-14">
      <Link
        href="/tasks"
        className="glass-chip inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground/70 transition hover:text-foreground"
      >
        <span aria-hidden="true">←</span>
        Back to tasks
      </Link>

      <div className="mt-6">
        <TaskProgressRail current={0} />
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6">
          <div
            className="glass-panel overflow-hidden"
            style={{ "--task-accent": accent } as CSSProperties}
          >
            <TaskStill task={task} />
            <div className="p-7 md:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <p className="label">{task.company.name}</p>
                <span className="glass-chip px-3 py-1 text-[11px] font-medium text-foreground/70">
                  {kind}
                </span>
                <span className="glass-chip px-3 py-1 text-[11px] font-medium text-foreground/70">
                  Open
                </span>
              </div>

              <h1 className="display mt-5 text-4xl text-foreground md:text-5xl">
                {task.title}
              </h1>

              <p className="mt-5 font-mono text-lg tracking-tight text-accent">
                {formatRewardOffer(task.reward)}
              </p>

              <p className="mt-6 max-w-xl text-lg font-normal leading-8 text-foreground/72">
                {task.description}
              </p>
            </div>
          </div>

          <section className="glass-panel p-7 md:p-10">
            <h2 className="heading text-2xl text-foreground md:text-3xl">
              What you need to do
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/68">
              {task.requirement}
            </p>
            <ol className="mt-7 grid gap-3">
              {task.steps.map((step, index) => (
                <li
                  key={step}
                  className="glass-tile flex items-start gap-4 p-4 text-sm leading-6"
                >
                  <span className="glass-chip flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[11px] text-foreground/62">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/82">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="glass-panel p-7 md:p-10">
            <h2 className="heading text-2xl text-foreground md:text-3xl">
              Requirements / eligibility
            </h2>
            <ul className="mt-7 grid gap-3">
              {task.eligibility.map((item) => (
                <li
                  key={item}
                  className="glass-tile flex items-start gap-4 p-4 text-sm leading-6 text-foreground/72"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="glass-panel p-7 md:p-10">
            <h2 className="heading text-2xl text-foreground md:text-3xl">
              The product model
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/68">
              Start the task, submit proof, then a moderator reviews it. Stock
              is not issued until verification.
            </p>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2">
              {modelSteps.map((step, index) => (
                <li key={step} className="glass-tile p-5">
                  <p className="font-mono text-xs tracking-[0.14em] text-foreground/48">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/86">{step}</p>
                </li>
              ))}
            </ol>
          </section>
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
                <dt className="text-foreground/55">Time</dt>
                <dd className="font-medium text-foreground/88">{task.estimate}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Difficulty</dt>
                <dd className="font-medium text-foreground/88">
                  {task.difficulty}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Category</dt>
                <dd className="font-medium text-foreground/88">{task.category}</dd>
              </div>
            </dl>

            <hr className="hairline my-7" />

            <p className="label">Reward breakdown</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Amount</dt>
                <dd className="font-mono text-foreground/88">
                  {formatUsdCompact(task.reward.amountCents)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Ticker</dt>
                <dd className="font-mono text-foreground/88">
                  {task.reward.ticker}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Form</dt>
                <dd className="text-right text-foreground/88">
                  Tokenized stock
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-foreground/55">Status</dt>
                <dd className="text-right text-foreground/88">Not issued</dd>
              </div>
            </dl>

            <div className="mt-8">
              <Button
                href={`/tasks/${task.id}/submit`}
                size="lg"
                className="w-full"
              >
                Start task
              </Button>
              <p className="mt-4 text-center text-xs leading-5 text-foreground/55">
                Proof stays pending until review.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
