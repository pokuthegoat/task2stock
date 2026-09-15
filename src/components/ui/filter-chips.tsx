export function FilterChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className="filter-chip glass-chip px-3 py-1.5 text-[12px] font-medium"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
