import { formatRewardOffer, type TaskView } from "@/lib/data";
import type { RewardOffer } from "@/lib/domain/model";

export function RewardBadge({
  offer,
  example = false,
}: {
  offer: RewardOffer | TaskView["reward"];
  example?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium tracking-tight text-accent">
        {formatRewardOffer(offer)}
      </span>
      {example ? (
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground/45">
          Example
        </span>
      ) : null}
    </span>
  );
}
