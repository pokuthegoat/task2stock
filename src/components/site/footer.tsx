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
    <footer className="mt-auto pb-6 pt-10 md:pb-10">
      <PageContainer>
        <div className="glass-panel px-6 py-10 md:px-10 md:py-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-foreground/55">
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
                      className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <hr className="hairline my-8" />
          <p className="text-center text-xs leading-5 text-foreground/40">
            © 2026 Task2Stock
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
