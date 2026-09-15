export function EmptyState({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass-panel px-6 py-16 text-center md:py-20">
      <p className="label">{eyebrow}</p>
      <h2 className="heading mx-auto mt-4 max-w-xl text-3xl text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-foreground/68">
        {description}
      </p>
      {children ? (
        <div className="mt-8 flex justify-center">{children}</div>
      ) : null}
    </div>
  );
}
