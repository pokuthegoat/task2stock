"use client";

import { useState } from "react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_034306_b4af8200-cdba-4dc8-b46d-ba7eb9c68c44.mp4";

export function HeroMedia() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {failed ? null : (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/70 to-background" />
    </div>
  );
}
