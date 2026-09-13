import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  primary:
    "border-accent/40 bg-accent/92 text-[#161513] hover:scale-[1.02] hover:bg-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  secondary:
    "border-white/14 bg-white/[0.06] text-foreground backdrop-blur-md hover:scale-[1.02] hover:border-white/22 hover:bg-white/[0.1]",
  ghost: "border-transparent bg-transparent text-foreground/70 hover:text-foreground",
};

export function Button({
  href,
  variant = "primary",
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium tracking-tight shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition duration-300 ${variants[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`;

  if (href) {
    const isAppPath = href.startsWith("/") && !href.includes("#");

    if (isAppPath) {
      return (
        <Link href={href} className={classes} onClick={onClick}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
