import "server-only";

import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "@/lib/data/config";

const globalForPrisma = globalThis as {
  prisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      datasources: {
        db: {
          url: getDatabaseUrl(),
        },
      },
    });
  }

  return globalForPrisma.prisma;
}
