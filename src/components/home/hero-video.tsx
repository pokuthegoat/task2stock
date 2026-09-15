"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_034306_229eccbe-fd8f-40fb-8002-9868ef2bb1a8.mp4";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function HeroVideo() {
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    const video = videoRef.current;

    if (!layer || !video) {
      return;
    }

    // Playback is driven only by scroll position, never by the element itself.
    video.pause();

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const compact = window.matchMedia("(max-width: 640px)").matches;
    const ease = compact ? 0.24 : 0.16;
    const step = compact ? 0.05 : 0.03;

    let raf = 0;
    let target = 0;
    let shown = 0;
    let onScreen = true;
    let range = 1;

    const measure = () => {
      const rect = layer.getBoundingClientRect();
      range = Math.max(rect.bottom + window.scrollY, 1);
    };

    const seek = () => {
      if (video.readyState < 1 || !Number.isFinite(shown)) {
        return;
      }

      if (Math.abs(video.currentTime - shown) > step) {
        video.currentTime = shown;
      }
    };

    const tick = () => {
      raf = 0;
      const diff = target - shown;

      // Settling here is what makes the video hold still once scrolling stops.
      if (Math.abs(diff) < 0.012) {
        shown = target;
        seek();
        return;
      }

      shown += diff * ease;
      seek();
      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf || !onScreen) return;
      raf = window.requestAnimationFrame(tick);
    };

    const update = () => {
      const duration = video.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const progress = clamp(window.scrollY / range, 0, 1);
      target = progress * (duration - 0.05);
      start();
    };

    const onResize = () => {
      measure();
      update();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? true;

        if (onScreen) {
          update();
        } else if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "120px 0px" },
    );

    observer.observe(layer);
    measure();
    video.addEventListener("loadedmetadata", update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize);
    update();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      video.removeEventListener("loadedmetadata", update);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="hero-video-layer pointer-events-none absolute inset-x-0 -top-16 bottom-0 z-0 overflow-hidden md:-top-[72px]"
    >
      {failed ? null : (
        <video
          ref={videoRef}
          className="hero-video-media"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
          onError={() => setFailed(true)}
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
      )}
      <span className="hero-video-scrim" />
    </div>
  );
}
