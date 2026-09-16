"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { PrivyLoginButton } from "@/components/auth/privy-login-button";
import { Logo } from "@/components/site/logo";
import { NavbarMetaButtons } from "@/components/site/navbar-meta";
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
    <header className="sticky top-0 z-50 py-3 md:py-4">
      <PageContainer>
        <div className="glass-nav grid h-14 grid-cols-[1fr_auto] items-center gap-3 rounded-full pl-4 pr-2 md:grid-cols-[auto_1fr_auto] md:px-3">
          <Logo className="justify-self-start" />

          <nav className="hidden items-center justify-center justify-self-center gap-1 md:flex">
            {links.map((link) =>
              link.href.startsWith("/#") ? (
                <a key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                  data-active={isActive(link.href)}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          <div className="hidden items-center justify-end justify-self-end gap-2 md:flex">
            <NavbarMetaButtons />
            {user ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            ) : (
              <>
                <PrivyLoginButton
                  size="sm"
                  variant="ghost"
                  compact
                  label="Connect Wallet"
                />
                <Button href="/tasks" size="sm">
                  Start earning
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="glass-chip flex h-10 w-10 items-center justify-center text-foreground transition hover:brightness-110 md:hidden"
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
        </div>

        {open ? (
          <div
            id="mobile-nav"
            className="glass-panel mt-3 p-5 md:hidden"
          >
            <nav className="grid gap-1">
              {links.map((link) =>
                link.href.startsWith("/#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="nav-link text-[15px]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="nav-link text-[15px]"
                    data-active={isActive(link.href)}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
            <hr className="hairline my-4" />
            <NavbarMetaButtons />
            <div className="mt-3 grid gap-3">
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
                  <PrivyLoginButton
                    size="md"
                    variant="secondary"
                    className="w-full"
                    compact
                    label="Connect Wallet"
                  />
                  <Button href="/tasks" onClick={() => setOpen(false)}>
                    Start earning
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </PageContainer>
    </header>
  );
}
