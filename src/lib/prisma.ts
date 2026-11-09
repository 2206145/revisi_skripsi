import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Tambahkan parameter connection pool ke DATABASE_URL
// connection_limit=5 → hemat resource, cukup untuk dev/skripsi
// connect_timeout=10 → batas waktu koneksi awal ke PostgreSQL (detik)
function buildDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}connection_limit=5&connect_timeout=10`;
}

const dbUrl = buildDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"],
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  // Pre-warm koneksi database saat server pertama kali start
  // Ini mengurangi "cold start" pada request pertama ke DB
  prisma.$connect().catch(() => {
    // Abaikan error pre-warm — koneksi akan dibuat ulang saat request pertama
  });
}
