export function Stat({
  label,
  value,
  note,
  accent = false,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <p
        className={`stat-value mt-3 text-3xl ${
          accent ? "text-positive" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {note ? <p className="mt-2 text-xs text-foreground/40">{note}</p> : null}
    </div>
  );
}
