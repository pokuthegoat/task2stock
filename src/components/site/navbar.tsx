"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Logo } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/ui/page-container";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const links = user
    ? user.username
      ? [
          { href: "/tasks", label: "Tasks" },
          { href: "/work", label: "My Work" },
          { href: "/portfolio", label: "Portfolio" },
          { href: "/profile", label: "Profile" },
        ]
      : []
    : [
        { href: "/tasks", label: "Tasks" },
        { href: "/#how-it-works", label: "How it works" },
        { href: "/contact", label: "Contact" },
      ];

  function isActive(href: string) {
    if (href === "/tasks") {
      return pathname === "/tasks" || pathname.startsWith("/tasks/");
    }

    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <PageContainer className="flex h-16 items-center justify-between md:h-[72px]">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/58 transition-colors duration-300 hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-foreground/58 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Button variant="ghost" className="h-10 px-3" onClick={() => signOut()}>
              Sign out
            </Button>
          ) : (
            <>
              <Button href="/login" variant="ghost" className="h-10 px-3">
                Sign in
              </Button>
              <Button href="/tasks" className="h-10">
                Start earning
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Close menu" : "Menu"}</span>
          <span className="flex flex-col items-center justify-center gap-1.5">
            <span
              className={`block h-px w-4 bg-foreground transition ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-4 bg-foreground transition ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </PageContainer>

      {open ? (
        <div id="mobile-nav" className="border-t border-white/8 py-5 md:hidden">
          <PageContainer>
            <nav className="flex flex-col gap-4">
              {links.map((link) =>
                link.href.startsWith("/#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[15px] font-medium text-foreground/80"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-[15px] font-medium text-foreground/80"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
            <div className="mt-5 flex flex-col gap-3">
              {user ? (
                <Button
                  variant="secondary"
                  onClick={async () => {
                    await signOut();
                    setOpen(false);
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <>
                  <Button href="/login" variant="secondary" onClick={() => setOpen(false)}>
                    Sign in
                  </Button>
                  <Button href="/tasks" onClick={() => setOpen(false)}>
                    Start earning
                  </Button>
                </>
              )}
            </div>
          </PageContainer>
        </div>
      ) : null}
    </header>
  );
}
