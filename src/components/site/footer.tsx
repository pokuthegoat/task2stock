import { Logo } from "@/components/site/logo";
import { PageContainer } from "@/components/ui/page-container";

const links = [
  { href: "/tasks", label: "Tasks" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Sign in" },
  { href: "/signup", label: "Sign up" },
];

export function Footer() {
  return (
    <footer className="section-lift mt-auto">
      <PageContainer className="grid gap-10 py-14 md:grid-cols-2 md:items-start md:py-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-foreground/50">
            Do tasks. Earn stocks. Work that is meant to become ownership.
          </p>
        </div>
        <nav className="md:justify-self-end md:text-right">
          <p className="label">Task2Stock</p>
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-foreground/58 transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageContainer>
      <PageContainer>
        <div className="flex flex-col gap-3 border-t border-white/8 py-5 text-xs leading-5 text-foreground/38 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Task2Stock</p>
          <p>Verification and stock settlement are not live.</p>
        </div>
      </PageContainer>
    </footer>
  );
}
