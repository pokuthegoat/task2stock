type TextareaProps = {
  id: string;
  name: string;
  label: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

export function Textarea({
  id,
  name,
  label,
  error,
  value,
  onChange,
  placeholder,
  rows = 6,
}: TextareaProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field-textarea mt-2 ${error ? "border-[#c9a9a2]/50" : ""}`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-[#d4b4ae]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
