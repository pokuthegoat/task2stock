import { Stat } from "@/components/ui/stat";
import { PageContainer } from "@/components/ui/page-container";
import { formatUsd, getExamplePortfolio } from "@/lib/data";

const portfolio = getExamplePortfolio();

const stats = [
  {
    label: "Portfolio value",
    value: formatUsd(portfolio.totalValueCents),
    note: "Illustrative total",
  },
  {
    label: "Earned from tasks",
    value: formatUsd(portfolio.totalEarnedCents),
    note: "From completed tasks",
  },
  {
    label: "Completed tasks",
    value: String(portfolio.completedTaskCount),
    note: "Recorded completions",
  },
  {
    label: "Performance",
    value: portfolio.performanceCaption,
    note: "Not live market data",
    accent: true,
  },
];

export function PortfolioSummary() {
  return (
    <section>
      <PageContainer className="grid gap-8 border-y border-white/8 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Stat
            key={stat.label}
            label={stat.label}
            value={stat.value}
            note={stat.note}
            accent={stat.accent}
          />
        ))}
      </PageContainer>
    </section>
  );
}
