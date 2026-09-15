type GlassTag = "div" | "article" | "aside" | "section";

export function GlassSurface({
  as: Tag = "div",
  children,
  className = "",
  hover = false,
  ...rest
}: {
  as?: GlassTag;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`glass rounded-[22px] ${
        hover
          ? "transition duration-300 hover:scale-[1.008] hover:border-white/24 hover:brightness-[1.04]"
          : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
