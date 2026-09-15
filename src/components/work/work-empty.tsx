import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

const ghosts = [
  { company: "Strava", title: "Complete and document a 10 km run", status: "In progress" },
  { company: "NVIDIA", title: "Create an NVIDIA DLSS explainer", status: "Proof pending" },
];

export function WorkEmpty() {
  return (
    <section className="pb-28">
      <PageContainer>
        <div className="grid gap-4">
          {ghosts.map((row) => (
            <div
              key={row.title}
              className="ghost-row glass-tile flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="label">{row.company}</p>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  {row.title}
                </p>
              </div>
              <p className="text-sm font-medium">{row.status}</p>
            </div>
          ))}
          <div className="glass-panel px-6 py-12 text-center md:px-10">
            <p className="label">No work yet</p>
            <h2 className="heading mx-auto mt-4 max-w-xl text-3xl text-foreground md:text-4xl">
              You haven&apos;t started any tasks yet.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-foreground/68">
              Started tasks land here. Proof stays pending until review.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/tasks">Browse tasks</Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
