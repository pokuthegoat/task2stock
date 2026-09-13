/**
 * Client-safe DAL surface: read models, formatters, and example books.
 * Catalog reads live in `@/lib/data/catalog` (server-only).
 */

export type {
  ExamplePortfolioView,
  HomeActivityView,
  HomeHoldingView,
  HomeRewardPreview,
  PortfolioHoldingView,
  TaskCategory,
  TaskDifficulty,
  TaskEarningView,
  TaskRewardOffer,
  TaskTimeBucket,
  TaskView,
  WorkItemView,
  WorkStatus,
} from "@/lib/data/types";

export {
  formatHoldingStatus,
  formatRewardOffer,
  formatUsd,
  formatUsdCompact,
} from "@/lib/data/format";

export {
  applyMarketplaceQuery,
  emptyMarketplaceQuery,
  listRewardAmountRanges,
  marketplaceHref,
  marketplaceQueryIsActive,
  marketplaceSorts,
  parseMarketplaceQuery,
  parseRewardRangeId,
} from "@/lib/data/marketplace";
export type {
  MarketplaceQuery,
  MarketplaceSort,
  RewardAmountRange,
} from "@/lib/data/marketplace";

export {
  taskCategories,
  taskDifficulties,
  taskTimeBuckets,
} from "@/lib/data/task-facets";

export {
  deriveWorkStatus,
  workActionLabel,
  workHref,
  workStatusLabels,
} from "@/lib/data/work";

export { getDataSource } from "@/lib/data/config";

export {
  getExamplePortfolio,
  listHomeActivity,
  listHomeHoldings,
  listPortfolioHoldings,
  listTaskEarnings,
} from "@/lib/data/fixtures-source";

