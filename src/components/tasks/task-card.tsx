import Link from "next/link";
import { RewardBadge } from "@/components/ui/reward-badge";
import type { TaskView } from "@/lib/data";

export function TaskCard({
  task,
  badge,
  motion = false,
}: {
  task: TaskView;
  badge?: string;
  motion?: boolean;
}) {
  return (
    <Link
      href={`/tasks/${task.id}`}
      className="glass-tile glass-tile-hover group flex h-full flex-col p-6 md:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="label">{task.company.name}</p>
        {badge ? (
          <span className="glass-chip shrink-0 px-3 py-1 text-[11px] font-medium text-foreground/62">
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="heading mt-4 text-xl text-foreground md:text-2xl">
        {task.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-foreground/60">
        {task.description}
      </p>
      <p className="mt-2 flex-1 text-sm leading-6 text-foreground/42">
        {task.requirement}
      </p>
      <hr className="hairline my-6" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <RewardBadge offer={task.reward} example={false} motion={motion} />
          <p className="mt-2 text-xs font-medium text-foreground/42">
            {task.timeBucket} · {task.difficulty}
          </p>
        </div>
        <span className="text-sm font-medium text-foreground/58 transition-colors group-hover:text-foreground">
          View task
        </span>
      </div>
    </Link>
  );
}
