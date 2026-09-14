import "server-only";

import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl, getTursoConfig } from "@/lib/data/config";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const turso = getTursoConfig();

  if (turso) {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "file:./dev.db";
    }

    return new PrismaClient({
      adapter: new PrismaLibSQL({
        url: turso.url,
        authToken: turso.authToken,
      }),
    });
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}
