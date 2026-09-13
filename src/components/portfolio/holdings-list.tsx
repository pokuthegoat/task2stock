import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatHoldingStatus, formatUsd, listPortfolioHoldings } from "@/lib/data";

export function HoldingsList() {
  const holdings = listPortfolioHoldings();

  return (
    <section className="pt-14">
      <PageContainer>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Holdings"
            title="Positions"
          />
          <p className="max-w-sm text-sm leading-6 text-foreground/48">
            Tokenized stock from completed tasks. Not real balances.
          </p>
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-[22px] border border-white/8 md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs font-medium uppercase tracking-[0.14em] text-foreground/40">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Ticker</th>
                <th className="px-6 py-4 font-medium">Value</th>
                <th className="px-6 py-4 font-medium">Source task</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.ticker} className="border-t border-white/8">
                  <td className="px-6 py-5 font-medium text-foreground">
                    {holding.name}
                  </td>
                  <td className="px-6 py-5 font-medium text-foreground/80">
                    {holding.ticker}
                  </td>
                  <td className="px-6 py-5 font-medium text-accent">
                    {formatUsd(holding.valueCents)}
                  </td>
                  <td className="px-6 py-5 text-foreground/62">
                    {holding.sourceTaskTitle}
                  </td>
                  <td className="px-6 py-5 text-foreground/45">
                    {formatHoldingStatus(holding.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 divide-y divide-white/8 border-y border-white/8 md:hidden">
          {holdings.map((holding) => (
            <article key={holding.ticker} className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label">{holding.name}</p>
                  <p className="mt-2 text-sm font-medium text-foreground/80">
                    {holding.ticker}
                  </p>
                </div>
                <p className="text-sm font-medium text-accent">
                  {formatUsd(holding.valueCents)}
                </p>
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/62">
                {holding.sourceTaskTitle}
              </p>
              <p className="mt-2 text-xs text-foreground/40">
                {formatHoldingStatus(holding.status)}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
