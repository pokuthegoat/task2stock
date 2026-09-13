import { Button } from "@/components/ui/button";

export function GoogleButton({ enabled = false }: { enabled?: boolean }) {
  if (!enabled) {
    return (
      <div>
        <Button type="button" variant="secondary" disabled className="w-full">
          Continue with Google
        </Button>
        <p className="mt-2 text-center text-xs text-foreground/40">
          Coming soon
        </p>
      </div>
    );
  }

  return (
    <a
      href="/auth/google"
      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/14 bg-white/[0.06] px-5 text-sm font-medium tracking-tight text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md transition duration-300 hover:scale-[1.02] hover:border-white/22 hover:bg-white/[0.1]"
    >
      Continue with Google
    </a>
  );
}
