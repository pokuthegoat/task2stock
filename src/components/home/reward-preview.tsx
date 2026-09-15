import { GlowLink } from "@/components/ui/glow-link";
import { RewardBadge } from "@/components/ui/reward-badge";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeRewardPreview } from "@/lib/data";

export function RewardPreview({ items }: { items: HomeRewardPreview[] }) {
  return (
    <section className="section-base py-16 md:py-24">
      <PageContainer>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Rewards"
            title="Work, and earn stocks."
            description="Amounts and tickers from each task. Proof stays pending until review."
          />
        </Reveal>
        <Reveal className="mt-14">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.taskId} className="reward-row">
                <GlowLink
                  href={`/tasks/${item.taskId}`}
                  className="glass-tile glass-tile-hover flex h-full flex-col items-center p-7 text-center"
                  contentClassName="relative z-[1] flex h-full flex-col items-center"
                >
                  <p className="label">{item.companyName}</p>
                  <p className="mt-3 flex-1 text-lg font-semibold leading-7 tracking-tight text-foreground">
                    {item.title}
                  </p>
                  <hr className="hairline my-6 w-full" />
                  <span className="text-xl">
                    <RewardBadge offer={item.offer} example={false} motion />
                  </span>
                </GlowLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </PageContainer>
    </section>
  );
}
