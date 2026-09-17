const pill =
  "glass-chip inline-flex h-9 items-center justify-center text-[12px] font-medium text-foreground/78 transition hover:text-foreground";

export function NavbarCaButton() {
  return (
    <span
      aria-label="Contract address not applicable"
      className={`${pill} px-3`}
    >
      ca not applicable
    </span>
  );
}

export function NavbarTwitterButton() {
  return (
    <a
      href="https://x.com/task2stock"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Task2Stock on X"
      className={`${pill} w-9`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5 fill-current"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    </a>
  );
}

export function NavbarMetaButtons() {
  return (
    <div className="flex items-center gap-1.5">
      <NavbarCaButton />
      <NavbarTwitterButton />
    </div>
  );
}
