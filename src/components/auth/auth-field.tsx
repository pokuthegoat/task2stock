import { Input } from "@/components/ui/input";

type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
};

export function AuthField(props: AuthFieldProps) {
  return <Input {...props} />;
}
