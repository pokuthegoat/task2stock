import { ed25519 } from "@noble/curves/ed25519.js";
import { base58 } from "@scure/base";
import {
  buildWalletAuthMessage,
  parseWalletAuthMessage,
} from "../src/lib/auth/wallet-message";
import { evaluateWalletChallenge } from "../src/lib/auth/wallet-verify";

function keypair() {
  const { secretKey, publicKey } = ed25519.keygen();
  return {
    secret: secretKey,
    publicKey,
    address: base58.encode(publicKey),
  };
}

function sign(message: string, secret: Uint8Array) {
  return base58.encode(ed25519.sign(new TextEncoder().encode(message), secret));
}

function expect(label: string, ok: boolean) {
  if (!ok) {
    throw new Error(label);
  }
}

const wallet = keypair();
const other = keypair();
const expiresAt = new Date(Date.now() + 60_000);
const nonce = "abc123nonce";
const message = buildWalletAuthMessage({
  walletAddress: wallet.address,
  nonce,
  expiresAt,
});
const parsed = parseWalletAuthMessage(message);

expect("message contains wallet/nonce/expires", Boolean(parsed));
expect("parsed wallet matches", parsed?.walletAddress === wallet.address);
expect("parsed nonce matches", parsed?.nonce === nonce);

const challenge = {
  nonce,
  walletAddress: wallet.address,
  message,
  expiresAt,
  consumedAt: null,
};

const valid = evaluateWalletChallenge(challenge, {
  publicKey: wallet.address,
  signature: sign(message, wallet.secret),
});
expect("valid signature accepted", valid.ok);

const expired = evaluateWalletChallenge(
  { ...challenge, expiresAt: new Date(Date.now() - 1000) },
  {
    publicKey: wallet.address,
    signature: sign(message, wallet.secret),
  },
);
expect("expired nonce rejected", !expired.ok);

const reused = evaluateWalletChallenge(
  { ...challenge, consumedAt: new Date() },
  {
    publicKey: wallet.address,
    signature: sign(message, wallet.secret),
  },
);
expect("reused nonce rejected", !reused.ok);

const invalid = evaluateWalletChallenge(challenge, {
  publicKey: wallet.address,
  signature: sign("different message", wallet.secret),
});
expect("invalid signature rejected", !invalid.ok);

const mismatch = evaluateWalletChallenge(challenge, {
  publicKey: other.address,
  signature: sign(message, other.secret),
});
expect("mismatched wallet rejected", !mismatch.ok);

console.log("wallet auth checks passed");
