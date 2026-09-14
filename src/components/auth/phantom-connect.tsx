"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import {
  beginWalletAuthAction,
  completeWalletAuthAction,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/auth/form-message";
import {
  PHANTOM_INSTALL_URL,
  encodePhantomSignature,
  getPhantomProvider,
  phantomErrorMessage,
} from "@/lib/solana/phantom";

export function PhantomConnect() {
  const [pending, setPending] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    if (pending) return;

    const provider = getPhantomProvider();

    if (!provider) {
      setMissing(true);
      setError("Phantom is not installed in this browser.");
      return;
    }

    setPending(true);
    setMissing(false);
    setError(null);

    try {
      const connected = await provider.connect();
      const publicKey = connected.publicKey.toBase58();
      const challenge = await beginWalletAuthAction(publicKey);

      if (!challenge.ok) {
        setError(challenge.error);
        return;
      }

      const signed = await provider.signMessage(
        new TextEncoder().encode(challenge.message),
        "utf8",
      );
      const result = await completeWalletAuthAction({
        challengeId: challenge.challengeId,
        publicKey,
        signature: encodePhantomSignature(signed.signature),
      });

      if (result && !result.ok) {
        setError(result.error);
      }
    } catch (caught) {
      if (isRedirectError(caught)) {
        throw caught;
      }
      setError(phantomErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <FormMessage message={error} />
      <Button
        type="button"
        className="w-full"
        disabled={pending}
        onClick={() => {
          void connect();
        }}
      >
        {pending ? "Connecting Phantom…" : "Connect Phantom"}
      </Button>
      {missing ? (
        <Button href={PHANTOM_INSTALL_URL} variant="secondary" className="w-full">
          Install Phantom
        </Button>
      ) : null}
    </div>
  );
}
