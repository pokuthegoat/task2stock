import { HeroLoop } from "@/components/home/hero-loop";
import { HeroVideo } from "@/components/home/hero-video";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export function Hero() {
  return (
    <section className="section-hero relative flex min-h-[82svh] items-center overflow-x-clip pb-20 pt-10 md:min-h-[88svh] md:pb-28 md:pt-14">
      <HeroVideo />
      <PageContainer className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:gap-16">
          <div>
            <span className="glass-chip inline-flex px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70">
              Task2Stock
            </span>
            <h1 className="display mt-7 max-w-4xl text-5xl text-foreground sm:text-6xl md:text-7xl lg:text-[5.4rem]">
              Do tasks.
              <br />
              Earn stocks.
            </h1>
            <p className="mt-7 max-w-xl text-xl font-medium leading-8 text-foreground/82 sm:text-2xl sm:leading-9">
              Turn what you do into ownership.
            </p>
            <p className="mt-5 max-w-lg text-base leading-7 text-foreground/65">
              Complete real-world tasks from companies, brands, and communities.
              The intended reward is tokenized stock.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="/tasks" size="lg" className="w-full sm:w-auto">
                Start earning
              </Button>
              <Button
                href="#how-it-works"
                variant="secondary"
                size="lg"
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
