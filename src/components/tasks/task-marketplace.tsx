"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  emptyMarketplaceQuery,
  marketplaceHref,
  marketplaceQueryIsActive,
  marketplaceSorts,
  parseRewardRangeId,
  taskCategories,
  taskDifficulties,
  taskTimeBuckets,
  type MarketplaceQuery,
  type MarketplaceSort,
  type RewardAmountRange,
  type TaskCategory,
  type TaskDifficulty,
  type TaskTimeBucket,
  type TaskView,
} from "@/lib/data";
import { TaskCard } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { Select } from "@/components/ui/select";

const sortLabels: Record<MarketplaceSort, string> = {
  newest: "Newest",
  reward: "Highest reward",
  shortest: "Shortest task",
};

export function TaskMarketplace({
  results,
  tickers,
  ranges,
  query,
}: {
  results: TaskView[];
  tickers: string[];
  ranges: RewardAmountRange[];
  query: MarketplaceQuery;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(query.q);
  const rewardOptions = useMemo(() => {
    if (query.reward && !ranges.some((range) => range.id === query.reward?.id)) {
      return [...ranges, query.reward];
    }

    return ranges;
  }, [query.reward, ranges]);

  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();

      if (next === query.q) {
        return;
      }

      write({ ...query, q: next }, "replace");
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query, searchInput]);

  function write(next: MarketplaceQuery, mode: "push" | "replace") {
    const href = marketplaceHref(next);

    if (mode === "replace") {
      router.replace(href, { scroll: false });
      return;
    }

    router.push(href, { scroll: false });
  }

  function patch(partial: Partial<MarketplaceQuery>) {
    write({ ...query, ...partial }, "push");
  }

  function clearFilters() {
    setSearchInput("");
    write(emptyMarketplaceQuery, "push");
  }

  return (
    <section className="pb-24 pt-8 md:pb-32">
      <PageContainer>
        <div className="glass-panel p-6 md:p-8">
          <label className="block">
            <span className="label">Search</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title, company, description, or requirement"
              className="field-input mt-2"
            />
          </label>

          <hr className="hairline my-6" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              id="category"
              label="Category"
              value={query.category}
              onChange={(value) =>
                patch({ category: value as "All" | TaskCategory })
              }
            >
              <option value="All">All categories</option>
              {taskCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              id="ticker"
              label="Reward stock"
              value={query.ticker}
              onChange={(value) => patch({ ticker: value })}
            >
              <option value="All">All stocks</option>
              {tickers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              id="reward"
              label="Reward amount"
              value={query.reward?.id ?? "All"}
              onChange={(value) =>
                patch({ reward: parseRewardRangeId(value) })
              }
            >
              <option value="All">Any amount</option>
              {rewardOptions.map((range) => (
                <option key={range.id} value={range.id}>
                  {range.label}
                </option>
              ))}
            </Select>

            <Select
              id="time"
              label="Estimated time"
              value={query.timeBucket}
              onChange={(value) =>
                patch({
                  timeBucket: value as "All" | TaskTimeBucket,
                })
              }
            >
              <option value="All">Any time</option>
              {taskTimeBuckets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              id="difficulty"
              label="Difficulty"
              value={query.difficulty}
              onChange={(value) =>
                patch({
                  difficulty: value as "All" | TaskDifficulty,
                })
              }
            >
              <option value="All">All levels</option>
              {taskDifficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              id="sort"
              label="Sort"
              value={query.sort}
              onChange={(value) =>
                patch({ sort: value as MarketplaceSort })
              }
            >
              {marketplaceSorts.map((item) => (
                <option key={item} value={item}>
                  {sortLabels[item]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 px-1">
          <p className="text-sm font-medium text-foreground/48">
            {results.length} {results.length === 1 ? "task" : "tasks"}
          </p>
          {marketplaceQueryIsActive(query) ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-foreground/62 transition-colors hover:text-foreground"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {results.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow="No matches"
            title="No tasks for that search."
            description="Try another title, company, description, or requirement — or clear the filters to see the full catalog."
          >
            <Button onClick={clearFilters}>Clear filters</Button>
          </EmptyState>
        )}
      </PageContainer>
    </section>
  );
}
