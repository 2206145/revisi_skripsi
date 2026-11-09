import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/portofolio — ambil semua portofolio milik lulusan yang sedang login
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lulusan = await prisma.lulusan.findUnique({
        where: { userId: (session.user as any).id },
        select: { id: true },
    });

    if (!lulusan) return NextResponse.json([], { status: 200 });

    const data = await prisma.portofolio.findMany({
        where: { lulusanId: lulusan.id },
        orderBy: [{ tahun: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(data);
}

// POST /api/portofolio — tambah item portofolio baru
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lulusan = await prisma.lulusan.findUnique({
        where: { userId: (session.user as any).id },
        select: { id: true },
    });

    if (!lulusan) return NextResponse.json({ error: "Lulusan tidak ditemukan" }, { status: 404 });

    const { judul, kategori, deskripsi, fileUrl, namaFile, tipeFile, keahlian, tahun } = await req.json();

    if (!judul || !kategori) {
        return NextResponse.json({ error: "Judul dan kategori wajib diisi" }, { status: 400 });
    }

    const data = await prisma.portofolio.create({
        data: {
            lulusanId: lulusan.id,
            judul,
            kategori,
            deskripsi: deskripsi || null,
            fileUrl: fileUrl || null,
            namaFile: namaFile || null,
            tipeFile: tipeFile || null,
            keahlian: keahlian || null,
            tahun: tahun ? Number(tahun) : null,
        },
    });

    return NextResponse.json(data, { status: 201 });
}
