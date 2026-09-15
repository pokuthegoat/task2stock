"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

export function GlowLink({
  className = "",
  contentClassName = "relative z-[1] flex h-full flex-col",
  children,
  ...rest
}: ComponentProps<typeof Link> & { contentClassName?: string }) {
  return (
    <Link
      className={`relative isolate ${className}`}
      {...rest}
      onMouseMove={(event) => {
        rest.onMouseMove?.(event);
        const node = event.currentTarget;
        const box = node.getBoundingClientRect();
        node.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
        node.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
      }}
    >
      <span className="pointer-glow" aria-hidden="true" />
      <span className={contentClassName}>{children}</span>
    </Link>
  );
}
