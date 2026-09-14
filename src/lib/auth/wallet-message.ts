export const WALLET_AUTH_TTL_MS = 5 * 60 * 1000;

export function buildWalletAuthMessage(input: {
  walletAddress: string;
  nonce: string;
  expiresAt: Date;
}) {
  return [
    "Task2Stock authentication",
    "",
    `Wallet: ${input.walletAddress}`,
    `Nonce: ${input.nonce}`,
    `Expires: ${input.expiresAt.toISOString()}`,
    "",
    "Sign this message to securely sign in to Task2Stock.",
    "This signature does not authorize any blockchain transaction.",
  ].join("\n");
}

export function parseWalletAuthMessage(message: string) {
  const wallet = /^Wallet: (\S+)$/m.exec(message)?.[1];
  const nonce = /^Nonce: (\S+)$/m.exec(message)?.[1];
  const expires = /^Expires: (\S+)$/m.exec(message)?.[1];

  if (!wallet || !nonce || !expires) {
    return null;
  }

  return { walletAddress: wallet, nonce, expiresAt: expires };
}

export function walletDisplayName(walletAddress: string) {
  return `Phantom ${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`;
}
