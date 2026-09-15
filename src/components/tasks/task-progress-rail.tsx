const steps = ["Task", "Proof", "Review", "Reward"] as const;

export function TaskProgressRail({
  current,
}: {
  current: 0 | 1 | 2 | 3;
}) {
  return (
    <ol className="task-rail" aria-label="Task progress">
      {steps.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "current" : "upcoming";

        return (
          <li key={step} data-state={state}>
            <span className="task-rail-dot" aria-hidden="true" />
            <span className="task-rail-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}
