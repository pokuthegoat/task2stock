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
    "btn-glass border-white/30 bg-accent/74 text-[#161513] shadow-[inset_0_1px_0_rgba(255,255,255,0.46)] hover:border-white/40 hover:bg-accent/88",
  secondary:
    "btn-glass border-white/14 bg-white/[0.08] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:border-white/22 hover:bg-white/[0.14]",
  ghost:
    "border-transparent bg-transparent text-foreground/70 hover:bg-white/[0.05] hover:text-foreground",
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
  const classes = `inline-flex h-11 items-center justify-center rounded-full border px-5 text-sm font-medium tracking-tight transition duration-300 ${variants[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`;

  if (href) {
    const isAppPath =
      href.startsWith("/") &&
      !href.startsWith("/api/") &&
      !href.includes("#");

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
