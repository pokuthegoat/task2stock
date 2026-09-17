import Link from "next/link";

type ButtonProps = {
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  primary:
    "btn-glass border-white/35 bg-accent/78 text-[#15140f] hover:border-white/45 hover:bg-accent/90",
  secondary:
    "btn-glass border-white/14 bg-white/[0.08] text-foreground hover:border-white/24 hover:bg-white/[0.14]",
  ghost:
    "border-transparent bg-transparent text-foreground/70 hover:bg-white/[0.06] hover:text-foreground",
};

const sizes = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-7 text-[15px]",
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full border font-medium tracking-tight transition duration-300 ${sizes[size]} ${variants[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`;

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
