"use client";

import { useEffect, useRef, useState } from "react";

const pill =
  "glass-chip inline-flex h-9 items-center justify-center text-[12px] font-medium text-foreground/78 transition hover:brightness-110 hover:text-foreground";

export function NavbarCaButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          "FfG6GPNM6K5N6HQ2R9U1YAqzedYVGN1fRz38Uvq463MG",
        );
      } else {
        throw new Error("clipboard");
      }
    } catch {
      const field = document.createElement("textarea");
      field.value = "FfG6GPNM6K5N6HQ2R9U1YAqzedYVGN1fRz38Uvq463MG";
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={
        copied
          ? "Contract address copied"
          : "Copy contract address FfG6GPNM6K5N6HQ2R9U1YAqzedYVGN1fRz38Uvq463MG"
      }
      className={`group ${pill} overflow-hidden px-3 transition-[max-width] duration-300 ease-out motion-reduce:transition-none ${
        copied
          ? "max-w-[6.5rem]"
          : "max-w-[9.75rem] hover:max-w-[32rem]"
      }`}
    >
      {copied ? (
        <span className="px-0.5">Copied</span>
      ) : (
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[10px] font-medium tracking-[0.14em] text-foreground/48">
            CA
          </span>
          <span className="font-mono text-[12px] tracking-tight">
            <span className="group-hover:hidden">FfG6...</span>
            <span className="hidden group-hover:inline">
              FfG6GPNM6K5N6HQ2R9U1YAqzedYVGN1fRz38Uvq463MG
            </span>
          </span>
          <span className="text-[10px] font-medium tracking-[0.12em] text-foreground/42 group-hover:hidden">
            COPY
          </span>
        </span>
      )}
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
