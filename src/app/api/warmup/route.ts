import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Route warmup: dipanggil otomatis saat server start (via next.config.js)
 * untuk memastikan koneksi DB sudah aktif sebelum user pertama login.
 * Tidak memiliki autentikasi karena hanya melakukan query ringan.
 */
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Query ringan untuk "pemanasan" koneksi DB
        await prisma.$queryRaw`SELECT 1`;
        return NextResponse.json({ ok: true, ts: Date.now() });
    } catch {
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
