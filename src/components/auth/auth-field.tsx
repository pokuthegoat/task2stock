import { Input } from "@/components/ui/input";

type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "url";
  autoComplete?: string;
  error?: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function AuthField(props: AuthFieldProps) {
  return <Input {...props} />;
}
