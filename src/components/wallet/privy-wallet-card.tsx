"use client";

import { useState } from "react";
import { useFundWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

function shorten(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function PrivyWalletCard() {
  const { ready, authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const { fundWallet } = useFundWallet();
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkedWallet = user?.linkedAccounts?.find(
    (account) =>
      "address" in account &&
      account.type === "wallet" &&
      typeof account.address === "string",
  );
  const address =
    wallets[0]?.address ||
    user?.wallet?.address ||
    (linkedWallet && "address" in linkedWallet ? linkedWallet.address : null) ||
    null;

  async function copy() {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("Could not copy the wallet address.");
    }
  }

  async function addFunds() {
    if (!address) return;
    setPending(true);
    setError(null);

    try {
      await fundWallet({ address });
    } catch {
      setError("Privy funding was cancelled or could not start.");
    } finally {
      setPending(false);
    }
  }

  if (!ready) {
    return null;
  }

  if (!authenticated) {
    return (
      <div className="glass-panel p-7 md:p-10">
        <p className="label">Wallet</p>
        <h2 className="heading mt-3 text-3xl text-foreground">Privy wallet</h2>
        <p className="mt-4 text-sm leading-6 text-foreground/68">
          Log in with Privy to fund and send from your wallet. Task2Stock never
          holds or routes the payment.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-7 md:p-10">
      <p className="label">Wallet</p>
      <h2 className="heading mt-3 text-3xl text-foreground">Privy wallet</h2>
      <p className="mt-4 text-sm leading-6 text-foreground/68">
        Funding and payouts go through Privy, not Task2Stock.
      </p>

      <p className="mt-6 font-mono text-sm text-foreground/88">
        {address ? shorten(address) : "Creating wallet…"}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          size="sm"
          disabled={!address || pending}
          onClick={() => void addFunds()}
        >
          {pending ? "Opening Privy…" : "Add funds with Privy"}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={!address}
          onClick={() => void copy()}
        >
          {copied ? "Copied" : "Copy address"}
        </Button>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-300/90">{error}</p>
      ) : null}
    </div>
  );
}
