import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  formatUsdCompact,
  listTaskEarnings,
  type TaskEarningView,
} from "@/lib/data";

function EarningsList({
  items,
  keyPrefix,
}: {
  items: TaskEarningView[];
  keyPrefix: string;
}) {
  return (
    <ul className="mt-8 divide-y divide-white/8 border-y border-white/8">
      {items.map((item) => (
        <li key={`${keyPrefix}-${item.reward.id}`}>
          <Link
            href={`/tasks/${item.reward.taskId}`}
            className="flex flex-col gap-3 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">
                {item.taskTitle}
              </p>
              <p className="mt-1 text-xs font-medium text-foreground/40">
                {item.companyName} · {item.completedLabel}
              </p>
            </div>
            <div className="flex items-center justify-between gap-6 sm:justify-end">
              <p className="text-sm font-medium text-accent">
                {formatUsdCompact(item.reward.amountCents)} {item.reward.ticker}
              </p>
              <p className="text-xs font-medium text-foreground/40">
                {item.statusLabel}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TaskEarnings({
  issued = [],
}: {
  issued?: TaskEarningView[];
}) {
  const examples = listTaskEarnings();

  return (
    <section className="py-14 md:pb-28">
      <PageContainer>
        {issued.length > 0 ? (
          <div className="mb-14">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <SectionHeading
                eyebrow="Your issued rewards"
                title="Issued to you"
              />
              <p className="max-w-sm text-sm leading-6 text-foreground/48">
                Marked issued in Task2Stock. The operator fulfills these
                outside the app.
              </p>
            </div>
            <EarningsList items={issued} keyPrefix="issued" />
          </div>
        ) : null}

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Task earnings"
            title="Completed tasks"
          />
          <p className="max-w-sm text-sm leading-6 text-foreground/48">
            Each row is a recorded reward, not a settled stock transfer.
          </p>
        </div>

        <EarningsList items={examples} keyPrefix="example" />
      </PageContainer>
    </section>
  );
}
