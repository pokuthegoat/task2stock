import { PageContainer } from "@/components/ui/page-container";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-[440px]">
        <p className="label">{eyebrow}</p>
        <h1 className="display mt-4 text-4xl text-foreground">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-foreground/58">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </PageContainer>
  );
}
