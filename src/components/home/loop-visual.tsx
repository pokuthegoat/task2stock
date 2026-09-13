import { GlassSurface } from "@/components/ui/glass-surface";

const stages = [
  "task",
  "complete",
  "proof",
  "verified",
  "reward",
  "portfolio",
] as const;

export type LoopStage = (typeof stages)[number];

export function LoopVisual({ stage }: { stage: LoopStage }) {
  const index = stages.indexOf(stage);

  return (
    <GlassSurface
      className="relative w-full overflow-visible p-6 md:p-7"
      aria-label="Task2Stock loop from finding a task to building a portfolio"
    >
      <div className="relative h-px bg-white/10">
        <div
          className="absolute inset-y-0 left-0 bg-accent/80 transition-[width] duration-500"
          style={{ width: `${((index + 1) / stages.length) * 100}%` }}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div
          className={`loop-stage rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 ${index >= 0 ? "is-active" : ""}`}
        >
          <p className="label">Task</p>
          <p className="mt-2 text-sm font-medium text-foreground">
            Run 20 kilometers this month
          </p>
          <p className="mt-1 text-xs text-foreground/40">Northstar Athletics</p>
        </div>

        <div
          className={`loop-stage rounded-2xl border border-white/10 px-4 py-3 ${index >= 1 ? "is-active" : ""}`}
        >
          <p className="text-sm font-medium text-foreground">
            {index >= 1 ? "Requirement complete" : "Waiting to start"}
          </p>
          <p className="mt-1 text-xs text-foreground/40">
            {index >= 1 ? "Logged outdoor distance" : "Open the run page"}
          </p>
        </div>

        <div
          className={`loop-stage rounded-2xl border border-white/10 px-4 py-3 ${index >= 2 ? "is-active" : ""}`}
        >
          <p className="text-sm font-medium text-foreground">Proof</p>
          <p className="mt-1 text-xs leading-5 text-foreground/45">
            {index >= 2
              ? "Note and file submitted for the 20km loop."
              : "Add a note, a file, or both after you finish."}
          </p>
        </div>

        <div
          className={`loop-stage flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-3 ${index >= 3 ? "is-active" : ""}`}
        >
          <p className="text-sm font-medium text-foreground">Verification</p>
          <p className="text-xs font-medium text-positive">
            {index >= 3 ? "Verified" : "Pending"}
          </p>
        </div>

        <div
          className={`loop-stage flex items-center justify-between gap-4 rounded-2xl border border-white/10 px-4 py-3 ${index >= 4 ? "is-active" : ""}`}
        >
          <p className="text-sm font-medium text-foreground">Reward</p>
          <p className="text-sm font-medium text-accent">
            {index >= 4 ? "$15 NVDA" : "—"}
          </p>
        </div>

        <div
          className={`loop-stage rounded-2xl border border-white/10 px-4 py-3 ${index >= 5 ? "is-active" : ""}`}
        >
          <p className="label">Portfolio</p>
          <div className="mt-3 flex items-end gap-1.5">
            {[18, 28, 22, 36, 44].map((height, bar) => (
              <span
                key={bar}
                className="w-6 rounded-sm bg-accent/70"
                style={{
                  height: index >= 5 ? height : Math.max(8, height * 0.35),
                  opacity: index >= 5 ? 1 : 0.35,
                  transition: "height 500ms ease, opacity 500ms ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </GlassSurface>
  );
}
