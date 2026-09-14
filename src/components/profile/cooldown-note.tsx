import type { CooldownView } from "@/lib/auth/cooldown";

export function CooldownNote({ cooldown }: { cooldown: CooldownView }) {
  return (
    <p className="mt-3 text-xs leading-5 text-foreground/45">{cooldown.label}</p>
  );
}
