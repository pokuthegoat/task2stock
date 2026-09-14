const stages = ["Complete task", "Proof", "Payout pending"] as const;

export function TaskSubmitProgress({ submitted }: { submitted: boolean }) {
  const current = submitted ? 3 : 2;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="label">Progress</p>
        <p className="text-xs text-foreground/40">
          {submitted ? "Payout pending" : "Proof required"}
        </p>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{
            width: submitted ? "100%" : "66%",
          }}
        />
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {stages.map((stage, index) => {
          const step = index + 1;
          const active = current === step;
          const done = step < current || (submitted && step === 3);

          return (
            <li
              key={stage}
              className={`rounded-2xl px-4 py-3 ${
                active ? "glass" : "border border-white/8"
              }`}
            >
              <p className="font-mono text-xs tracking-[0.14em] text-foreground/35">
                {String(step).padStart(2, "0")}
              </p>
              <p
                className={`mt-1 text-sm ${
                  active || done ? "text-foreground" : "text-foreground/48"
                }`}
              >
                {stage}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
