import type { Metadata } from "next";
import Link from "next/link";
import { HoldingsList } from "@/components/portfolio/holdings-list";
import { PortfolioEmpty } from "@/components/portfolio/portfolio-empty";
import { PortfolioSummary } from "@/components/portfolio/portfolio-summary";
import { TaskEarnings } from "@/components/portfolio/task-earnings";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { getPortfolioViewer } from "@/lib/auth/portfolio-access";
import { listIssuedTaskEarnings } from "@/lib/data/participation";

export const metadata: Metadata = {
  title: "Portfolio — Task2Stock",
  description:
    "An example portfolio of tokenized stock rewards from completed tasks. Preview only — not real holdings.",
};

export default async function PortfolioPage({
  searchParams,
}: PageProps<"/portfolio">) {
  const { empty } = await searchParams;
  const isEmpty = empty === "1";
  const viewer = await getPortfolioViewer();
  const issued =
    viewer.kind === "user"
      ? await listIssuedTaskEarnings(viewer.user.id)
      : [];

  return (
    <main id="main" className="section-base flex-1">
      <section className="pt-16 pb-10 md:pt-24 md:pb-12">
        <PageContainer>
          <SectionHeading
            as="h1"
            eyebrow={viewer.kind === "user" ? "Your book" : "Preview"}
            title="Your portfolio"
            description={
              viewer.kind === "user"
                ? `Completed tasks can become tokenized stock ownership. This book is scoped to ${viewer.user.name} once live rewards exist.`
                : "Completed tasks can become tokenized stock ownership. This page is an example book — not live holdings, balances, or settlement."
            }
          />
          <p className="mt-6">
            <Link
              href={isEmpty ? "/portfolio" : "/portfolio?empty=1"}
              className="text-sm font-medium text-foreground/45 transition-colors hover:text-foreground"
            >
              {isEmpty
                ? "View example portfolio"
                : "View empty portfolio preview"}
            </Link>
          </p>
        </PageContainer>
      </section>

      {isEmpty ? (
        <PortfolioEmpty />
      ) : (
        <>
          <PortfolioSummary />
          <HoldingsList />
          <TaskEarnings issued={issued} />
        </>
      )}
    </main>
  );
}
