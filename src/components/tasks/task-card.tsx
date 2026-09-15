import type { CSSProperties } from "react";
import { GlowLink } from "@/components/ui/glow-link";
import { RewardBadge } from "@/components/ui/reward-badge";
import type { TaskView } from "@/lib/data";
import { companyAccent, taskKind } from "@/lib/tasks/presentation";

export function TaskCard({
  task,
  badge,
  motion = false,
}: {
  task: TaskView;
  badge?: string;
  motion?: boolean;
}) {
  const kind = taskKind(task);
  const accent = companyAccent(task.company.name);

  return (
    <GlowLink
      href={`/tasks/${task.id}`}
      className="task-accent-edge glass-tile glass-tile-hover group flex h-full flex-col p-6 md:p-7"
      style={{ "--task-accent": accent } as CSSProperties}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="label">{task.company.name}</p>
          <span className="glass-chip px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] text-foreground/70">
            {kind}
          </span>
        </div>
        {badge ? (
          <span className="glass-chip shrink-0 px-3 py-1 text-[11px] font-medium text-foreground/70">
            {badge}
          </span>
        ) : null}
      </div>
      <h3 className="heading mt-4 text-xl text-foreground md:text-2xl">
        {task.title}
      </h3>
      <p className="mt-3 text-sm font-normal leading-6 text-foreground/72">
        {task.description}
      </p>
      <p className="mt-2 flex-1 text-sm font-normal leading-6 text-foreground/58">
        {task.requirement}
      </p>
      <hr className="hairline my-6" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <RewardBadge offer={task.reward} example={false} motion={motion} />
          <p className="mt-2 text-[11px] font-medium tracking-[0.04em] text-foreground/58">
            {task.timeBucket} · {task.difficulty}
          </p>
        </div>
        <span className="text-sm font-medium text-foreground/70 transition-colors group-hover:text-foreground">
          View task
        </span>
      </div>
    </GlowLink>
  );
}
