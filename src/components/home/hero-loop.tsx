import { BrandMark } from "@/components/site/brand-mark";
import { GlassSurface } from "@/components/ui/glass-surface";

export function HeroLoop() {
  return (
    <GlassSurface
      className="hero-loop relative w-full max-w-md overflow-hidden p-5 md:p-6"
      aria-hidden="true"
    >
      <p className="label">Do a task → Earn a stock reward</p>

      <div className="hero-loop-live relative mt-5 min-h-[200px]">
        <div className="hero-loop-frame" data-frame="task">
          <p className="text-xs text-foreground/42">Available task</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <p className="mt-1 text-xs text-foreground/40">Northstar Athletics</p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-sm text-foreground/70">Waiting to start</p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="done">
          <p className="text-xs text-foreground/42">Task</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-sm font-medium text-foreground">Completed</p>
            <p className="mt-1 text-xs text-foreground/42">20 / 20 km logged</p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="proof">
          <p className="text-xs text-foreground/42">Proof</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-sm font-medium text-foreground">Proof submitted</p>
            <p className="mt-1 text-xs text-foreground/42">proof.jpg · pending review</p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="reward">
          <p className="text-xs text-foreground/42">Stock reward</p>
          <div className="mt-4 flex items-center gap-3">
            <BrandMark size={36} className="rounded-xl" />
            <p className="text-2xl font-medium tracking-tight text-accent">
              $15 NVDA
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-foreground/40">
            Catalog example. Settlement is not live.
          </p>
        </div>
      </div>

      <div className="hero-loop-static mt-5">
        <p className="text-lg font-medium tracking-tight text-foreground">
          Run 20km
        </p>
        <p className="mt-2 text-sm text-foreground/55">Completed · Proof submitted</p>
        <div className="mt-5 flex items-center gap-3">
          <BrandMark size={32} className="rounded-xl" />
          <p className="text-xl font-medium tracking-tight text-accent">$15 NVDA</p>
        </div>
      </div>
    </GlassSurface>
  );
}
