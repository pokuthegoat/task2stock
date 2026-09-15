import { GrowthVisual } from "@/components/home/growth-visual";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="section-base pb-20 pt-16 md:pb-28 md:pt-24">
      <PageContainer>
        <Reveal>
          <div className="glass-panel px-6 py-16 text-center md:px-12 md:py-20">
            <div className="flex justify-center">
              <GrowthVisual />
            </div>
            <p className="label mt-10">Task2Stock</p>
            <h2 className="display mx-auto mt-5 max-w-3xl text-4xl text-foreground md:text-6xl">
              Ready to start earning?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-foreground/60">
              Browse the marketplace and pick a task.
            </p>
            <div className="mt-10 flex justify-center">
              <Button href="/tasks" size="lg">
                Explore tasks
              </Button>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
