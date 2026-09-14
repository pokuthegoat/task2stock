import { GlassSurface } from "@/components/ui/glass-surface";

export const storyStages = [
  "find",
  "complete",
  "proof",
  "verified",
  "reward",
] as const;

export type LoopStage = (typeof storyStages)[number];

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
      className="relative w-full overflow-hidden p-6 md:p-7"
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

      <p className="label mt-7">
        {index <= 1
          ? "Task"
          : index === 2
            ? "Proof"
            : index === 3
              ? "Verification"
              : "Reward"}
      </p>
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

      <div className="relative mt-6 grid min-h-[168px]">
        <StateBlock active={index === 0}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
            <p className="text-sm font-medium text-foreground">Waiting to start</p>
            <p className="mt-1 text-xs text-foreground/42">Open the run page</p>
          </div>
        </StateBlock>

        <StateBlock active={index === 1}>
          <div>
            <div className="flex items-end justify-between gap-4">
              <p className="text-sm font-medium text-foreground">16 / 20 km</p>
              <p className="text-xs text-foreground/40">Logged</p>
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
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              <span className="mr-1.5 text-accent">✓</span>
              Run completed
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/8 pt-3">
              <p className="text-xs text-foreground/55">proof.jpg</p>
              <p className="text-xs text-accent">Submit proof →</p>
            </div>
          </div>
        </StateBlock>

        <StateBlock active={index === 3}>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              <span className="mr-1.5 text-accent">✓</span>
              Proof received
            </p>
            <p className="mt-1 text-xs text-foreground/42">
              Reviewing submission...
            </p>
          </div>
        </StateBlock>

        <StateBlock active={index === 4}>
          <div>
            <p className="text-2xl font-medium tracking-tight text-accent">
              + $15 NVDA
            </p>
            <div className="mt-5 border-t border-white/8 pt-4">
              <p className="label">Portfolio</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">NVDA</p>
                <p className="text-sm font-medium text-foreground">$15</p>
              </div>
            </div>
          </div>
        </StateBlock>
      </div>
    </GlassSurface>
  );
}
