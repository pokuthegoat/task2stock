import Link from "next/link";
import { RewardBadge } from "@/components/ui/reward-badge";
import type { TaskView } from "@/lib/data";

export function TaskCard({
  task,
  badge,
}: {
  task: TaskView;
  badge?: string;
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="group flex flex-col bg-background p-6 transition duration-300 hover:bg-white/[0.035] md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="label">{task.company.name}</p>
        {badge ? (
          <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground/45">
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="heading mt-3 text-xl text-foreground md:text-2xl">
        {task.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-foreground/58">
        {task.description}
      </p>
      <p className="mt-2 text-sm leading-6 text-foreground/40">
        {task.requirement}
      </p>
      <div className="mt-8 flex items-end justify-between gap-4 border-t border-white/8 pt-5">
        <div>
          <RewardBadge offer={task.reward} example={false} />
          <p className="mt-2 text-xs font-medium text-foreground/40">
            {task.timeBucket} · {task.difficulty}
          </p>
        </div>
        <span className="text-sm font-medium text-foreground/55 transition-colors group-hover:text-foreground">
          View task
        </span>
      </div>
    </Link>
  );
}
