import type {
  TaskCategory,
  TaskDifficulty,
  TaskTimeBucket,
} from "@/lib/data/types";

export const taskCategories: TaskCategory[] = [
  "Fitness",
  "Creative",
  "Community",
  "Retail",
];

export const taskDifficulties: TaskDifficulty[] = [
  "Easy",
  "Moderate",
  "Advanced",
];

export const taskTimeBuckets: TaskTimeBucket[] = [
  "Under 2 hours",
  "A few hours",
  "About a week",
  "A few weeks",
];
