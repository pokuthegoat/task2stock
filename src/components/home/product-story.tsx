"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  {
    title: "Find a task",
    copy: "Browse tasks and choose one you want to complete.",
    poster: "/posters/poster 1.png",
  },
  {
    title: "Complete it",
    copy: "Follow the requirements and finish the task.",
    poster: "/posters/poster 2.png",
  },
  {
    title: "Submit proof",
    copy: "Send evidence showing that you completed it.",
    poster: "/posters/poster 3.png",
  },
  {
    title: "Pending verification",
    copy: "Your submission is reviewed. Verification is not automatic.",
    poster: "/posters/poster 4.png",
  },
  {
    title: "Earn stocks",
    copy: "Once verified, your stock reward is issued.",
    poster: "/posters/poster 5.png",
  },
  {
    title: "Build ownership",
    copy: "Issued rewards collect as a record of work — ownership as the destination of the loop.",
    poster: "/posters/poster 6.png",
  },
] as const;

function StoryChapter({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const posterOnLeft = index % 2 === 1;
  const number = String(index + 1).padStart(2, "0");

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }

        const rect = entry.boundingClientRect;
        const inView =
          rect.top < window.innerHeight * 0.82 &&
          rect.bottom > window.innerHeight * 0.14;

        if (!inView) {
          return;
        }

        node.classList.add("is-visible");
        observer.disconnect();
      },
      { threshold: [0, 0.12, 0.24, 0.4], rootMargin: "0px 0px -8% 0px" },
    );

    const start = window.requestAnimationFrame(() => {
      observer.observe(node);
    });

    return () => {
      window.cancelAnimationFrame(start);
      observer.disconnect();
    };
  }, []);

  return (
    <article
      ref={ref}
      className={`story-chapter grid items-center gap-10 py-16 md:gap-14 md:py-24 lg:min-h-[86vh] xl:gap-x-24 ${
        posterOnLeft
          ? "lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-x-16"
          : "lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-x-16"
      }`}
    >
      <div
        className={`story-chapter-copy max-w-md ${
          posterOnLeft ? "lg:order-2 lg:justify-self-end" : "lg:justify-self-start"
        }`}
      >
        <p className="label text-accent">Step {number}</p>
        <h3 className="heading mt-5 text-3xl text-foreground md:text-5xl">
          {step.title}
        </h3>
        <p className="mt-5 max-w-sm text-base leading-7 text-foreground/58 md:text-lg md:leading-8">
          {step.copy}
        </p>
      </div>

      <div
        className={`story-chapter-poster ${
          posterOnLeft ? "lg:order-1" : ""
        }`}
      >
        <div className="relative aspect-[896/1120] overflow-hidden rounded-[1.75rem] border border-white/16">
          <Image
            src={step.poster}
            alt={step.title}
            width={896}
            height={1120}
            className="h-full w-full object-contain"
            sizes="(min-width: 1024px) 560px, 92vw"
          />
        </div>
      </div>
    </article>
  );
}

export function ProductStory() {
  return (
    <section id="how-it-works" className="section-lift py-20 md:py-28">
      <PageContainer>
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="How it works"
            title="Action becomes a stock reward."
            description="The same product interface, from choosing a task to owning the reward."
          />
        </Reveal>

        <div className="mt-10 md:mt-16">
          {steps.map((step, index) => (
            <StoryChapter key={step.poster} step={step} index={index} />
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
