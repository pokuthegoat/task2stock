import { GrowthVisual } from "@/components/home/growth-visual";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  return (
    <section className="section-base pb-24 pt-16 md:pb-32 md:pt-24">
      <PageContainer>
        <Reveal>
          <div className="py-4 text-center md:py-8">
            <div className="mb-10 flex justify-center">
              <GrowthVisual />
            </div>
            <p className="label">Task2Stock</p>
            <h2 className="display mx-auto mt-5 max-w-3xl text-4xl text-foreground md:text-6xl">
              Ready to start earning?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-foreground/55">
              Browse the marketplace and pick a task.
            </p>
            <div className="mt-10 flex justify-center">
              <Button href="/tasks">Explore tasks</Button>
            </div>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
