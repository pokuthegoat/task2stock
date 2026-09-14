type InputProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "search" | "url";
  autoComplete?: string;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function Input({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
  hint,
  value,
  onChange,
  placeholder,
  disabled = false,
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
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`field-input mt-2 ${error ? "border-[#c9a9a2]/50" : ""} ${
          disabled ? "opacity-50" : ""
        }`}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-[#d4b4ae]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-xs text-foreground/45">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
