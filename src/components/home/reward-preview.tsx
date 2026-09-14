import Link from "next/link";
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
            eyebrow="Rewards"
            title="Work, and earn stocks."
            description="These amounts and tickers are the catalog RewardOffer on each task. Settlement is not live."
          />
        </Reveal>
        <Reveal className="mt-12">
          <ul className="divide-y divide-white/8 border-y border-white/8">
            {items.map((item) => (
              <li key={item.taskId} className="reward-row">
                <Link
                  href={`/tasks/${item.taskId}`}
                  className="flex flex-col gap-3 py-6 transition-colors hover:text-accent sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="label">{item.companyName}</p>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {item.title}
                    </p>
                  </div>
                  <RewardBadge offer={item.offer} example={false} motion />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </PageContainer>
    </section>
  );
}
