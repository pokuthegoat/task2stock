export function FormMessage({
  message,
  tone = "error",
}: {
  message: string | null;
  tone?: "error" | "success";
}) {
  if (!message) return null;

  const classes =
    tone === "success"
      ? "border-accent/30 bg-accent/10 text-accent"
      : "border-[#c9a9a2]/30 bg-[#c9a9a2]/10 text-[#d4b4ae]";

  return (
    <p
      role="alert"
      className={`rounded-2xl border px-4 py-3 text-xs leading-5 backdrop-blur-md ${classes}`}
    >
      {message}
    </p>
  );
}
