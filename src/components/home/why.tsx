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
            eyebrow="Why Task2Stock"
            title="Work that is meant to become ownership."
            description="The idea is simple. Do the task. Earn a stock-oriented reward."
          />
        </Reveal>
        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {points.map((point, index) => (
            <li key={point.title}>
              <Reveal delay={index * 90}>
                <p className="label">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="heading mt-4 text-2xl text-foreground">
                  {point.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-foreground/55">
                  {point.copy}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </PageContainer>
    </section>
  );
}
