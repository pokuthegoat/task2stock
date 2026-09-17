import Link from "next/link";
import type { ComponentProps } from "react";

export function GlowLink({
  className = "",
  contentClassName = "relative z-[1] flex h-full flex-col",
  children,
  ...rest
}: ComponentProps<typeof Link> & { contentClassName?: string }) {
  return (
    <Link className={`relative isolate ${className}`} {...rest}>
      <span className={contentClassName}>{children}</span>
    </Link>
  );
}
