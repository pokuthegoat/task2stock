import { listTasks } from "../src/lib/data/fixtures-source";
import {
  applyMarketplaceQuery,
  emptyMarketplaceQuery,
  listRewardAmountRanges,
  parseMarketplaceQuery,
} from "../src/lib/data/marketplace";

const tasks = listTasks();

function ids(list: typeof tasks) {
  return list.map((task) => task.id);
}

function main() {
  const ranges = listRewardAmountRanges(
    tasks.map((task) => task.reward.amountCents),
  );

  if (
    ranges.length !== 3 ||
    ranges[0]?.id !== "800-1200" ||
    ranges[1]?.id !== "1500-2000" ||
    ranges[2]?.id !== "2500-3000"
  ) {
    throw new Error(`Unexpected reward ranges: ${JSON.stringify(ranges)}`);
  }

  const dlss = applyMarketplaceQuery(tasks, {
    ...emptyMarketplaceQuery,
    q: "DLSS",
  });

  if (ids(dlss).join() !== "product-video") {
    throw new Error("Search must match description/requirement text.");
  }

  const retail = applyMarketplaceQuery(tasks, {
    ...emptyMarketplaceQuery,
    category: "Retail",
  });

  if (retail.some((task) => task.featured) || retail.length !== 2) {
    throw new Error("Retail filter must hide featured tasks and keep two listings.");
  }

  const highest = applyMarketplaceQuery(tasks, {
    ...emptyMarketplaceQuery,
    sort: "reward",
  });

  if (highest[0]?.id !== "civic-workshop" || highest[0]?.reward.amountCents !== 3000) {
    throw new Error("Highest reward must start with $30 civic-workshop.");
  }

  const shortest = applyMarketplaceQuery(tasks, {
    ...emptyMarketplaceQuery,
    sort: "shortest",
  });

  if (shortest[0]?.timeBucket !== "Under 2 hours") {
    throw new Error("Shortest sort must start with Under 2 hours.");
  }

  const newest = applyMarketplaceQuery(tasks, emptyMarketplaceQuery);

  if (ids(newest).join() !== ids(tasks).join()) {
    throw new Error("Newest must keep catalog sortOrder.");
  }

  const parsed = parseMarketplaceQuery(
    new URLSearchParams(
      "q=photos&category=Retail&ticker=MSFT&time=Under+2+hours&difficulty=Easy&reward=800-1200&sort=reward",
    ),
  );

  if (
    parsed.q !== "photos" ||
    parsed.category !== "Retail" ||
    parsed.ticker !== "MSFT" ||
    parsed.timeBucket !== "Under 2 hours" ||
    parsed.difficulty !== "Easy" ||
    parsed.reward?.id !== "800-1200" ||
    parsed.sort !== "reward"
  ) {
    throw new Error("URL query parsing failed.");
  }

  console.log("Marketplace findability checks passed.");
  console.log({
    ranges: ranges.map((range) => range.label),
    dlss: ids(dlss),
    retail: ids(retail),
    highest: ids(highest).slice(0, 3),
    shortest: ids(shortest).slice(0, 2),
  });
}

main();
