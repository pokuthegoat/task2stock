import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { formatRewardOffer, formatUsdCompact, type TaskView } from "@/lib/data";

const modelSteps = [
  "Complete the task",
  "Submit proof",
  "Verification",
  "Stock reward",
];

export function TaskDetail({ task }: { task: TaskView }) {
  return (
    <PageContainer className="pb-24 pt-16 md:pb-32 md:pt-20">
      <Link
        href="/tasks"
        className="text-sm text-foreground/55 transition-colors hover:text-foreground"
      >
        Back to tasks
      </Link>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="label">
              {task.company.name}
            </p>
            <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground/45">
              Open
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

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              What you need to do
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/52">
              {task.requirement}
            </p>
            <ol className="mt-6 space-y-4">
              {task.steps.map((step, index) => (
                <li key={step} className="flex gap-4 text-sm leading-6">
                  <span className="font-mono text-xs tracking-[0.14em] text-foreground/35">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-foreground/72">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              Requirements / eligibility
            </h2>
            <ul className="mt-6 space-y-3">
              {task.eligibility.map((item) => (
                <li
                  key={item}
                  className="text-sm leading-6 text-foreground/62"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-14">
            <h2 className="heading text-3xl text-foreground">
              The product model
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/52">
              Start the task, submit proof, then a moderator reviews it. Stock
              is not issued until verification.
            </p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {modelSteps.map((step, index) => (
                <li key={step} className="border-t border-white/8 py-4">
                  <p className="font-mono text-xs tracking-[0.14em] text-foreground/35">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/80">{step}</p>
                </li>
              ))}
            </ol>
          </section>
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
            </dl>

            <div className="mt-8 border-t border-white/8 pt-5">
              <p className="label">
                Reward breakdown
              </p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground/45">Amount</dt>
                  <dd className="font-mono text-foreground/80">
                    {formatUsdCompact(task.reward.amountCents)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground/45">Ticker</dt>
                  <dd className="font-mono text-foreground/80">{task.reward.ticker}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground/45">Form</dt>
                  <dd className="text-right text-foreground/80">
                    Tokenized stock
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-foreground/45">Status</dt>
                  <dd className="text-right text-foreground/80">
                    Not issued
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8">
              <Button href={`/tasks/${task.id}/submit`} className="w-full">
                Start task
              </Button>
              <p className="mt-3 text-center text-xs leading-5 text-foreground/38">
                Completing this task does not issue stock until verification.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
