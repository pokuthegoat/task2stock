import type { WorkStatus } from "@/lib/data";

const tones: Record<WorkStatus, string> = {
  in_progress: "border-white/12 text-foreground/70",
  proof_submitted: "border-white/12 text-foreground/80",
  verified: "border-positive/30 text-positive",
  reward_issued: "border-accent/25 text-accent",
};

export function StatusBadge({
  status,
  label,
}: {
  status: WorkStatus;
  label: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[status]}`}
    >
      {label}
    </span>
  );
}
