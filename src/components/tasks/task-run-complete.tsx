import { Button } from "@/components/ui/button";

export function TaskRunComplete({ taskId }: { taskId: string }) {
  return (
    <div className="border-t border-white/8 pt-8">
      <p className="label">Complete</p>
      <h2 className="heading mt-3 text-3xl text-foreground">
        This task is marked complete.
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-6 text-foreground/58">
        The work is ready for proof. Proof is required before a reward can be
        issued. Marking complete does not start review or issue stock.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={`/tasks/${taskId}/submit`}>Continue</Button>
        <Button href="/tasks" variant="secondary">
          Back to tasks
        </Button>
      </div>
    </div>
  );
}
