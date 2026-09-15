import type { TaskView } from "@/lib/data";

export type TaskKind =
  | "Run"
  | "Video"
  | "Design"
  | "Playlist"
  | "Build"
  | "Social"
  | "Review";

const kindsById: Record<string, TaskKind> = {
  "run-20km": "Run",
  "product-video": "Video",
  "community-campaign": "Design",
  "store-photos": "Playlist",
  "listening-session": "Build",
  "civic-workshop": "Design",
  "trail-loop": "Social",
  "shelf-study": "Review",
};

const accentsByCompany: Record<string, string> = {
  Nike: "#e8a07a",
  NVIDIA: "#9fbf6a",
  Canva: "#9aa8ff",
  Spotify: "#86c9a5",
  LEGO: "#e0c078",
  Strava: "#e08968",
};

const kindByCategory: Record<TaskView["category"], TaskKind> = {
  Fitness: "Run",
  Creative: "Design",
  Community: "Playlist",
  Retail: "Social",
};

export function taskKind(task: Pick<TaskView, "id" | "category">): TaskKind {
  return kindsById[task.id] ?? kindByCategory[task.category];
}

export function companyAccent(name: string): string {
  return accentsByCompany[name] ?? "#d7d0c4";
}
