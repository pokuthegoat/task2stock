/**
 * Manual ETH payout constants and helpers.
 * No private keys, no chain RPC, no MetaMask integration.
 */

export const TREASURY_WALLET_ADDRESS =
  "0xcAa9B561Aa2ea6eA3814A6b2CF8F22AB29F5e521";

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/;

/** MVP flat ETH reward amount shown on claims. Override with ETH_REWARD_AMOUNT. */
export function getEthRewardAmount(): string {
  const configured = process.env.ETH_REWARD_AMOUNT?.trim();
  return configured && configured.length > 0 ? configured : "0.01";
}

export function formatEthReward(amount: string): string {
  return `${amount} ETH`;
}

export function isValidEvmAddress(value: string): boolean {
  return EVM_ADDRESS_RE.test(value.trim());
}

export function normalizeEvmAddress(value: string): string {
  return value.trim();
}

export function shortenEvmAddress(address: string): string {
  const value = address.trim();
  if (value.length < 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}
