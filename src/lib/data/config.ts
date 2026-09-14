/**
 * Persistence configuration seam.
 * DATABASE_URL is server-only. Do not prefix it with NEXT_PUBLIC_.
 * Auth sessions live in the same database. GOOGLE_CLIENT_SECRET is server-only.
 */

export type DataSourceName = "fixtures" | "database";

export type TursoConfig = {
  url: string;
  authToken: string;
};

export function getDataSource(): DataSourceName {
  return process.env.DATA_SOURCE === "database" ? "database" : "fixtures";
}

export function getTursoConfig(): TursoConfig | null {
  const url = process.env.TURSO_DATABASE_URL?.trim() || "";
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || "";

  if (!url && !authToken) {
    return null;
  }

  if (!url || !authToken) {
    throw new Error(
      "Hosted SQLite on Vercel requires both TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    );
  }

  return { url, authToken };
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env — the default is a local SQLite file.",
    );
  }

  if (process.env.VERCEL && url.startsWith("file:")) {
    throw new Error(
      "SQLite file databases cannot persist on Vercel. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    );
  }

  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    throw new Error(
      "DATABASE_URL is a Postgres URL, but this Prisma schema uses SQLite. Use TURSO_DATABASE_URL for production.",
    );
  }

  return url;
}

export function isDatabaseSource(): boolean {
  return getDataSource() === "database";
}
