"use client";

import { getAccessToken, getIdentityToken } from "@privy-io/react-auth";

export type PrivySyncResult =
  | { ok: true; next: string }
  | { ok: false; error: string };

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function readAccessToken(
  reader: () => Promise<string | null>,
) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const token = await reader();
      if (token) return token;
    } catch {
      // Privy token helpers can throw while the client is still hydrating.
    }

    await wait(120 * (attempt + 1));
  }

  return null;
}

async function readIdentityToken(
  reader: () => Promise<string | null>,
) {
  try {
    return (await reader()) || null;
  } catch {
    return null;
  }
}

let inflight: Promise<PrivySyncResult> | null = null;

async function postPrivySession(
  accessToken: string,
  identityToken: string | null,
): Promise<PrivySyncResult> {
  const response = await fetch("/api/auth/privy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      accessToken,
      identityToken: identityToken ?? "",
    }),
  });

  let data: { ok?: boolean; next?: string; error?: string } = {};

  try {
    data = (await response.json()) as typeof data;
  } catch {
    return {
      ok: false,
      error: "Privy login could not be verified. Try again.",
    };
  }

  if (!response.ok || !data.ok || !data.next) {
    return {
      ok: false,
      error: data.error || "Privy login could not be verified. Try again.",
    };
  }

  return { ok: true, next: data.next };
}

export async function syncPrivySession(readers?: {
  getAccessToken?: () => Promise<string | null>;
  getIdentityToken?: () => Promise<string | null>;
}): Promise<PrivySyncResult> {
  if (inflight) return inflight;

  inflight = (async () => {
    const accessToken = await readAccessToken(
      readers?.getAccessToken ?? (() => getAccessToken()),
    );
    const identityToken = await readIdentityToken(
      readers?.getIdentityToken ?? (() => getIdentityToken()),
    );

    if (!accessToken && !identityToken) {
      return {
        ok: false as const,
        error: "Privy did not return a session token.",
      };
    }

    return postPrivySession(accessToken ?? "", identityToken);
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}
