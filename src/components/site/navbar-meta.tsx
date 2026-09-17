"use client";

import { useState } from "react";
import { shortenEvmAddress } from "@/lib/rewards/eth";

const CONTRACT_ADDRESS = "0x369db3bafc0413b9fa7f6a0b057071c2b7598ef0";

const pill =
  "glass-chip inline-flex h-9 items-center justify-center text-[12px] font-medium text-foreground/78 transition hover:text-foreground";

export function NavbarCaButton() {
  const [copied, setCopied] = useState(false);

  async function copyCa() {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for environments where Clipboard API is blocked
      const textarea = document.createElement("textarea");
      textarea.value = CONTRACT_ADDRESS;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={copyCa}
      aria-label={
        copied
          ? "Contract address copied"
          : `Copy contract address ${CONTRACT_ADDRESS}`
      }
      title={CONTRACT_ADDRESS}
      className={`${pill} cursor-pointer gap-1.5 px-3 font-mono`}
    >
      <span className="font-sans tracking-wide">ca</span>
      <span>{copied ? "copied" : shortenEvmAddress(CONTRACT_ADDRESS)}</span>
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
