import "server-only";

import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageProvider, StoredObject } from "@/lib/storage/types";

function rootDir() {
  return path.resolve(process.cwd(), process.env.STORAGE_LOCAL_DIR ?? ".data/proofs");
}

function resolveKey(key: string) {
  const safe = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const full = path.resolve(rootDir(), safe);
  const root = rootDir();

  if (!full.startsWith(root)) {
    throw new Error("Invalid storage key.");
  }

  return full;
}

export function createLocalStorage(): StorageProvider {
  return {
    async put(input) {
      const full = resolveKey(input.key);
      await mkdir(path.dirname(full), { recursive: true });
      await writeFile(full, Buffer.from(input.bytes));
      return input.key;
    },

    async get(key): Promise<StoredObject | null> {
      try {
        const bytes = new Uint8Array(await readFile(resolveKey(key)));
        return { key, bytes, contentType: "application/octet-stream" };
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }

        throw error;
      }
    },

    async delete(key) {
      try {
        await unlink(resolveKey(key));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },
  };
}
