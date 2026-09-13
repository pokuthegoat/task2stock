import { HeroMedia } from "@/components/home/hero-media";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export function Hero() {
  return (
    <section className="section-hero relative overflow-hidden pb-20 pt-20 md:pb-28 md:pt-28">
      <HeroMedia />
      <PageContainer className="relative">
        <p className="label">Task2Stock</p>
        <h1 className="display mt-6 max-w-4xl text-5xl text-foreground sm:text-6xl md:text-7xl lg:text-[5.4rem]">
          Do tasks.
          <br />
          Earn stocks.
        </h1>
        <p className="mt-7 max-w-xl text-xl font-medium leading-8 text-foreground/72 sm:text-2xl sm:leading-9">
          Turn what you do into ownership.
        </p>
        <p className="mt-5 max-w-lg text-base leading-7 text-foreground/55">
          Complete real-world tasks from companies, brands, and communities.
          The intended reward is tokenized stock. Settlement is not live.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href="/tasks" className="w-full sm:w-auto">
            Start earning
          </Button>
          <Button href="#how-it-works" variant="secondary" className="w-full sm:w-auto">
            How it works
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
