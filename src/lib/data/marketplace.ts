import { formatUsdCompact } from "@/lib/data/format";
import {
  taskCategories,
  taskDifficulties,
  taskTimeBuckets,
} from "@/lib/data/task-facets";
import type {
  TaskCategory,
  TaskDifficulty,
  TaskTimeBucket,
  TaskView,
} from "@/lib/data/types";

export const marketplaceSorts = ["newest", "reward", "shortest"] as const;

export type MarketplaceSort = (typeof marketplaceSorts)[number];

export type RewardAmountRange = {
  id: string;
  label: string;
  minCents: number;
  maxCents: number;
};

export type MarketplaceQuery = {
  q: string;
  category: "All" | TaskCategory;
  ticker: string;
  timeBucket: "All" | TaskTimeBucket;
  difficulty: "All" | TaskDifficulty;
  reward: RewardAmountRange | null;
  sort: MarketplaceSort;
};

const defaultQuery: MarketplaceQuery = {
  q: "",
  category: "All",
  ticker: "All",
  timeBucket: "All",
  difficulty: "All",
  reward: null,
  sort: "newest",
};

export function listRewardAmountRanges(
  amountsCents: number[],
): RewardAmountRange[] {
  const unique = [...new Set(amountsCents)]
    .filter((amount) => Number.isFinite(amount) && amount >= 0)
    .sort((left, right) => left - right);

  if (unique.length === 0) {
    return [];
  }

  const bandCount = Math.min(3, unique.length);
  const size = Math.ceil(unique.length / bandCount);
  const ranges: RewardAmountRange[] = [];

  for (let index = 0; index < unique.length; index += size) {
    const band = unique.slice(index, index + size);
    const minCents = band[0];
    const maxCents = band[band.length - 1];
    ranges.push({
      id: `${minCents}-${maxCents}`,
      label:
        minCents === maxCents
          ? formatUsdCompact(minCents)
          : `${formatUsdCompact(minCents)}–${formatUsdCompact(maxCents)}`,
      minCents,
      maxCents,
    });
  }

  return ranges;
}

export function parseRewardRangeId(value: string | null): RewardAmountRange | null {
  if (!value) {
    return null;
  }

  const match = /^(\d+)-(\d+)$/.exec(value);

  if (!match) {
    return null;
  }

  const minCents = Number(match[1]);
  const maxCents = Number(match[2]);

  if (!Number.isFinite(minCents) || !Number.isFinite(maxCents) || minCents > maxCents) {
    return null;
  }

  return {
    id: `${minCents}-${maxCents}`,
    label:
      minCents === maxCents
        ? formatUsdCompact(minCents)
        : `${formatUsdCompact(minCents)}–${formatUsdCompact(maxCents)}`,
    minCents,
    maxCents,
  };
}

function asCategory(value: string | null): MarketplaceQuery["category"] {
  if (value && taskCategories.includes(value as TaskCategory)) {
    return value as TaskCategory;
  }

  return "All";
}

function asTimeBucket(value: string | null): MarketplaceQuery["timeBucket"] {
  if (value && taskTimeBuckets.includes(value as TaskTimeBucket)) {
    return value as TaskTimeBucket;
  }

  return "All";
}

function asDifficulty(value: string | null): MarketplaceQuery["difficulty"] {
  if (value && taskDifficulties.includes(value as TaskDifficulty)) {
    return value as TaskDifficulty;
  }

  return "All";
}

function asSort(value: string | null): MarketplaceSort {
  if (value && marketplaceSorts.includes(value as MarketplaceSort)) {
    return value as MarketplaceSort;
  }

  return "newest";
}

export function parseMarketplaceQuery(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): MarketplaceQuery {
  const read = (key: string) => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }

    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  };

  return {
    q: (read("q") ?? "").trim(),
    category: asCategory(read("category")),
    ticker: read("ticker") || "All",
    timeBucket: asTimeBucket(read("time")),
    difficulty: asDifficulty(read("difficulty")),
    reward: parseRewardRangeId(read("reward")),
    sort: asSort(read("sort")),
  };
}

export function marketplaceQueryToSearchParams(query: MarketplaceQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set("q", query.q);
  if (query.category !== "All") params.set("category", query.category);
  if (query.ticker !== "All") params.set("ticker", query.ticker);
  if (query.timeBucket !== "All") params.set("time", query.timeBucket);
  if (query.difficulty !== "All") params.set("difficulty", query.difficulty);
  if (query.reward) params.set("reward", query.reward.id);
  if (query.sort !== "newest") params.set("sort", query.sort);

  return params;
}

export function marketplaceHref(query: MarketplaceQuery): string {
  const params = marketplaceQueryToSearchParams(query);
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

export function marketplaceQueryIsActive(query: MarketplaceQuery): boolean {
  return (
    query.q.length > 0 ||
    query.category !== "All" ||
    query.ticker !== "All" ||
    query.timeBucket !== "All" ||
    query.difficulty !== "All" ||
    query.reward !== null ||
    query.sort !== "newest"
  );
}

export function filterMarketplaceTasks(
  tasks: TaskView[],
  query: MarketplaceQuery,
): TaskView[] {
  const needle = query.q.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesQuery =
      needle.length === 0 ||
      task.title.toLowerCase().includes(needle) ||
      task.company.name.toLowerCase().includes(needle) ||
      task.description.toLowerCase().includes(needle) ||
      task.requirement.toLowerCase().includes(needle);
    const matchesCategory =
      query.category === "All" || task.category === query.category;
    const matchesTicker =
      query.ticker === "All" || task.reward.ticker === query.ticker;
    const matchesTime =
      query.timeBucket === "All" || task.timeBucket === query.timeBucket;
    const matchesDifficulty =
      query.difficulty === "All" || task.difficulty === query.difficulty;
    const matchesReward =
      !query.reward ||
      (task.reward.amountCents >= query.reward.minCents &&
        task.reward.amountCents <= query.reward.maxCents);

    return (
      matchesQuery &&
      matchesCategory &&
      matchesTicker &&
      matchesTime &&
      matchesDifficulty &&
      matchesReward
    );
  });
}

export function sortMarketplaceTasks(
  tasks: TaskView[],
  catalog: TaskView[],
  sort: MarketplaceSort,
): TaskView[] {
  const catalogIndex = new Map(catalog.map((task, index) => [task.id, index]));

  return [...tasks].sort((left, right) => {
    if (sort === "reward") {
      const byAmount = right.reward.amountCents - left.reward.amountCents;
      if (byAmount !== 0) return byAmount;
    }

    if (sort === "shortest") {
      const byTime =
        taskTimeBuckets.indexOf(left.timeBucket) -
        taskTimeBuckets.indexOf(right.timeBucket);
      if (byTime !== 0) return byTime;
    }

    return (catalogIndex.get(left.id) ?? 0) - (catalogIndex.get(right.id) ?? 0);
  });
}

export function applyMarketplaceQuery(
  tasks: TaskView[],
  query: MarketplaceQuery,
): TaskView[] {
  return sortMarketplaceTasks(filterMarketplaceTasks(tasks, query), tasks, query.sort);
}

export { defaultQuery as emptyMarketplaceQuery };
