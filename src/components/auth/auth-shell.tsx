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
      <div className="glass-panel mx-auto w-full max-w-[480px] px-6 py-10 md:px-10 md:py-12">
        <div className="text-center">
          <p className="label">{eyebrow}</p>
          <h1 className="display mt-4 text-4xl text-foreground">{title}</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-foreground/58">
            {description}
          </p>
        </div>
        <hr className="hairline my-8" />
        {children}
      </div>
    </PageContainer>
  );
}
