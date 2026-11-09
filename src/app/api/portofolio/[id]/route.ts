import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

// Helper: hapus file dari disk jika ada
async function deleteFileFromDisk(fileUrl: string | null) {
    if (!fileUrl) return;
    try {
        const filePath = path.join(process.cwd(), "public", fileUrl);
        await unlink(filePath);
    } catch {
        // file mungkin tidak ada, abaikan error
    }
}

// PUT /api/portofolio/[id] — update item portofolio
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lulusan = await prisma.lulusan.findUnique({
        where: { userId: (session.user as any).id },
        select: { id: true },
    });

    // Pastikan portofolio milik lulusan yang sedang login
    const existing = await prisma.portofolio.findUnique({ where: { id: params.id } });
    if (!existing || existing.lulusanId !== lulusan?.id) {
        return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    const { judul, kategori, deskripsi, fileUrl, namaFile, tipeFile, keahlian, tahun } = await req.json();

    // Jika file diganti, hapus file lama dari disk
    if (fileUrl !== existing.fileUrl && existing.fileUrl) {
        await deleteFileFromDisk(existing.fileUrl);
    }

    const data = await prisma.portofolio.update({
        where: { id: params.id },
        data: {
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

    return NextResponse.json(data);
}

// DELETE /api/portofolio/[id] — hapus item portofolio
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lulusan = await prisma.lulusan.findUnique({
        where: { userId: (session.user as any).id },
        select: { id: true },
    });

    const existing = await prisma.portofolio.findUnique({ where: { id: params.id } });
    if (!existing || existing.lulusanId !== lulusan?.id) {
        return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    }

    // Hapus file dari disk sebelum menghapus record
    await deleteFileFromDisk(existing.fileUrl);

    await prisma.portofolio.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
