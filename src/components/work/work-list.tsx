import Link from "next/link";
import { RewardBadge } from "@/components/ui/reward-badge";
import { PageContainer } from "@/components/ui/page-container";
import { StatusBadge } from "@/components/ui/status-badge";
import { workActionLabel, type WorkItemView } from "@/lib/data";

export function WorkList({ items }: { items: WorkItemView[] }) {
  return (
    <section className="pb-24 md:pb-32">
      <PageContainer>
        <ul className="grid gap-4">
          {items.map((item) => (
            <li key={item.taskId}>
              <Link
                href={item.href}
                className="glass-tile glass-tile-hover group flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
              >
                <div className="min-w-0">
                  <p className="label">{item.companyName}</p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-foreground/42">
                    {item.estimate} · {item.difficulty} · {item.timeBucket}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-6 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <RewardBadge offer={item.offer} example={false} />
                    <div className="mt-2">
                      <StatusBadge
                        status={item.status}
                        label={item.statusLabel}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground/58 transition-colors group-hover:text-foreground">
                    {workActionLabel(item.status)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
