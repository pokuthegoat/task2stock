import Image from "next/image";

export const BRAND_MARK_SRC = "/brand/t__xvgGX_400x400.jpg";

export function BrandMark({
  size = 28,
  className = "",
  decorative = true,
  priority = false,
}: {
  size?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-lg ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={BRAND_MARK_SRC}
        alt={decorative ? "" : "Task2Stock"}
        width={400}
        height={400}
        className="h-full w-full object-contain"
        sizes={`${size}px`}
        priority={priority}
      />
    </span>
  );
}
