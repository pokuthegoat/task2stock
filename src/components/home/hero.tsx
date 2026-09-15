import { HeroLoop } from "@/components/home/hero-loop";
import { HeroVideo } from "@/components/home/hero-video";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export function Hero() {
  return (
    <section className="section-hero relative flex min-h-[84svh] items-center overflow-x-clip pb-20 pt-16 md:min-h-[90svh] md:pb-28 md:pt-20">
      <HeroVideo />
      <PageContainer className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(260px,400px)] lg:gap-16">
          <div>
            <p className="label">Task2Stock</p>
            <h1 className="display mt-6 max-w-4xl text-5xl text-foreground sm:text-6xl md:text-7xl lg:text-[5.4rem]">
              Do tasks.
              <br />
              Earn stocks.
            </h1>
            <p className="mt-7 max-w-xl text-xl font-medium leading-8 text-foreground/80 sm:text-2xl sm:leading-9">
              Turn what you do into ownership.
            </p>
            <p className="mt-5 max-w-lg text-base leading-7 text-foreground/65">
              Complete real-world tasks from companies, brands, and communities.
              The intended reward is tokenized stock. Settlement is not live.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/tasks" className="w-full sm:w-auto">
                Start earning
              </Button>
              <Button
                href="#how-it-works"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                How it works
              </Button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <HeroLoop />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
