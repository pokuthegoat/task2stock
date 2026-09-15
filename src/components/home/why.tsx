import { FlowVisual } from "@/components/home/flow-visual";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const points = [
  {
    title: "Do useful tasks",
    copy: "Companies, brands, and communities post real-world or online work. You pick a task and complete the requirement.",
  },
  {
    title: "Earn ownership-oriented rewards",
    copy: "Each task carries a tokenized stock reward — an amount and a ticker from the catalog, not a cash payout.",
  },
  {
    title: "Build your reward portfolio",
    copy: "Issued rewards collect with your account over time. This is a record of granted rewards, not a performance forecast.",
  },
];

export function Why() {
  return (
    <section className="section-base py-16 md:py-24">
      <PageContainer>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Why Task2Stock"
            title="Work that is meant to become ownership."
            description="The idea is simple. Do the task. Earn a stock-oriented reward."
          />
        </Reveal>

        <Reveal className="mt-14">
          <div className="glass-panel px-6 py-10 md:px-12 md:py-12">
            <FlowVisual />
            <hr className="hairline my-10" />
            <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
              {points.map((point, index) => (
                <li key={point.title} className="text-center md:text-left">
                  <p className="label">{String(index + 1).padStart(2, "0")}</p>
                  <h3 className="heading mt-4 text-2xl text-foreground">
                    {point.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-foreground/58">
                    {point.copy}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </PageContainer>
    </section>
  );
}
