"use client";

import { useState } from "react";

export function ProfileAvatar({
  name,
  username,
  avatarUrl,
  size = "lg",
}: {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  const initial = (name.trim() || username || "?").charAt(0).toUpperCase();
  const box =
    size === "lg"
      ? "h-24 w-24 text-2xl"
      : "h-10 w-10 text-sm";

  if (avatarUrl && !failed) {
    return (
      // User-supplied https URL. next/image is not configured for arbitrary hosts.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        className={`${box} rounded-full object-cover ring-1 ring-white/12`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`${box} flex items-center justify-center rounded-full bg-white/[0.08] font-semibold text-foreground ring-1 ring-white/12`}
    >
      {initial}
    </div>
  );
}
