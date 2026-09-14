import "server-only";

import { del, get, head, put } from "@vercel/blob";
import {
  blobUrlAccess,
  isProofBlobConfigured,
  requireBlobAuthOptions,
  type BlobStoreKind,
} from "@/lib/storage/blob-env";
import type { StorageProvider, StoredObject } from "@/lib/storage/types";

export { isProofBlobConfigured };

function storeAccess(kind: BlobStoreKind): "private" | "public" {
  return kind === "proof" ? "private" : "public";
}

export function createBlobStorage(kind: BlobStoreKind): StorageProvider {
  const access = storeAccess(kind);

  return {
    async put(input) {
      const blob = await put(input.key, Buffer.from(input.bytes), {
        access,
        contentType: input.contentType,
        addRandomSuffix: true,
        multipart: input.bytes.byteLength > 4.5 * 1024 * 1024,
        ...requireBlobAuthOptions(kind),
      });

      return blob.url;
    },

    async get(key): Promise<StoredObject | null> {
      const result = await get(key, {
        access,
        ...requireBlobAuthOptions(kind),
      });

      if (!result || result.statusCode !== 200 || !result.stream) {
        return null;
      }

      return {
        key,
        bytes: new Uint8Array(await new Response(result.stream).arrayBuffer()),
        contentType: result.blob.contentType || "application/octet-stream",
      };
    },

    async delete(key) {
      await del(key, requireBlobAuthOptions(kind));
    },
  };
}

export async function inspectOwnedBlob(input: {
  userId: string;
  url: string;
  kind: "proof" | "avatar";
}) {
  const store: BlobStoreKind = input.kind === "avatar" ? "profile" : "proof";
  const expectedAccess = storeAccess(store);
  const prefix =
    input.kind === "avatar"
      ? `avatars/${input.userId}/`
      : `proofs/${input.userId}/`;

  if (blobUrlAccess(input.url) !== expectedAccess) {
    return null;
  }

  try {
    const meta = await head(input.url, requireBlobAuthOptions(store));

    if (!meta.pathname.startsWith(prefix)) {
      return null;
    }

    if (blobUrlAccess(meta.url) !== expectedAccess) {
      return null;
    }

    return {
      url: meta.url,
      pathname: meta.pathname,
      contentType: meta.contentType,
      size: meta.size,
    };
  } catch {
    return null;
  }
}
