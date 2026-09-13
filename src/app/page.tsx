import { FeaturedTasks } from "@/components/home/featured-tasks";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { ProductStory } from "@/components/home/product-story";
import { RewardPreview } from "@/components/home/reward-preview";
import { Why } from "@/components/home/why";
import { listHomeRewardPreviews, listHomeTasks } from "@/lib/data/catalog";

export default async function Home() {
  const [homeTasks, rewardPreviews] = await Promise.all([
    listHomeTasks(),
    listHomeRewardPreviews(),
  ]);

  return (
    <main id="main" className="flex-1">
      <Hero />
      <RewardPreview items={rewardPreviews} />
      <ProductStory />
      <Why />
      <FeaturedTasks tasks={homeTasks} />
      <FinalCta />
    </main>
  );
}
