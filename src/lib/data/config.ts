/**
 * Persistence configuration seam.
 * DATABASE_URL is server-only. Do not prefix it with NEXT_PUBLIC_.
 * Auth sessions live in the same database; no client auth secrets.
 */

export type DataSourceName = "fixtures" | "database";

export function getDataSource(): DataSourceName {
  return process.env.DATA_SOURCE === "database" ? "database" : "fixtures";
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env — the default is a local SQLite file.",
    );
  }

  return url;
}

export function isDatabaseSource(): boolean {
  return getDataSource() === "database";
}
