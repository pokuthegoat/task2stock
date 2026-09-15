type HeadingTag = "h1" | "h2" | "h3";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: HeadingTag;
  align?: "left" | "center";
  className?: string;
}) {
  const Title = as;
  const centered = align === "center";

  return (
    <div
      className={`${centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}
    >
      {eyebrow ? <p className="label">{eyebrow}</p> : null}
      <Title
        className={`display text-foreground ${
          as === "h1"
            ? "mt-4 text-4xl sm:text-5xl md:text-6xl"
            : "mt-4 text-3xl sm:text-4xl md:text-5xl"
        }`}
      >
        {title}
      </Title>
      {description ? (
        <p
          className={`mt-5 text-base leading-7 text-foreground/62 sm:text-lg sm:leading-8 ${
            centered ? "mx-auto max-w-xl" : "max-w-xl"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
