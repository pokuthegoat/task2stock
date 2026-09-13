import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-[#161513]">
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true">
          <rect x="3" y="9" width="2.2" height="4" rx="0.5" fill="currentColor" />
          <rect x="7" y="6" width="2.2" height="7" rx="0.5" fill="currentColor" />
          <rect
            x="11"
            y="3.5"
            width="2.2"
            height="9.5"
            rx="0.5"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Task2Stock
      </span>
    </Link>
  );
}
