import "server-only";

export type BlobStoreKind = "proof" | "profile";

/**
 * Store-specific env vars created by the Vercel Blob connections on
 * the Task2Stock project. Names were read from `vercel storage status`
 * and `vercel env ls` — do not fall back to whichever Blob token loads first.
 *
 * task2stock-proofs (private):
 *   BLOB_READ_WRITE_TOKEN
 *   BLOB_STORE_ID
 *   BLOB_WEBHOOK_PUBLIC_KEY
 *
 * task2stock-profiles (public):
 *   PROFILES_READ_WRITE_TOKEN
 *   PROFILES_STORE_ID
 *   PROFILES_WEBHOOK_PUBLIC_KEY
 */
export const PROOF_BLOB_TOKEN_ENV = "BLOB_READ_WRITE_TOKEN";
export const PROOF_BLOB_STORE_ID_ENV = "BLOB_STORE_ID";
export const PROFILE_BLOB_TOKEN_ENV = "PROFILES_READ_WRITE_TOKEN";
export const PROFILE_BLOB_STORE_ID_ENV = "PROFILES_STORE_ID";

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getProofBlobConfig() {
  return {
    token: readEnv(PROOF_BLOB_TOKEN_ENV),
    storeId: readEnv(PROOF_BLOB_STORE_ID_ENV),
    access: "private" as const,
    tokenEnv: PROOF_BLOB_TOKEN_ENV,
    storeIdEnv: PROOF_BLOB_STORE_ID_ENV,
  };
}

export function getProfileBlobConfig() {
  return {
    token: readEnv(PROFILE_BLOB_TOKEN_ENV),
    storeId: readEnv(PROFILE_BLOB_STORE_ID_ENV),
    access: "public" as const,
    tokenEnv: PROFILE_BLOB_TOKEN_ENV,
    storeIdEnv: PROFILE_BLOB_STORE_ID_ENV,
  };
}

export function getBlobConfig(kind: BlobStoreKind) {
  return kind === "proof" ? getProofBlobConfig() : getProfileBlobConfig();
}

export function blobAuthOptions(kind: BlobStoreKind) {
  const config = getBlobConfig(kind);

  // An explicit token always wins in @vercel/blob, including over OIDC and
  // over BLOB_READ_WRITE_TOKEN. Pass the store-specific token so proofs and
  // profile pictures cannot share credentials.
  if (config.token) {
    return config.storeId
      ? { token: config.token, storeId: config.storeId }
      : { token: config.token };
  }

  // On Vercel production/preview, OIDC + the store id from the connection is
  // enough for server put/get/head/del. handleUpload still needs the
  // read-write token. Local `vercel env pull` sets VERCEL=1 with
  // VERCEL_ENV=development, where the private proof store is not connected,
  // so fall back to the local filesystem unless the store token is present.
  if (config.storeId && process.env.VERCEL) {
    const vercelEnv = process.env.VERCEL_ENV?.trim();
    if (vercelEnv && vercelEnv !== "development") {
      return { storeId: config.storeId };
    }
  }

  return null;
}

export function requireBlobAuthOptions(kind: BlobStoreKind) {
  const options = blobAuthOptions(kind);

  if (!options) {
    const config = getBlobConfig(kind);
    throw new Error(
      `Missing ${config.tokenEnv} or ${config.storeIdEnv} for the ${kind} Blob store.`,
    );
  }

  return options;
}

export function requireBlobReadWriteToken(kind: BlobStoreKind) {
  const config = getBlobConfig(kind);

  if (!config.token) {
    throw new Error(`Missing ${config.tokenEnv} for the ${kind} Blob store.`);
  }

  return config.token;
}

export function isProofBlobConfigured() {
  return blobAuthOptions("proof") !== null;
}

export function isProfileBlobConfigured() {
  return blobAuthOptions("profile") !== null;
}

export function blobUrlAccess(url: string): "private" | "public" | null {
  try {
    const host = new URL(url).hostname.toLowerCase();

    if (host.endsWith(".private.blob.vercel-storage.com")) {
      return "private";
    }

    if (host.endsWith(".public.blob.vercel-storage.com")) {
      return "public";
    }

    return null;
  } catch {
    return null;
  }
}
