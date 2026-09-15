import { Button } from "@/components/ui/button";

export function GoogleContinueButton() {
  return (
    <Button
      href="/api/auth/google"
      variant="secondary"
      size="lg"
      className="w-full"
    >
      Continue with Google
    </Button>
  );
}

export function AuthMethodDivider() {
  return (
    <div className="flex items-center gap-4">
      <span className="hairline flex-1" />
      <span className="text-xs text-foreground/38">or</span>
      <span className="hairline flex-1" />
    </div>
  );
}
