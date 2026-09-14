/**
 * Example fixtures only. Imported by the DAL — not by pages or components.
 * No persistence. Values match the previous denormalized example catalog.
 */

import type {
  Company,
  CompanyId,
  Holding,
  PortfolioView,
  Reward,
  RewardOffer,
  Task,
  TaskId,
  TaskLine,
  UserId,
} from "@/lib/domain/model";

export const EXAMPLE_HOME_USER_ID: UserId = "example-maya";
export const EXAMPLE_PORTFOLIO_USER_ID: UserId = "example-preview";

export const companies: Company[] = [
  { id: "northstar-athletics", name: "Northstar Athletics" },
  { id: "halo-home", name: "Halo Home" },
  { id: "open-markets-collective", name: "Open Markets Collective" },
  { id: "lumen-retail", name: "Lumen Retail" },
  { id: "meridian-audio", name: "Meridian Audio" },
  { id: "atlas-civic", name: "Atlas Civic" },
];

type TaskSeed = {
  id: TaskId;
  companyId: CompanyId;
  title: string;
  description: string;
  category: Task["category"];
  difficulty: Task["difficulty"];
  estimate: string;
  timeBucket: Task["timeBucket"];
  reward: RewardOffer;
  featured: boolean;
  onHome: boolean;
  requirement: string;
  steps: string[];
  instructions: string[];
  eligibility: string[];
};

