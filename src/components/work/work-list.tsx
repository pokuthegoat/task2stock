import Link from "next/link";
import { RewardBadge } from "@/components/ui/reward-badge";
import { PageContainer } from "@/components/ui/page-container";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  workActionLabel,
  type WorkItemView,
} from "@/lib/data";

export function WorkList({ items }: { items: WorkItemView[] }) {
  return (
    <section className="pb-28">
      <PageContainer>
        <ul className="divide-y divide-white/8 border-y border-white/8">
          {items.map((item) => (
            <li key={item.taskId}>
              <Link
                href={item.href}
                className="flex flex-col gap-4 py-5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="label">{item.companyName}</p>
                  <p className="mt-2 text-base font-semibold tracking-tight text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-medium text-foreground/40">
                    {item.estimate} · {item.difficulty} · {item.timeBucket}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-5 sm:justify-end">
                  <div className="text-left sm:text-right">
                    <RewardBadge offer={item.offer} example={false} />
                    <div className="mt-2">
                      <StatusBadge
                        status={item.status}
                        label={item.statusLabel}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground/55">
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
