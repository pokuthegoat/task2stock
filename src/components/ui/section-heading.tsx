type HeadingTag = "h1" | "h2" | "h3";

export function SectionHeading({
  eyebrow,
  title,
  description,
  as = "h2",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: HeadingTag;
  className?: string;
}) {
  const Title = as;

  return (
    <div className={`max-w-2xl ${className}`}>
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
        <p className="mt-5 max-w-xl text-base leading-7 text-foreground/58 sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
