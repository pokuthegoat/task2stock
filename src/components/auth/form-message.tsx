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
      ? "rounded-full border border-accent/30 bg-accent/8 px-4 py-3 text-xs leading-5 text-accent"
      : "rounded-full border border-[#c9a9a2]/30 bg-[#c9a9a2]/8 px-4 py-3 text-xs leading-5 text-[#d4b4ae]";

  return (
    <p role="alert" className={classes}>
      {message}
    </p>
  );
}