const taskSeeds: TaskSeed[] = [
  {
    id: "run-20km",
    companyId: "northstar-athletics",
    title: "Run 20 kilometers this month",
    description: "A month of outdoor running, logged as you go.",
    category: "Fitness",
    difficulty: "Moderate",
    estimate: "About 2 weeks",
    timeBucket: "A few weeks",
    reward: { amountCents: 1500, ticker: "NVDA" },
    featured: false,
    onHome: true,
    requirement: "Complete and log 20km of outdoor running.",
    steps: [
      "Plan outdoor runs that add up to 20km.",
      "Complete the distance over the stated window.",
      "Keep a simple log of each run.",
    ],
    instructions: [
      "Run outdoors. Indoor or treadmill distance is outside this example task.",
      "Spread the 20km across the month in sessions you can keep.",
      "Note the date and distance after each run so you can recap the work later.",
    ],
    eligibility: [
      "Able to run outdoors for the full distance.",
      "Can keep a basic written or photo log.",
    ],
  },
  {
    id: "product-video",
    companyId: "halo-home",
    title: "Create a 60-second product video",
    description: "A short film that shows the product in a real home.",
    category: "Creative",
    difficulty: "Moderate",
    estimate: "4–6 hours",
    timeBucket: "A few hours",
    reward: { amountCents: 2500, ticker: "AAPL" },
    featured: true,
    onHome: true,
    requirement: "Film and edit a concise product walkthrough.",
    steps: [
      "Film the product in a real home setting.",
      "Edit the walkthrough down to about 60 seconds.",
      "Export a finished cut ready for review.",
    ],
    instructions: [
      "Film the product in a real home, not a studio set.",
      "Keep the finished cut close to 60 seconds.",
      "Export one file you can hold for a later proof step.",
    ],
    eligibility: [
      "Access to a camera or phone that can record video.",
      "Able to edit a short clip.",
    ],
  },
  {
    id: "community-campaign",
    companyId: "open-markets-collective",
    title: "Complete a community campaign",
    description: "Help a local group tell a clear story about the work they do.",
    category: "Community",
    difficulty: "Moderate",
    estimate: "1 week",
    timeBucket: "About a week",
    reward: { amountCents: 1000, ticker: "COIN" },
    featured: false,
    onHome: true,
    requirement: "Run a local awareness campaign with a short recap.",
    steps: [
      "Choose a local audience and a simple message.",
      "Run the campaign over about a week.",
      "Write a short recap of what you did.",
    ],
    instructions: [
      "Pick one local audience and one clear message.",
      "Run the campaign over about a week.",
      "Keep a short written recap of what you did.",
    ],
    eligibility: [
      "Able to organize a small local or online campaign.",
      "Can write a concise recap.",
    ],
  },
  {
    id: "store-photos",
    companyId: "lumen-retail",
    title: "Photograph an in-store experience",
    description: "A focused store visit to capture merchandising and atmosphere.",
    category: "Retail",
    difficulty: "Easy",
    estimate: "90 minutes",
    timeBucket: "Under 2 hours",
    reward: { amountCents: 1200, ticker: "MSFT" },
    featured: false,
    onHome: true,
    requirement: "Capture eight photos of merchandising and atmosphere.",
    steps: [
      "Visit a Lumen-style retail floor during open hours.",
      "Photograph merchandising, lighting, and atmosphere.",
      "Deliver eight still images.",
    ],
    instructions: [
      "Visit during open hours and stay on the sales floor.",
      "Look for merchandising, lighting, and atmosphere.",
      "Shoot eight still photographs for this example task.",
    ],
    eligibility: [
      "Able to visit a store in person.",
      "Can take and share still photographs.",
    ],
  },
  {
    id: "listening-session",
    companyId: "meridian-audio",
    title: "Record a 90-second listening session",
    description: "Show how the product sounds in your space, then write a short note.",
    category: "Creative",
    difficulty: "Easy",
    estimate: "3 hours",
    timeBucket: "A few hours",
    reward: { amountCents: 1800, ticker: "AAPL" },
    featured: false,
    onHome: false,
    requirement: "Submit one video and a 150-word recap.",
    steps: [
      "Record a 90-second listening session in your space.",
      "Write a 150-word note on what you heard.",
      "Keep the video and note together as one example packet.",
    ],
    instructions: [
      "Record about 90 seconds in a quiet room.",
      "Write about 150 words on what you heard.",
      "Keep the video and the note together as one packet.",
    ],
    eligibility: [
      "Access to a quiet room and a recording device.",
      "Comfortable writing a short recap.",
    ],
  },
  {
    id: "civic-workshop",
    companyId: "atlas-civic",
    title: "Host a neighborhood ownership workshop",
    description:
      "Gather a small group and walk through how local work can become ownership.",
    category: "Community",
    difficulty: "Advanced",
    estimate: "1 week",
    timeBucket: "About a week",
    reward: { amountCents: 3000, ticker: "GOOGL" },
    featured: true,
    onHome: false,
    requirement:
      "Host six or more attendees and submit photos plus a one-page recap.",
    steps: [
      "Invite at least six people to a short workshop.",
      "Walk through the idea that work can become ownership.",
      "Collect photos and write a one-page recap.",
    ],
    instructions: [
      "Invite at least six people to a short session.",
      "Walk through how local work can become ownership.",
      "Take a few photos and write a one-page recap.",
    ],
    eligibility: [
      "Able to host a small in-person or local gathering.",
      "Can document the session with photos and a written recap.",
    ],
  },
  {
    id: "trail-loop",
    companyId: "northstar-athletics",
    title: "Complete a 50km cycling loop",
    description:
      "A longer endurance task for riders who want a larger example position.",
    category: "Fitness",
    difficulty: "Advanced",
    estimate: "About 3 weeks",
    timeBucket: "A few weeks",
    reward: { amountCents: 2000, ticker: "NVDA" },
    featured: false,
    onHome: false,
    requirement: "Ride 50km and share a GPS recap with photos.",
    steps: [
      "Plan a 50km cycling loop.",
      "Complete the ride.",
      "Keep a GPS recap and a few photos from the route.",
    ],
    instructions: [
      "Plan a 50km route you can ride safely.",
      "Complete the loop as one ride if you can.",
      "Keep a GPS recap and a few photos from the route.",
    ],
    eligibility: [
      "Access to a bicycle and a safe route.",
      "Able to record a basic GPS trace.",
    ],
  },
  {
    id: "shelf-study",
    companyId: "lumen-retail",
    title: "Complete an in-aisle shelf study",
    description: "Document placement, lighting, and traffic during one store visit.",
    category: "Retail",
    difficulty: "Easy",
    estimate: "75 minutes",
    timeBucket: "Under 2 hours",
    reward: { amountCents: 800, ticker: "MSFT" },
    featured: false,
    onHome: false,
    requirement: "Visit one location and submit a ten-photo set with captions.",
    steps: [
      "Visit one retail location.",
      "Photograph placement, lighting, and traffic.",
      "Caption a ten-photo set.",
    ],
    instructions: [
      "Visit one location for a single pass.",
      "Photograph placement, lighting, and traffic.",
      "Caption a set of ten photos.",
    ],
    eligibility: [
      "Able to complete one in-store visit.",
      "Can caption photographs clearly.",
    ],
  },
];

function linesFor(
  taskId: TaskId,
  kind: TaskLine["kind"],
  bodies: string[],
): TaskLine[] {
  return bodies.map((body, sortOrder) => ({
    taskId,
    kind,
    sortOrder,
    body,
  }));
}

export const tasks: Task[] = taskSeeds.map(
  ({
    requirement: _requirement,
    steps: _steps,
    instructions: _instructions,
    eligibility: _eligibility,
    ...task
  }) => task,
);

export const taskLines: TaskLine[] = taskSeeds.flatMap((seed) => [
  ...linesFor(seed.id, "requirement", [seed.requirement]),
  ...linesFor(seed.id, "step", seed.steps),
  ...linesFor(seed.id, "instruction", seed.instructions),
  ...linesFor(seed.id, "eligibility", seed.eligibility),
]);

/** Existing catalog tasks shown in the landing reward preview. */
export const homeRewardPreviewFixtures: Array<{ taskId: TaskId }> = [
  { taskId: "run-20km" },
  { taskId: "product-video" },
  { taskId: "community-campaign" },
];

export const homeHoldingFixtures: Array<
  Holding & { allocation: number; fromLabel: string }
