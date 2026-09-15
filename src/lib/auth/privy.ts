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
  wallet_client?: string;
  connector_type?: string;
};

type PrivyUserRecord = {
  id?: string;
  email?: { address?: string } | string | null;
  wallet?: { address?: string } | null;
  linked_accounts?: LinkedAccount[];
  linkedAccounts?: LinkedAccount[];
};

function normalizeWallet(address: string | null | undefined) {
  const value = address?.trim() || "";

  if (!value) return null;

  return /^0x[0-9a-fA-F]+$/.test(value) ? value.toLowerCase() : value;
}

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
    if (account.type === "wallet" || account.type === "smart_wallet") continue;
    if (
      !account.type ||
      account.type === "email" ||
      account.type.endsWith("_oauth")
    ) {
      return candidate;
    }
  }

  return null;
}

function asWallet(user: PrivyUserRecord) {
  const linked = user.linked_accounts ?? user.linkedAccounts ?? [];
  const wallets = linked.filter(
    (account) => account.type === "wallet" && account.address,
  );
  const external = wallets.find(
    (account) =>
      account.connector_type !== "embedded" &&
      account.wallet_client !== "privy",
  );

  return normalizeWallet(
    user.wallet?.address || external?.address || wallets[0]?.address,
  );
}

function asName(email: string | null, walletAddress: string | null) {
  return (
    email?.split("@")[0] ||
    (walletAddress ? `Wallet ${walletAddress.slice(0, 6)}` : "Privy user")
  );
}

function asDid(user: PrivyUserRecord | null | undefined) {
  return String(user?.id ?? "").trim();
}

async function verifyAccessDid(token: string) {
  const privy = getPrivyClient();
  const auth = privy.utils().auth();

  try {
    const verified = await auth.verifyAccessToken(token);
    const did = String(
      verified.user_id ??
        ("userId" in verified ? String(verified.userId) : ""),
    ).trim();

    if (did) return did;
  } catch (accessError) {
    console.error("[task2stock:privy] access token verify failed", accessError);
    try {
      const user = (await auth.verifyIdentityToken(token)) as PrivyUserRecord;
      const did = asDid(user);
      if (did) return did;
    } catch {
      // Fall through with the original access-token error.
    }

    throw accessError;
  }

  throw new Error("Privy token did not include a user id.");
}

async function verifyIdentityUser(token: string) {
  return (await getPrivyClient()
    .utils()
    .auth()
    .verifyIdentityToken(token)) as PrivyUserRecord;
}

/**
 * Resolve a Task2Stock identity from verified Privy tokens.
 * Access token proves the DID. Identity token / users API supply email and wallet.
 */
export async function verifyPrivyTokens(input: {
  accessToken?: string | null;
  identityToken?: string | null;
}): Promise<PrivyIdentity> {
  const accessToken = input.accessToken?.trim() || "";
  const identityToken = input.identityToken?.trim() || "";

  if (!accessToken && !identityToken) {
    throw new Error("Missing Privy token.");
  }

  let did = "";
  let user: PrivyUserRecord | null = null;

  if (accessToken) {
    did = await verifyAccessDid(accessToken);
  }

  if (identityToken) {
    try {
      const identityUser = await verifyIdentityUser(identityToken);
      const identityDid = asDid(identityUser);

      if (did && identityDid && did !== identityDid) {
        throw new Error("Privy access and identity tokens do not match.");
      }

      did = did || identityDid;
      user = identityUser;
    } catch (identityError) {
      if (!did) throw identityError;
    }
  }

  if (!did) {
    throw new Error("Privy token did not include a user id.");
  }

  if (!user) {
    try {
      user = (await getPrivyClient().users()._get(did)) as PrivyUserRecord;
    } catch (error) {
      console.error("[task2stock:privy] user lookup failed", error);
    }
  }

  const email = user ? asEmail(user) : null;
  const walletAddress = user ? asWallet(user) : null;

  return {
    did,
    email,
    name: asName(email, walletAddress),
    walletAddress,
  };
}
