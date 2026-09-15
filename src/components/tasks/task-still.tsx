import type { CSSProperties } from "react";
import { companyAccent, taskKind, type TaskKind } from "@/lib/tasks/presentation";
import type { TaskView } from "@/lib/data";

function StillMark({ kind }: { kind: TaskKind }) {
  if (kind === "Video") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <circle cx="32" cy="32" r="22" />
        <path d="M28 22v20l16-10z" />
      </svg>
    );
  }

  if (kind === "Run") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <path d="M8 44c10-18 18-18 24 0s14 18 24 0" />
        <path d="M8 32c10-14 18-14 24 0s14 14 24 0" />
      </svg>
    );
  }

  if (kind === "Playlist") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <rect x="16" y="28" width="6" height="20" rx="2" />
        <rect x="29" y="16" width="6" height="32" rx="2" />
        <rect x="42" y="22" width="6" height="26" rx="2" />
      </svg>
    );
  }

  if (kind === "Build") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <rect x="12" y="36" width="18" height="12" rx="2" />
        <rect x="34" y="36" width="18" height="12" rx="2" />
        <rect x="23" y="20" width="18" height="12" rx="2" />
      </svg>
    );
  }

  if (kind === "Social") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <rect x="10" y="18" width="14" height="28" rx="3" />
        <rect x="28" y="14" width="14" height="36" rx="3" />
        <rect x="46" y="22" width="8" height="20" rx="3" />
      </svg>
    );
  }

  if (kind === "Review") {
    return (
      <svg viewBox="0 0 64 64" className="task-still-icon">
        <path d="M16 18h32M16 28h24M16 38h28M16 48h16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="task-still-icon">
      <rect x="12" y="16" width="24" height="24" rx="4" />
      <rect x="28" y="24" width="24" height="24" rx="4" />
    </svg>
  );
}

export function TaskStill({ task }: { task: TaskView }) {
  const kind = taskKind(task);
  const accent = companyAccent(task.company.name);

  return (
    <div
      className="task-still"
      data-kind={kind.toLowerCase()}
      style={{ "--task-accent": accent } as CSSProperties}
      aria-hidden="true"
    >
      <span className="task-still-wash" />
      <StillMark kind={kind} />
      <span className="task-still-caption">{kind}</span>
    </div>
  );
}
