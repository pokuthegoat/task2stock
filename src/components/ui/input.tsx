type InputProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "search";
  autoComplete?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function Input({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
  value,
  onChange,
  placeholder,
}: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`field-input mt-2 ${error ? "border-[#c9a9a2]/50" : ""}`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-[#d4b4ae]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
