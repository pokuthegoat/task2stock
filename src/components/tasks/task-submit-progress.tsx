const stages = [
  "Completed",
  "Proof submitted",
  "Verification",
  "Reward",
] as const;

export function TaskSubmitProgress({
  submitted,
  verified = false,
  issued = false,
}: {
  submitted: boolean;
  verified?: boolean;
  issued?: boolean;
}) {
  const current = issued ? 4 : verified ? 3 : 2;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="label">
          Progress
        </p>
        <p className="text-xs text-foreground/40">
          {issued
            ? "Reward issued"
            : verified
              ? "Verified — reward not issued"
              : submitted
                ? "Pending verification"
                : "Completed — proof required"}
        </p>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{
            width: issued
              ? "100%"
              : verified
                ? "75%"
                : submitted
                  ? "50%"
                  : "25%",
          }}
        />
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {stages.map((stage, index) => {
          const step = index + 1;
          const active = current === step;
          const done =
            step < current ||
            (issued && step === 4) ||
            (verified && !issued && step === 3) ||
            (submitted && !verified && step === 2);

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
