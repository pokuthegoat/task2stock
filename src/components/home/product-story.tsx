"use client";

import { useEffect, useRef, useState } from "react";
import { LoopVisual, type LoopStage } from "@/components/home/loop-visual";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps: Array<{
  stage: LoopStage;
  title: string;
  copy: string;
}> = [
  {
    stage: "task",
    title: "Find a task",
    copy: "Browse the marketplace. Every listing is real catalog work from a company, brand, or community.",
  },
  {
    stage: "complete",
    title: "Complete it",
    copy: "Do the requirement as written — a run, a video, a store visit, or another real action.",
  },
  {
    stage: "proof",
    title: "Submit proof",
    copy: "Add a short note, attach a PNG, JPEG, WEBP, or PDF, or both. Empty submissions are not accepted.",
  },
  {
    stage: "verified",
    title: "Get verified",
    copy: "A trusted operator can mark that proof verified. Automated verification is not connected.",
  },
  {
    stage: "reward",
    title: "Earn stocks",
    copy: "After verification, the intended tokenized stock reward can be marked issued. Issuance is not live settlement.",
  },
  {
    stage: "portfolio",
    title: "Build your portfolio",
    copy: "Issued rewards collect with your account. This is a record of granted rewards, not a performance forecast.",
  },
];

export function ProductStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    const nodes = refs.current.filter((node): node is HTMLLIElement => Boolean(node));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const index = nodes.indexOf(visible.target as HTMLLIElement);

        if (index >= 0) {
          setActive(index);
        }
      },
      { threshold: 0.45, rootMargin: "-12% 0px -12% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="section-lift py-16 md:py-24">
      <PageContainer>
        <SectionHeading
          eyebrow="How it works"
          title="Action becomes a stock reward."
          description="The loop as it exists today. Review and issuance are operator steps, not an automated market."
        />

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <LoopVisual stage={steps[active]?.stage ?? "task"} />

          <ol className="space-y-8">
            {steps.map((step, index) => (
              <li
                key={step.stage}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                className={`transition-opacity duration-300 ${
                  index === 0 ? "" : "border-t border-white/8 pt-8"
                } ${active === index ? "opacity-100" : "opacity-55"}`}
              >
                <p className="label">
                  Step {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="heading mt-4 text-3xl text-foreground md:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-md text-base leading-7 text-foreground/58">
                  {step.copy}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
