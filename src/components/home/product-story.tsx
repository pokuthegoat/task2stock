"use client";

import { useEffect, useRef, useState } from "react";
import { LoopVisual, type LoopStage } from "@/components/home/loop-visual";
import { PageContainer } from "@/components/ui/page-container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

const steps: Array<{
  stage: LoopStage;
  title: string;
  copy: string;
}> = [
  {
    stage: "find",
    title: "Find a task",
    copy: "Browse tasks and choose one you want to complete.",
  },
  {
    stage: "complete",
    title: "Complete it",
    copy: "Follow the requirements and finish the task.",
  },
  {
    stage: "proof",
    title: "Submit proof",
    copy: "Send evidence showing that you completed it.",
  },
  {
    stage: "verified",
    title: "Pending verification",
    copy: "Your submission is reviewed. Verification is not automatic.",
  },
  {
    stage: "reward",
    title: "Earn stocks",
    copy: "Once verified, your stock reward is issued.",
  },
  {
    stage: "own",
    title: "Build ownership",
    copy: "Issued rewards collect as a record of work — ownership as the destination of the loop.",
  },
];

function readActiveIndex(nodes: HTMLElement[], current: number) {
  const line = window.innerHeight * 0.42;
  const currentNode = nodes[current];

  if (currentNode) {
    const rect = currentNode.getBoundingClientRect();
    if (rect.top <= line && rect.bottom >= line) {
      return current;
    }
  }

  let next = current;
  let best = Number.POSITIVE_INFINITY;

  nodes.forEach((node, index) => {
    const rect = node.getBoundingClientRect();

    if (rect.top <= line && rect.bottom >= line) {
      next = index;
      best = 0;
      return;
    }

    const distance = rect.top > line ? rect.top - line : line - rect.bottom;

    if (distance < best) {
      best = distance;
      next = index;
    }
  });

  return next;
}

export function ProductStory() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLLIElement | null>>([]);
  const activeRef = useRef(0);

  useEffect(() => {
    const nodes = refs.current.filter((node): node is HTMLLIElement => Boolean(node));
    let frame = 0;

    const measure = () => {
      frame = 0;
      const next = readActiveIndex(nodes, activeRef.current);
      if (next === activeRef.current) return;
      activeRef.current = next;
      setActive(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const stage = steps[active]?.stage ?? "find";

  return (
    <section id="how-it-works" className="section-lift py-16 md:py-24">
      <PageContainer>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="Action becomes a stock reward."
            description="The same product interface, from choosing a task to owning the reward."
          />
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-16">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <LoopVisual stage={stage} />
            </div>
          </div>

          <ol className="lg:py-2">
            {steps.map((step, index) => (
              <li
                key={step.stage}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                className={`lg:min-h-[75vh] ${
                  index === 0
                    ? "pt-2"
                    : "border-t border-white/8 pt-10 lg:border-t-0 lg:pt-0"
                }`}
              >
                <div
                  className={`relative max-w-md lg:sticky lg:top-24 lg:py-2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                    active === index
                      ? "z-[1] opacity-100"
                      : "opacity-[0.46] lg:translate-y-1"
                  }`}
                >
                  <p
                    className={`label transition-colors duration-500 ${
                      active === index ? "text-accent" : ""
                    }`}
                  >
                    Step {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="heading mt-4 text-3xl text-foreground md:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-foreground/58">
                    {step.copy}
                  </p>
                </div>

                <div className="mt-8 lg:hidden">
                  <LoopVisual stage={step.stage} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </PageContainer>
    </section>
  );
}
