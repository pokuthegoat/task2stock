import { Button } from "@/components/ui/button";

export function GoogleContinueButton() {
  return (
    <Button href="/api/auth/google" variant="secondary" className="w-full">
      Continue with Google
    </Button>
  );
}

export function AuthMethodDivider() {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-white/8" />
      <span className="text-xs text-foreground/35">or</span>
      <span className="h-px flex-1 bg-white/8" />
    </div>
  );
}
