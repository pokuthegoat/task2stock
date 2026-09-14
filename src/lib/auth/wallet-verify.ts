import { ed25519 } from "@noble/curves/ed25519.js";
import { base58 } from "@scure/base";
import { parseWalletAuthMessage } from "@/lib/auth/wallet-message";

export function decodeSolanaAddress(value: string) {
  try {
    const bytes = base58.decode(value.trim());
    return bytes.length === 32 ? bytes : null;
  } catch {
    return null;
  }
}

export function encodeSolanaAddress(bytes: Uint8Array) {
  return base58.encode(bytes);
}

export function decodeSignature(value: string) {
  const trimmed = value.trim();

  try {
    const from58 = base58.decode(trimmed);
    if (from58.length === 64) return from58;
  } catch {
    // Fall through to base64.
  }

  try {
    const from64 = Uint8Array.from(Buffer.from(trimmed, "base64"));
    if (from64.length === 64) return from64;
  } catch {
    return null;
  }

  return null;
}

export function verifyWalletSignature(input: {
  message: string;
  walletAddress: string;
  publicKey: string;
  signature: string;
}) {
  const messageWallet = parseWalletAuthMessage(input.message);
  const publicKeyBytes = decodeSolanaAddress(input.publicKey);
  const claimedBytes = decodeSolanaAddress(input.walletAddress);
  const signature = decodeSignature(input.signature);

  if (!messageWallet || !publicKeyBytes || !claimedBytes || !signature) {
    return { ok: false as const, error: "The wallet signature is not valid." };
  }

  const publicKey = encodeSolanaAddress(publicKeyBytes);
  const walletAddress = encodeSolanaAddress(claimedBytes);

  if (
    publicKey !== walletAddress ||
    messageWallet.walletAddress !== publicKey
  ) {
    return {
      ok: false as const,
      error: "The signed wallet does not match this authentication attempt.",
    };
  }

  const messageBytes = new TextEncoder().encode(input.message);
  const valid = ed25519.verify(signature, messageBytes, publicKeyBytes, {
    zip215: false,
  });

  if (!valid) {
    return { ok: false as const, error: "The wallet signature is not valid." };
  }

  return { ok: true as const, walletAddress: publicKey };
}

export type WalletChallengeRow = {
  nonce: string;
  walletAddress: string;
  message: string;
  expiresAt: Date;
  consumedAt: Date | null;
};

export function evaluateWalletChallenge(
  challenge: WalletChallengeRow | null,
  input: {
    publicKey: string;
    signature: string;
    now?: Date;
  },
) {
  if (!challenge) {
    return { ok: false as const, error: "This sign-in request was not found." };
  }

  const now = input.now ?? new Date();

  if (challenge.consumedAt) {
    return { ok: false as const, error: "This sign-in request was already used." };
  }

  if (challenge.expiresAt.getTime() <= now.getTime()) {
    return { ok: false as const, error: "This sign-in request has expired." };
  }

  const parsed = parseWalletAuthMessage(challenge.message);

  if (
    !parsed ||
    parsed.nonce !== challenge.nonce ||
    parsed.walletAddress !== challenge.walletAddress
  ) {
    return { ok: false as const, error: "The sign-in message is not valid." };
  }

  return verifyWalletSignature({
    message: challenge.message,
    walletAddress: challenge.walletAddress,
    publicKey: input.publicKey,
    signature: input.signature,
  });
}
