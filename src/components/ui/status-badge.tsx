import type { WorkStatus } from "@/lib/data";

const tones: Record<WorkStatus, string> = {
  in_progress: "border-white/14 text-foreground/72",
  proof_submitted: "border-white/16 text-foreground/85",
  verified: "border-positive/35 text-positive",
  rejected: "border-[#c9a9a2]/45 text-[#d4b4ae]",
  claim_requested: "border-white/18 text-foreground/88",
  reward_paid: "border-accent/30 text-accent",
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
      className={`glass-chip inline-flex px-3 py-1 text-[11px] font-medium ${tones[status]}`}
    >
      {label}
    </span>
  );
}
