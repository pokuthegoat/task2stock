import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

const ghosts = [
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "GOOGL", name: "Alphabet" },
];

export function PortfolioEmpty() {
  return (
    <section className="pb-28">
      <PageContainer>
        <div className="glass-panel overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-medium uppercase tracking-[0.14em] text-foreground/48">
                <tr>
                  <th className="px-6 py-5 font-medium">Company</th>
                  <th className="px-6 py-5 font-medium">Ticker</th>
                  <th className="px-6 py-5 font-medium">Value</th>
                  <th className="px-6 py-5 font-medium">Source task</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ghosts.map((row) => (
                  <tr key={row.ticker} className="ghost-row border-t border-white/8">
                    <td className="px-6 py-5 font-medium">{row.name}</td>
                    <td className="px-6 py-5 font-medium">{row.ticker}</td>
                    <td className="px-6 py-5 font-medium text-accent">—</td>
                    <td className="px-6 py-5">Fills after verification</td>
                    <td className="px-6 py-5">Not issued</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-5 md:hidden">
            {ghosts.map((row) => (
              <article key={row.ticker} className="ghost-row glass-tile p-5">
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="label">{row.name}</p>
                    <p className="mt-2 text-sm font-medium">{row.ticker}</p>
                  </div>
                  <p className="text-sm font-medium text-accent">—</p>
                </div>
                <p className="mt-4 text-sm">Fills after verification</p>
              </article>
            ))}
          </div>

          <div className="border-t border-white/8 px-6 py-12 text-center md:px-10">
            <p className="label">Portfolio</p>
            <h2 className="heading mx-auto mt-4 max-w-xl text-3xl text-foreground md:text-4xl">
              Your portfolio is empty
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-foreground/68">
              Holdings appear here after proof is reviewed. Nothing is issued
              until then.
            </p>
            <div className="mt-8 flex justify-center">
              <Button href="/tasks">Explore tasks</Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
