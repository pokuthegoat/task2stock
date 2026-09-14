export const PHANTOM_INSTALL_URL = "https://phantom.app/download";

export type PhantomPublicKey = {
  toBase58(): string;
};

export type PhantomProvider = {
  isPhantom?: boolean;
  publicKey: PhantomPublicKey | null;
  connect(): Promise<{ publicKey: PhantomPublicKey }>;
  signMessage(
    message: Uint8Array,
    display?: "utf8" | "hex",
  ): Promise<{ signature: Uint8Array }>;
};

function readPhantomProvider(): PhantomProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  const injected = window as Window & {
    phantom?: { solana?: PhantomProvider };
    solana?: PhantomProvider;
  };

  const provider = injected.phantom?.solana ?? injected.solana;
  return provider?.isPhantom ? provider : null;
}

export function getPhantomProvider() {
  return readPhantomProvider();
}

export function isPhantomInstalled() {
  return Boolean(readPhantomProvider());
}

export function encodePhantomSignature(signature: Uint8Array) {
  let binary = "";
  signature.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function phantomErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error
      ? Number((error as { code?: number }).code)
      : null;
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message)
        : "";

  if (code === 4001 || /reject|denied|cancel/i.test(message)) {
    if (/sign/i.test(message)) {
      return "Phantom did not sign the authentication message.";
    }
    return "Phantom connection was cancelled.";
  }

  if (/sign/i.test(message)) {
    return "Phantom did not sign the authentication message.";
  }

  return "Phantom could not complete sign-in.";
}
