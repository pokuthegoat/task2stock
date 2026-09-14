import "server-only";

import { createBlobStorage, isProofBlobConfigured } from "@/lib/storage/blob";
import { isProfileBlobConfigured } from "@/lib/storage/blob-env";
import { createLocalStorage } from "@/lib/storage/local";
import type { StorageProvider } from "@/lib/storage/types";

let proofCached: StorageProvider | null = null;
let profileCached: StorageProvider | null = null;

export function getProofStorageProvider(): StorageProvider {
  if (proofCached) {
    return proofCached;
  }

  proofCached = isProofBlobConfigured()
    ? createBlobStorage("proof")
    : createLocalStorage();
  return proofCached;
}

export function getProfileStorageProvider(): StorageProvider {
  if (profileCached) {
    return profileCached;
  }

  profileCached = isProfileBlobConfigured()
    ? createBlobStorage("profile")
    : createLocalStorage();
  return profileCached;
}

export function getStorageProvider(): StorageProvider {
  return getProofStorageProvider();
}

export function proofStorageKey(input: {
  userId: string;
  submissionId: string;
  fileName: string;
}) {
  const safe = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  return `proofs/${input.userId}/${input.submissionId}/${safe || "proof"}`;
}

export function avatarStorageKey(input: { userId: string; fileName: string }) {
  const safe = input.fileName.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80);
  return `avatars/${input.userId}/${safe || "avatar"}`;
}
