import "server-only";

import { PrivyClient } from "@privy-io/node";

export function getPrivyAppId() {
  return process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim() || "";
}

export function getPrivyAppSecret() {
  return process.env.PRIVY_APP_SECRET?.trim() || "";
}

export function isPrivyConfigured() {
  return Boolean(getPrivyAppId() && getPrivyAppSecret());
}

export function getPrivyClient() {
  if (!isPrivyConfigured()) {
    throw new Error("Privy is not configured.");
  }

  return new PrivyClient({
    appId: getPrivyAppId(),
    appSecret: getPrivyAppSecret(),
  });
}

export type PrivyIdentity = {
  did: string;
  email: string | null;
  name: string;
  walletAddress: string | null;
};

type LinkedAccount = {
  type?: string;
  address?: string;
  email?: string;
};

type PrivyUserRecord = {
  id?: string;
  email?: { address?: string } | string | null;
  wallet?: { address?: string } | null;
  linked_accounts?: LinkedAccount[];
  linkedAccounts?: LinkedAccount[];
};

function asEmail(user: PrivyUserRecord) {
  const direct = (() => {
    const value = user.email;
    if (!value) return null;
    if (typeof value === "string") return value.trim().toLowerCase() || null;
    return value.address?.trim().toLowerCase() || null;
  })();

  if (direct) return direct;

  const linked = user.linked_accounts ?? user.linkedAccounts ?? [];
  for (const account of linked) {
    const candidate = (account.email ?? account.address)?.trim().toLowerCase();
    if (!candidate || !candidate.includes("@")) continue;
    if (
      account.type === "email" ||
      account.type === "google_oauth" ||
      account.type === "apple_oauth"
    ) {
      return candidate;
    }
  }

  return null;
}

function asWallet(user: PrivyUserRecord) {
  const linked = user.linked_accounts ?? user.linkedAccounts ?? [];
  const fromLinked = linked.find(
    (account) => account.type === "wallet" && account.address,
  )?.address;
  return user.wallet?.address?.trim() || fromLinked?.trim() || null;
}

export async function verifyPrivyAccessToken(
  accessToken: string,
): Promise<PrivyIdentity> {
  const token = accessToken.trim();

  if (!token) {
    throw new Error("Missing Privy token.");
  }

  const privy = getPrivyClient();
  const verified = await privy.utils().auth().verifyAccessToken(token);
  const did = String(verified.user_id ?? "").trim();

  if (!did) {
    throw new Error("Privy token did not include a user id.");
  }

  const user = (await privy.users()._get(did)) as PrivyUserRecord;
  const email = asEmail(user);
  const walletAddress = asWallet(user);
  const name =
    email?.split("@")[0] ||
    (walletAddress ? `Wallet ${walletAddress.slice(0, 6)}` : "Privy user");

  return { did, email, name, walletAddress };
}
