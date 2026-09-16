"use client";

import { useState } from "react";

const CONTRACT_ADDRESS = "0x4f101f97f908a9f229c8c623d7f57d3df7099bb4";

const pill =
  "glass-chip inline-flex h-9 items-center justify-center text-[12px] font-medium text-foreground/78 transition hover:brightness-110 hover:text-foreground";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function NavbarCaButton() {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard can fail without a secure context or permission.
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyAddress()}
      aria-label={
        copied
          ? "Contract address copied"
          : `Copy contract address ${CONTRACT_ADDRESS}`
      }
      title={CONTRACT_ADDRESS}
      className={`${pill} cursor-pointer px-3`}
    >
      {copied ? "copied" : `ca ${shortenAddress(CONTRACT_ADDRESS)}`}
    </button>
  );
}

export function NavbarTwitterButton() {
  return (
    <a
      href="https://x.com/task2stock"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Task2Stock on X"
      className={`${pill} w-9`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5 fill-current"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    </a>
  );
}

export function NavbarMetaButtons() {
  return (
    <div className="flex items-center gap-1.5">
      <NavbarCaButton />
      <NavbarTwitterButton />
    </div>
  );
}