> = [
  {
    id: "holding-maya-aapl",
    userId: EXAMPLE_HOME_USER_ID,
    ticker: "AAPL",
    name: "Apple",
    valueCents: 8500,
    sourceTaskId: "product-video",
    status: "preview",
    allocation: 47,
    fromLabel: "Product video",
  },
  {
    id: "holding-maya-nvda",
    userId: EXAMPLE_HOME_USER_ID,
    ticker: "NVDA",
    name: "NVIDIA",
    valueCents: 6240,
    sourceTaskId: "run-20km",
    status: "preview",
    allocation: 34,
    fromLabel: "20km run",
  },
  {
    id: "holding-maya-coin",
    userId: EXAMPLE_HOME_USER_ID,
    ticker: "COIN",
    name: "Coinbase",
    valueCents: 3500,
    sourceTaskId: "community-campaign",
    status: "preview",
    allocation: 19,
    fromLabel: "Community campaign",
  },
];

/**
 * Homepage activity captions. Labels are not always task titles.
 * `Weekend brand recap` has no catalog task — do not invent one.
 */
export const homeActivityFixtures: Array<{
  taskId: TaskId | null;
  label: string;
  amountCents: number;
  ticker: string;
  when: string;
}> = [
  {
    taskId: "product-video",
    label: "Product walkthrough video",
    amountCents: 2500,
    ticker: "AAPL",
    when: "Mar 12",
  },
  {
    taskId: "run-20km",
    label: "20km monthly run",
    amountCents: 1500,
    ticker: "NVDA",
    when: "Mar 4",
  },
  {
    taskId: "community-campaign",
    label: "Neighborhood campaign",
    amountCents: 1000,
    ticker: "COIN",
    when: "Feb 21",
  },
  {
    taskId: null,
    label: "Weekend brand recap",
    amountCents: 800,
    ticker: "NVDA",
    when: "Feb 9",
  },
];

export const examplePortfolioFixture: PortfolioView & {
  performanceCaption: string;
} = {
  userId: EXAMPLE_PORTFOLIO_USER_ID,
  totalValueCents: 21240,
  totalEarnedCents: 11800,
  completedTaskCount: 6,
  performanceCaption: "+3.8%",
};

export const portfolioHoldings: Holding[] = [
  {
    id: "holding-preview-aapl",
    userId: EXAMPLE_PORTFOLIO_USER_ID,
    ticker: "AAPL",
    name: "Apple",
    valueCents: 8500,
    sourceTaskId: "product-video",
    status: "not_settled",
  },
  {
    id: "holding-preview-nvda",
    userId: EXAMPLE_PORTFOLIO_USER_ID,
    ticker: "NVDA",
    name: "NVIDIA",
    valueCents: 6240,
    sourceTaskId: "run-20km",
    status: "not_settled",
  },
  {
    id: "holding-preview-coin",
    userId: EXAMPLE_PORTFOLIO_USER_ID,
    ticker: "COIN",
    name: "Coinbase",
    valueCents: 3500,
    sourceTaskId: "community-campaign",
    status: "not_settled",
  },
  {
    id: "holding-preview-googl",
    userId: EXAMPLE_PORTFOLIO_USER_ID,
    ticker: "GOOGL",
    name: "Alphabet",
    valueCents: 3000,
    sourceTaskId: "civic-workshop",
    status: "not_settled",
  },
];

export const taskEarningFixtures: Array<{
  reward: Reward;
  completedLabel: string;
  statusLabel: string;
}> = [
  {
    reward: {
      id: "reward-product-video",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "product-video",
      submissionId: null,
      amountCents: 2500,
      ticker: "AAPL",
      status: "not_issued",
    },
    completedLabel: "Mar 12",
    statusLabel: "Reward",
  },
  {
    reward: {
      id: "reward-listening-session",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "listening-session",
      submissionId: null,
      amountCents: 1800,
      ticker: "AAPL",
      status: "not_issued",
    },
    completedLabel: "Mar 8",
    statusLabel: "Reward",
  },
  {
    reward: {
      id: "reward-run-20km",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "run-20km",
      submissionId: null,
      amountCents: 1500,
      ticker: "NVDA",
      status: "not_issued",
    },
    completedLabel: "Mar 4",
    statusLabel: "Reward",
  },
  {
    reward: {
      id: "reward-trail-loop",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "trail-loop",
      submissionId: null,
      amountCents: 2000,
      ticker: "NVDA",
      status: "not_issued",
    },
    completedLabel: "Feb 28",
    statusLabel: "Reward",
  },
  {
    reward: {
      id: "reward-community-campaign",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "community-campaign",
      submissionId: null,
      amountCents: 1000,
      ticker: "COIN",
      status: "not_issued",
    },
    completedLabel: "Feb 21",
    statusLabel: "Reward",
  },
  {
    reward: {
      id: "reward-civic-workshop",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "civic-workshop",
      submissionId: null,
      amountCents: 3000,
      ticker: "GOOGL",
      status: "not_issued",
    },
    completedLabel: "Feb 14",
    statusLabel: "Reward",
  },
];
