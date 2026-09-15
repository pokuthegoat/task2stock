import { BrandMark } from "@/components/site/brand-mark";
import { GlassSurface } from "@/components/ui/glass-surface";

export const storyStages = [
  "find",
  "complete",
  "proof",
  "verified",
  "reward",
  "own",
] as const;

export type LoopStage = (typeof storyStages)[number];

const labels: Record<LoopStage, string> = {
  find: "Task",
  complete: "Action",
  proof: "Proof",
  verified: "Verification",
  reward: "Stock reward",
  own: "Ownership",
};

function StateBlock({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!active}
      className={`story-state col-start-1 row-start-1 ${
        active ? "pointer-events-auto" : "pointer-events-none"
      }`}
      data-active={active}
    >
      {children}
    </div>
  );
}

export function LoopVisual({ stage }: { stage: LoopStage }) {
  const index = Math.max(0, storyStages.indexOf(stage));

  return (
    <GlassSurface
      tier="panel"
      className="relative w-full overflow-hidden p-6 md:p-8"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2">
        {storyStages.map((key, dot) => (
          <span
            key={key}
            className={`h-1 flex-1 rounded-full transition-[background-color,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              dot <= index ? "bg-accent/85" : "bg-white/12"
            }`}
          />
        ))}
      </div>

      <p className="label mt-7">{labels[stage]}</p>
      <p className="mt-3 text-lg font-medium tracking-tight text-foreground">
        Run 20 kilometers this month
      </p>
      <p
        className={`overflow-hidden text-xs text-foreground/40 transition-[opacity,max-height,margin] duration-500 motion-reduce:transition-none ${
          index <= 1 ? "mt-1 max-h-5 opacity-100" : "mt-0 max-h-0 opacity-0"
        }`}
      >
        Northstar Athletics
      </p>

      <div className="relative mt-6 grid min-h-[176px]">
        <StateBlock active={index === 0}>
          <div className="story-pop glass-tile px-4 py-4">
            <p className="text-sm font-medium text-foreground">Available</p>
            <p className="mt-1 text-xs text-foreground/42">
              An open opportunity in the catalog
            </p>
          </div>
        </StateBlock>

        <StateBlock active={index === 1}>
          <div>
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-medium text-foreground">16 / 20 km</p>
              <p className="text-xs text-foreground/40">In progress</p>
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="story-bar-fill h-full origin-left rounded-full bg-accent"
                style={{ transform: index === 1 ? "scaleX(0.8)" : "scaleX(0)" }}
              />
            </div>
          </div>
        </StateBlock>

        <StateBlock active={index === 2}>
          <div className="story-slide glass-tile px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              <span className="mr-1.5 text-accent">✓</span>
              Task completed
            </p>
            <hr className="hairline my-3" />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-foreground/55">proof.jpg</p>
              <p className="text-xs text-accent">Submitted</p>
            </div>
          </div>
        </StateBlock>

        <StateBlock active={index === 3}>
          <div className="glass-tile px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              Pending verification
            </p>
            <p className="story-pending mt-1 text-xs text-foreground/42">
              Review in progress — not automatic
            </p>
          </div>
        </StateBlock>

        <StateBlock active={index === 4}>
          <div className="story-reward glass-tile flex items-center gap-3.5 px-4 py-4">
            <BrandMark size={38} className="rounded-xl" />
            <p className="text-2xl font-medium tracking-tight text-accent">
              + $15 NVDA
            </p>
          </div>
        </StateBlock>

        <StateBlock active={index === 5}>
          <div>
            <p className="label">Illustration</p>
            <div className="mt-3 space-y-2">
              <div className="story-own-row glass-chip flex items-center justify-between rounded-2xl px-4 py-2.5">
                <p className="text-sm font-medium text-foreground">NVDA</p>
                <p className="text-sm text-accent">$15</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-white/12 px-4 py-2.5">
                <p className="text-sm text-foreground/38">Next reward</p>
                <p className="text-sm text-foreground/30">—</p>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-dashed border-white/12 px-4 py-2.5">
                <p className="text-sm text-foreground/38">Collects over time</p>
                <p className="text-sm text-foreground/30">—</p>
              </div>
            </div>
          </div>
        </StateBlock>
      </div>
    </GlassSurface>
  );
}
