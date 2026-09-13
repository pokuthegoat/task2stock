import "server-only";

import { createLocalStorage } from "@/lib/storage/local";
import { createS3Storage } from "@/lib/storage/s3";
import type { StorageProvider } from "@/lib/storage/types";

let cached: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (cached) {
    return cached;
  }

  const driver = (process.env.STORAGE_DRIVER ?? "local").trim().toLowerCase();
  cached = driver === "s3" ? createS3Storage() : createLocalStorage();
  return cached;
}

export function proofStorageKey(input: {
  userId: string;
  submissionId: string;
  fileName: string;
}) {
  const safe = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  return `proofs/${input.userId}/${input.submissionId}/${safe || "proof"}`;
}
