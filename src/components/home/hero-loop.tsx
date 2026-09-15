import { BrandMark } from "@/components/site/brand-mark";
import { GlassSurface } from "@/components/ui/glass-surface";

export function HeroLoop() {
  return (
    <GlassSurface
      tier="panel"
      className="hero-loop relative w-full max-w-md overflow-hidden p-6 md:p-7"
      aria-hidden="true"
    >
      <p className="label">Do a task → Earn a stock reward</p>

      <div className="hero-loop-live relative mt-6 min-h-[204px]">
        <div className="hero-loop-frame" data-frame="task">
          <p className="text-xs text-foreground/44">Available task</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <p className="mt-1 text-xs text-foreground/42">Northstar Athletics</p>
          <div className="glass-tile mt-5 px-4 py-3.5">
            <p className="text-sm text-foreground/72">Waiting to start</p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="done">
          <p className="text-xs text-foreground/44">Task</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <div className="glass-tile mt-5 px-4 py-3.5">
            <p className="text-sm font-medium text-foreground">Completed</p>
            <p className="mt-1 text-xs text-foreground/44">20 / 20 km logged</p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="proof">
          <p className="text-xs text-foreground/44">Proof</p>
          <p className="mt-2 text-lg font-medium tracking-tight text-foreground">
            Run 20km
          </p>
          <div className="glass-tile mt-5 px-4 py-3.5">
            <p className="text-sm font-medium text-foreground">
              Proof submitted
            </p>
            <p className="mt-1 text-xs text-foreground/44">
              proof.jpg · pending review
            </p>
          </div>
        </div>

        <div className="hero-loop-frame" data-frame="reward">
          <p className="text-xs text-foreground/44">Stock reward</p>
          <div className="glass-tile mt-5 flex items-center gap-3.5 px-4 py-4">
            <BrandMark size={38} className="rounded-xl" />
            <p className="text-2xl font-medium tracking-tight text-accent">
              $15 NVDA
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-foreground/42">
            Catalog example.
          </p>
        </div>
      </div>

      <div className="hero-loop-static mt-6">
        <p className="text-lg font-medium tracking-tight text-foreground">
          Run 20km
        </p>
        <p className="mt-2 text-sm text-foreground/58">
          Completed · Proof submitted
        </p>
        <div className="glass-tile mt-5 flex items-center gap-3.5 px-4 py-4">
          <BrandMark size={34} className="rounded-xl" />
          <p className="text-xl font-medium tracking-tight text-accent">
            $15 NVDA
          </p>
        </div>
      </div>
    </GlassSurface>
  );
}
