type GlassTag = "div" | "article" | "aside" | "section" | "li";

const tiers = {
  glass: "glass rounded-[22px]",
  panel: "glass-panel",
  tile: "glass-tile",
  chip: "glass-chip",
};

export function GlassSurface({
  as: Tag = "div",
  tier = "glass",
  children,
  className = "",
  hover = false,
  ...rest
}: {
  as?: GlassTag;
  tier?: keyof typeof tiers;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag
      className={`${tiers[tier]} ${hover ? "glass-tile-hover" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
