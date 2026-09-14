import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { companies, taskLines, tasks } from "../src/data/fixtures";
import { taskLineId } from "../src/lib/data/db/mappers";

const ENV_FILES = [".env.local", "env.local", ".env.production.local"];

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

async function main() {
  loadEnvFiles();

  const url = process.env.TURSO_DATABASE_URL?.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

  if (!url || !authToken) {
    throw new Error(
      "Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN. Put them in env.local and rerun.",
    );
  }

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "file:./dev.db";
  }

  const prisma = new PrismaClient({
    adapter: new PrismaLibSQL({ url, authToken }),
  });

  try {
    for (const [sortOrder, company] of companies.entries()) {
      await prisma.company.upsert({
        where: { id: company.id },
        create: { ...company, sortOrder },
        update: { ...company, sortOrder },
      });
    }

    for (const [sortOrder, task] of tasks.entries()) {
      const { reward, ...record } = task;

      await prisma.task.upsert({
        where: { id: record.id },
        create: { ...record, sortOrder },
        update: { ...record, sortOrder },
      });

      await prisma.rewardOffer.upsert({
        where: { taskId: record.id },
        create: {
          taskId: record.id,
          amountCents: reward.amountCents,
          ticker: reward.ticker,
        },
        update: {
          amountCents: reward.amountCents,
          ticker: reward.ticker,
        },
      });
    }

    for (const line of taskLines) {
      const id = taskLineId(line.taskId, line.kind, line.sortOrder);

      await prisma.taskLine.upsert({
        where: { id },
        create: { id, ...line },
        update: { ...line },
      });
    }

    console.log("Turso catalog seed complete:", {
      companies: await prisma.company.count(),
      tasks: await prisma.task.count(),
      rewardOffers: await prisma.rewardOffer.count(),
      taskLines: await prisma.taskLine.count(),
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
