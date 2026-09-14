import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@libsql/client";

const MIGRATIONS_DIR = join(process.cwd(), "prisma", "migrations");
const ENV_FILES = [".env.local", "env.local", ".env.production.local"];

const REQUIRED_TABLES = [
  "User",
  "AuthSession",
  "Company",
  "Task",
  "TaskLine",
  "RewardOffer",
  "TaskAttempt",
  "TaskCompletion",
  "ProofSubmission",
  "VerificationRecord",
  "Reward",
  "Holding",
  "_prisma_migrations",
] as const;

function loadEnvFiles() {
  for (const file of ENV_FILES) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;

    const text = readFileSync(path, "utf8").replace(/^\uFEFF/, "");

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;

      const assignment = line.startsWith("export ")
        ? line.slice("export ".length).trim()
        : line;
      const eq = assignment.indexOf("=");
      if (eq < 1) continue;

      const key = assignment.slice(0, eq).trim();
      let value = assignment.slice(eq + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (process.env[key] === undefined) {
        if (key === "TURSO_AUTH_TOKEN" && /^Bearer\s+/i.test(value)) {
          value = value.replace(/^Bearer\s+/i, "").trim();
        }

        process.env[key] = value.trim();
      }
    }
  }
}

function checksum(sql: string) {
  return createHash("sha256").update(sql).digest("hex");
}

function migrationDirs() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d{14}_/.test(name))
    .sort();
}

function describeUrl(url: string) {
  try {
    const parsed = new URL(url.replace(/^libsql:/, "https:"));
    return `${parsed.protocol.replace("https:", "libsql:")}//${parsed.host}`;
  } catch {
    return "libsql://(unparsed)";
  }
}

async function main() {
  loadEnvFiles();

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    throw new Error(
      "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Put them in gitignored .env.local (do not commit) and rerun npm run db:turso-migrate.",
    );
  }

  const client = createClient({ url, authToken });

  console.log(`Applying Prisma migrations to ${describeUrl(url)}`);

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "checksum" TEXT NOT NULL,
      "finished_at" DATETIME,
      "migration_name" TEXT NOT NULL,
      "logs" TEXT,
      "rolled_back_at" DATETIME,
      "started_at" DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER NOT NULL DEFAULT 0
    );
  `);

  const appliedRows = await client.execute(
    'SELECT "migration_name" FROM "_prisma_migrations" WHERE "rolled_back_at" IS NULL',
  );
  const applied = new Set(
    appliedRows.rows.map((row) => String(row.migration_name)),
  );

  for (const name of migrationDirs()) {
    if (applied.has(name)) {
      console.log(`skip ${name} (already applied)`);
      continue;
    }

    const sql = readFileSync(join(MIGRATIONS_DIR, name, "migration.sql"), "utf8");
    const id = randomUUID();

    await client.execute({
      sql: `INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "applied_steps_count") VALUES (?, ?, ?, CURRENT_TIMESTAMP, 0)`,
      args: [id, checksum(sql), name],
    });

    try {
      await client.executeMultiple(sql);
      await client.execute({
        sql: `UPDATE "_prisma_migrations" SET "finished_at" = CURRENT_TIMESTAMP, "applied_steps_count" = 1 WHERE "id" = ?`,
        args: [id],
      });
      console.log(`applied ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await client.execute({
        sql: `UPDATE "_prisma_migrations" SET "logs" = ?, "rolled_back_at" = CURRENT_TIMESTAMP WHERE "id" = ?`,
        args: [message, id],
      });
      throw error;
    }
  }

  const tables = await client.execute(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
  );
  const names = tables.rows.map((row) => String(row.name));
  const missing = REQUIRED_TABLES.filter((table) => !names.includes(table));

  if (missing.length) {
    throw new Error(`Turso schema missing tables: ${missing.join(", ")}`);
  }

  const recorded = await client.execute(
    `SELECT "migration_name" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL AND "rolled_back_at" IS NULL ORDER BY "started_at"`,
  );

  console.log("tables", names.join(", "));
  console.log(
    "migrations",
    recorded.rows.map((row) => String(row.migration_name)).join(", "),
  );
  console.log("Turso database contains the migrated Prisma schema.");

  client.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
