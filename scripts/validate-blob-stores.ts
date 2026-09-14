import { readFileSync } from "node:fs";
import { del, get, put } from "@vercel/blob";

function loadEnvFile(path: string, override: boolean) {
  let text: string;

  try {
    text = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1).replace(/^["']|["']$/g, "");
    if (!value || value.includes("SENSITIVE")) continue;
    if (!override && process.env[key]) continue;
    process.env[key] = value;
  }
}

loadEnvFile(".env.blob.check", false);

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function hostnameOf(url: string) {
  return new URL(url).hostname.toLowerCase();
}

async function fetchWithoutAuth(url: string) {
  const response = await fetch(url, { redirect: "manual" });
  return { status: response.status, ok: response.ok };
}

async function main() {
  const proofToken = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const proofStoreId = requiredEnv("BLOB_STORE_ID");
  const profileToken = requiredEnv("PROFILES_READ_WRITE_TOKEN");
  const profileStoreId = requiredEnv("PROFILES_STORE_ID");
  const proofAuth = proofToken
    ? { token: proofToken, storeId: proofStoreId }
    : { storeId: proofStoreId };

  const stamp = Date.now();
  const proofPath = `proofs/_store-check/${stamp}.txt`;
  const profilePath = `avatars/_store-check/${stamp}.txt`;
  let proofUrl = "";
  let profileUrl = "";
  const failures: string[] = [];

  try {
    try {
      const proof = await put(proofPath, "proof-store-check", {
        access: "private",
        addRandomSuffix: true,
        contentType: "text/plain",
        ...proofAuth,
      });
      proofUrl = proof.url;

      const proofHost = hostnameOf(proofUrl);
      if (!proofHost.endsWith(".private.blob.vercel-storage.com")) {
        failures.push(`Proof upload was not private: ${proofHost}`);
      } else {
        const publicProof = await fetchWithoutAuth(proofUrl);
        if (publicProof.ok) {
          failures.push("Private proof URL was readable without authentication.");
        }

        const authenticatedProof = await get(proofUrl, {
          access: "private",
          ...proofAuth,
        });
        if (!authenticatedProof || authenticatedProof.statusCode !== 200) {
          failures.push("Authenticated proof read failed.");
        } else {
          console.log("proof store: private");
          console.log(`proof host: ${proofHost}`);
          console.log(`proof unauthenticated fetch: ${publicProof.status}`);
        }
      }
    } catch (error) {
      failures.push(
        `Proof store check failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }

    try {
      const profile = await put(profilePath, "profile-store-check", {
        access: "public",
        addRandomSuffix: true,
        token: profileToken,
        storeId: profileStoreId,
        contentType: "text/plain",
      });
      profileUrl = profile.url;

      const profileHost = hostnameOf(profileUrl);
      if (!profileHost.endsWith(".public.blob.vercel-storage.com")) {
        failures.push(`Profile upload was not public: ${profileHost}`);
      } else {
        const publicProfile = await fetchWithoutAuth(profileUrl);
        if (!publicProfile.ok) {
          failures.push(`Public profile URL did not load (${publicProfile.status}).`);
        } else {
          console.log("profile store: public");
          console.log(`profile host: ${profileHost}`);
          console.log(`profile unauthenticated fetch: ${publicProfile.status}`);
        }
      }
    } catch (error) {
      failures.push(
        `Profile store check failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }

    if (proofUrl && profileUrl) {
      if (hostnameOf(proofUrl) === hostnameOf(profileUrl)) {
        failures.push("Proof and profile uploads landed on the same host.");
      } else {
        console.log("stores are separated");
      }
    }

    if (failures.length > 0) {
      throw new Error(failures.join("\n"));
    }
  } finally {
    if (proofUrl) {
      await del(proofUrl, proofAuth);
    }
    if (profileUrl) {
      await del(profileUrl, { token: profileToken, storeId: profileStoreId });
    }
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Blob store check failed.");
  process.exit(1);
});
