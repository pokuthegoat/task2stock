import Link from "next/link";
import { BrandMark } from "@/components/site/brand-mark";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <BrandMark size={28} priority />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        Task2Stock
      </span>
    </Link>
  );
}
