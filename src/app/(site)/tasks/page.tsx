import type { Metadata } from "next";
import { FeaturedOpportunities } from "@/components/tasks/featured-opportunities";
import { TaskMarketplace } from "@/components/tasks/task-marketplace";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { listTaskTickers, listTasks } from "@/lib/data/catalog";
import {
  applyMarketplaceQuery,
  listRewardAmountRanges,
  parseMarketplaceQuery,
} from "@/lib/data/marketplace";

export const metadata: Metadata = {
  title: "Tasks — Task2Stock",
  description:
    "Browse tasks from companies, brands, and communities. Complete the work and earn tokenized stock rewards.",
};

export default async function TasksPage({
  searchParams,
}: PageProps<"/tasks">) {
  const params = await searchParams;
  const [tasks, tickers] = await Promise.all([
    listTasks(),
    listTaskTickers(),
  ]);
  const query = parseMarketplaceQuery(params);
  const results = applyMarketplaceQuery(tasks, query);
  const featured = results.filter((task) => task.featured);
  const ranges = listRewardAmountRanges(
    tasks.map((task) => task.reward.amountCents),
  );

  return (
    <main id="main" className="section-base flex-1">
      <section className="pb-12 pt-10 md:pb-14 md:pt-16">
        <PageContainer>
          <SectionHeading
            as="h1"
            align="center"
            eyebrow="Marketplace"
            title="Tasks"
            description="Choose a task, submit proof, and wait for review. Stock is issued only after verification."
          />
        </PageContainer>
      </section>

      {featured.length > 0 ? (
        <FeaturedOpportunities tasks={featured} />
      ) : null}

      <TaskMarketplace
        results={results}
        tickers={tickers}
        ranges={ranges}
        query={query}
      />
    </main>
  );
}
