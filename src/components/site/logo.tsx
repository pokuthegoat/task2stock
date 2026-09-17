"use client";

import { BrandMark } from "@/components/site/brand-mark";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <a
      href="/"
      className={`relative z-10 flex items-center gap-2.5 ${className}`}
      onClick={(event) => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }

        // Already on the launchpad: scroll up instead of a silent no-op.
        if (window.location.pathname === "/") {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Otherwise allow a real browser navigation to `/` so the logo
        // never depends on Next soft-nav completing.
      }}
    >
      <BrandMark size={28} priority />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Task2Stock
      </span>
    </a>
  );
}
