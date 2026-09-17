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
  { id: "northstar-athletics", name: "Nike" },
  { id: "halo-home", name: "NVIDIA" },
  { id: "open-markets-collective", name: "Canva" },
  { id: "lumen-retail", name: "Spotify" },
  { id: "meridian-audio", name: "LEGO" },
  { id: "atlas-civic", name: "Strava" },
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
    companyId: "atlas-civic",
    title: "Complete and document a 10 km run",
    description:
      "Run 10 km in one Strava session and keep a screenshot that shows distance, time, and a completed activity.",
    category: "Fitness",
    difficulty: "Advanced",
    estimate: "60–90 minutes",
    timeBucket: "Under 2 hours",
    reward: { amountCents: 1500, ticker: "NVDA" },
    featured: false,
    onHome: true,
    requirement:
      "Complete a 10 km run in a single session and record it on Strava. The finished activity must show 10 km or more, total time, and a completed status.",
    steps: [
      "Complete 10 km or more in one outdoor or treadmill run, recorded as a single Strava activity.",
      "Confirm the Strava activity shows distance, total time, and that it is marked complete — not paused or in progress.",
      "Save a screenshot of that activity page and note the date, distance, and elapsed time in your proof description.",
    ],
    instructions: [
      "Start recording before you run and stop only after you have covered at least 10 km.",
      "Do not stitch multiple short runs into one activity after the fact.",
      "Upload one PNG, JPEG, or WEBP screenshot of the completed Strava activity. Put distance, time, and the activity URL in the description.",
    ],
    eligibility: [
      "Able to run 10 km in one session and record it with a free or paid Strava account.",
      "Proof: one screenshot of the completed Strava activity plus a description that includes distance, total time, and the activity link.",
    ],
  },
  {
    id: "product-video",
    companyId: "halo-home",
    title: "Create an NVIDIA DLSS explainer",
    description:
      "Record a 60–90 second video that explains NVIDIA DLSS, why it helps, and one real-world game or app example.",
    category: "Creative",
    difficulty: "Moderate",
    estimate: "60–90 minutes",
    timeBucket: "A few hours",
    reward: { amountCents: 2500, ticker: "AAPL" },
    featured: true,
    onHome: true,
    requirement:
      "Create a 60–90 second video explaining NVIDIA DLSS. Cover what DLSS is, why it is useful, and include at least one real-world example.",
    steps: [
      "Explain what NVIDIA DLSS is in plain language, including that it is an upscaling and frame-generation technology used in games.",
      "Explain why it is useful (for example higher frame rates or sharper images at a given resolution) and give one real-world example such as a specific game.",
      "Keep the finished cut between 60 and 90 seconds and export a watchable file you can host as an https MP4 or video page.",
    ],
    instructions: [
      "Speak over gameplay, slides, or screen recordings. On-screen text is optional as long as the three points are covered.",
      "Do not present this as an official NVIDIA commission or paid partnership.",
      "Paste an https link to the video (YouTube, Streamable, Vimeo, or similar). In the description, list runtime and the example you used. You may also attach a still image.",
    ],
    eligibility: [
      "Access to a phone or computer that can record, edit, and export a short video.",
      "Proof: https video URL to the 60–90 second MP4 or upload page, plus a description covering DLSS, its benefit, and your real-world example.",
    ],
  },
  {
    id: "community-campaign",
    companyId: "open-markets-collective",
    title: "Design a complete product ad set",
    description:
      "Use Canva to design three matching Sony WH-1000XM5 ads: a 1080×1080 post, a vertical story, and a 16:9 banner, all with the same style and a clear CTA.",
    category: "Creative",
    difficulty: "Moderate",
    estimate: "60–90 minutes",
    timeBucket: "A few hours",
    reward: { amountCents: 1000, ticker: "COIN" },
    featured: false,
    onHome: true,
    requirement:
      "Create three coordinated Canva graphics for the Sony WH-1000XM5: a 1080×1080 social post, a vertical story graphic, and a 16:9 banner. All three must share one visual style and include a clear call to action.",
    steps: [
      "Design a 1080×1080 social post, a 1080×1920 story graphic, and a 1920×1080 banner in Canva for the Sony WH-1000XM5.",
      "Keep typography, color, and imagery consistent across all three, and put a clear CTA such as Shop now or Learn more on each.",
      "Export finished PNG or JPEG files and combine them into one image for upload, or describe each file size in the proof notes.",
    ],
    instructions: [
      "Original Canva work only. Do not submit unedited Sony ads or stock templates with no changes.",
      "This listing is not a Sony or Canva sponsorship. Treat it as marketplace practice around a recognizable product.",
      "Upload one PNG, JPEG, or WEBP that shows all three finished designs. In the description, confirm each size and quote the CTA you used.",
    ],
    eligibility: [
      "A free or paid Canva account and the ability to export PNG or JPEG graphics.",
      "Proof: one image showing all three finished ads, plus a description that lists the three sizes and the shared CTA.",
    ],
  },
  {
    id: "store-photos",
    companyId: "lumen-retail",
    title: "Curate a 25-song themed playlist",
    description:
      "Build a public Spotify playlist of at least 25 songs around late-night deep work, with a custom title, cover, and 100+ word description.",
    category: "Community",
    difficulty: "Easy",
    estimate: "30–45 minutes",
    timeBucket: "Under 2 hours",
    reward: { amountCents: 1200, ticker: "MSFT" },
    featured: false,
    onHome: true,
    requirement:
      "Create a public Spotify playlist with at least 25 songs for a late-night deep-work theme. Give it a custom title, a custom cover image, and a 100+ word description that explains the theme and song choices.",
    steps: [
      "Add at least 25 real tracks that fit late-night deep work (instrumental, ambient, or low-lyric focus music).",
      "Set a custom playlist title and a custom cover — not the default mosaic of album art.",
      "Write 100+ words in the playlist description covering the theme and why at least three specific songs belong on it.",
    ],
    instructions: [
      "The playlist must be public so a reviewer can open the link.",
      "Do not submit a playlist you already published unless you rebuild the title, cover, description, and track list for this task.",
      "Upload a screenshot of the public playlist page. Paste the Spotify link in the description and include the 100+ word write-up there if it does not fit on Spotify.",
    ],
    eligibility: [
      "A Spotify account that can create public playlists and upload a custom cover.",
      "Proof: screenshot of the playlist plus a description containing the public Spotify URL and the 100+ word theme write-up.",
    ],
  },
  {
    id: "listening-session",
    companyId: "meridian-audio",
    title: "Build and document a LEGO creation",
    description:
      "Build an original space-themed LEGO model with at least 50 pieces, photograph it from three angles, and write a 150-word design note.",
    category: "Creative",
    difficulty: "Moderate",
    estimate: "60–120 minutes",
    timeBucket: "A few hours",
    reward: { amountCents: 1800, ticker: "AAPL" },
    featured: false,
    onHome: false,
    requirement:
      "Build a LEGO creation around a space theme using at least 50 pieces. Photograph it from three different angles and write a 150-word description of the idea and design.",
    steps: [
      "Build an original space-themed model (rover, station, lander, or similar) using at least 50 LEGO pieces. Official sets may be used as parts, but the finished model must not be an unmodified boxed set.",
      "Take three still photos from different angles — for example front, side, and three-quarter or overhead.",
      "Write about 150 words explaining the idea, how you used the pieces, and one design choice you made.",
    ],
    instructions: [
      "Count pieces before you photograph so you can state the approximate total in the description.",
      "Shoot on a clear background with the full model in frame in every photo.",
      "Combine the three photos into one PNG, JPEG, or WEBP contact sheet for upload. Put the 150-word description in the proof notes.",
    ],
    eligibility: [
      "Access to at least 50 LEGO pieces and a camera or phone.",
      "Proof: one image that includes three distinct angles, plus a 150-word description of the idea and design.",
    ],
  },
  {
    id: "civic-workshop",
    companyId: "halo-home",
    title: "Create an NVIDIA CUDA infographic",
    description:
      "Design a one-page infographic that explains NVIDIA CUDA with five facts, one diagram, and a plain-language intro for someone new to the topic.",
    category: "Creative",
    difficulty: "Advanced",
    estimate: "90–120 minutes",
    timeBucket: "A few hours",
    reward: { amountCents: 3000, ticker: "GOOGL" },
    featured: true,
    onHome: false,
    requirement:
      "Create a one-page infographic explaining NVIDIA CUDA. Include at least five factual points, one visual diagram, and a simple explanation for someone unfamiliar with the technology.",
    steps: [
      "Write a short intro that explains CUDA as NVIDIA’s parallel-computing platform for GPUs, in language a non-engineer can follow.",
      "Include at least five accurate factual points (for example what a CUDA core is, typical uses such as graphics or AI, and one limitation).",
      "Add one diagram — for example CPU vs GPU workload, or a simple pipeline from code to GPU — and export a single-page PNG or JPEG.",
    ],
    instructions: [
      "Use Figma, Canva, Illustrator, or similar. Original layout required; do not screenshot NVIDIA’s marketing pages as the whole piece.",
      "Cite public NVIDIA documentation or well-known technical sources in the proof description. This is not an official NVIDIA commission.",
      "Upload the finished one-page infographic as a PNG, JPEG, or WEBP. In the description, list your five facts and name the diagram.",
    ],
    eligibility: [
      "Able to design a one-page graphic and check CUDA facts against public documentation.",
      "Proof: upload of the finished infographic, plus a description listing the five facts and describing the diagram.",
    ],
  },
  {
    id: "trail-loop",
    companyId: "northstar-athletics",
    title: "Create a 3-post Air Max 95 campaign",
    description:
      "Publish three social posts about the Nike Air Max 95, each with a different angle: product features, personal opinion, and styling or use case.",
    category: "Retail",
    difficulty: "Moderate",
    estimate: "45–60 minutes",
    timeBucket: "Under 2 hours",
    reward: { amountCents: 2000, ticker: "NVDA" },
    featured: false,
    onHome: false,
    requirement:
      "Create three social posts promoting the Nike Air Max 95. Each post must use a different angle — product features, personal opinion, and styling or use case — and every post must mention Air Max 95.",
    steps: [
      "Post 1: product features (visible design details such as the visible Air unit, mesh panels, or colorway).",
      "Post 2: a personal opinion about wearing or seeing the Air Max 95, written in your own words.",
      "Post 3: a styling or use-case angle (outfit pairing, walking, travel, or similar). Mention “Air Max 95” in the caption of every post.",
    ],
    instructions: [
      "Publish on a public Instagram, X, TikTok, or LinkedIn account. Unpublished drafts do not count.",
      "Do not present the posts as a Nike sponsorship or paid partnership.",
      "Combine screenshots of all three published posts into one image. In the description, paste each caption and the public post URLs.",
    ],
    eligibility: [
      "A public social account and the ability to publish three distinct posts in one sitting.",
      "Proof: one image showing all three published posts, plus a description with each caption, angle, and public URL.",
    ],
  },
  {
    id: "shelf-study",
    companyId: "northstar-athletics",
    title: "Write a detailed Nike Pegasus 41 review",
    description:
      "Publish a 300–500 word Nike Pegasus 41 review covering design, features, strengths, weaknesses, and who it is for, with one original photo.",
    category: "Retail",
    difficulty: "Moderate",
    estimate: "60–90 minutes",
    timeBucket: "A few hours",
    reward: { amountCents: 800, ticker: "MSFT" },
    featured: false,
    onHome: false,
    requirement:
      "Write a 300–500 word public review of the Nike Pegasus 41 covering design, features, strengths, weaknesses, and who you would recommend it to. Include at least one original photo and publish the review.",
    steps: [
      "Write 300–500 words that cover design, features, strengths, weaknesses, and a clear recommendation of who the shoe is for.",
      "Take at least one original photo of a Pegasus 41 you own, borrowed, or photographed in a store — not a cropped Nike product-page download.",
      "Publish the review on a public page (blog, Medium, Substack, or similar) so a reviewer can open the URL.",
    ],
    instructions: [
      "Base the review on a real look at the shoe. If you cannot wear it, say so and review from in-person photos and published specs.",
      "Do not claim this is a Nike-sponsored review.",
      "Upload your original photo as PNG, JPEG, or WEBP. In the description, paste the public review URL and the 300–500 word text.",
    ],
    eligibility: [
      "Able to photograph a Nike Pegasus 41 and publish a public written review.",
      "Proof: original image upload, a screenshot or still of the published page if useful, and a description with the public URL plus the full review text.",
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
    fromLabel: "DLSS explainer",
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
    fromLabel: "10 km run",
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
    fromLabel: "Canva ad set",
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
    label: "NVIDIA DLSS explainer",
    amountCents: 2500,
    ticker: "AAPL",
    when: "Mar 12",
  },
  {
    taskId: "run-20km",
    label: "10 km Strava run",
    amountCents: 1500,
    ticker: "NVDA",
    when: "Mar 4",
  },
  {
    taskId: "community-campaign",
    label: "Canva product ad set",
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

function fixtureReward(
  reward: Omit<
    Reward,
    | "ethAmount"
    | "payoutWalletAddress"
    | "claimedAt"
    | "paidAt"
    | "txHash"
  >,
): Reward {
  return {
    ...reward,
    ethAmount: "0.01",
    payoutWalletAddress: null,
    claimedAt: null,
    paidAt: null,
    txHash: null,
  };
}

export const taskEarningFixtures: Array<{
  reward: Reward;
  completedLabel: string;
  statusLabel: string;
}> = [
  {
    reward: fixtureReward({
      id: "reward-product-video",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "product-video",
      submissionId: null,
      amountCents: 2500,
      ticker: "AAPL",
      status: "not_issued",
    }),
    completedLabel: "Mar 12",
    statusLabel: "Reward",
  },
  {
    reward: fixtureReward({
      id: "reward-listening-session",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "listening-session",
      submissionId: null,
      amountCents: 1800,
      ticker: "AAPL",
      status: "not_issued",
    }),
    completedLabel: "Mar 8",
    statusLabel: "Reward",
  },
  {
    reward: fixtureReward({
      id: "reward-run-20km",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "run-20km",
      submissionId: null,
      amountCents: 1500,
      ticker: "NVDA",
      status: "not_issued",
    }),
    completedLabel: "Mar 4",
    statusLabel: "Reward",
  },
  {
    reward: fixtureReward({
      id: "reward-trail-loop",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "trail-loop",
      submissionId: null,
      amountCents: 2000,
      ticker: "NVDA",
      status: "not_issued",
    }),
    completedLabel: "Feb 28",
    statusLabel: "Reward",
  },
  {
    reward: fixtureReward({
      id: "reward-community-campaign",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "community-campaign",
      submissionId: null,
      amountCents: 1000,
      ticker: "COIN",
      status: "not_issued",
    }),
    completedLabel: "Feb 21",
    statusLabel: "Reward",
  },
  {
    reward: fixtureReward({
      id: "reward-civic-workshop",
      userId: EXAMPLE_PORTFOLIO_USER_ID,
      taskId: "civic-workshop",
      submissionId: null,
      amountCents: 3000,
      ticker: "GOOGL",
      status: "not_issued",
    }),
    completedLabel: "Feb 14",
    statusLabel: "Reward",
  },
];
