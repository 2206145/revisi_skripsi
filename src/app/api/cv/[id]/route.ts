import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/cv/[id]
 * Mengembalikan data lulusan untuk generate CV PDF.
 * Hanya bisa diakses user yang sudah login.
 */
export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const lulusan = await prisma.lulusan.findUnique({
            where: { id: params.id },
            include: {
                user: { select: { email: true } },
                jurusan: { select: { nama: true } },
                tracerStudy: true,
                portofolio: { orderBy: { tahun: "desc" } },
            },
        });

        if (!lulusan) {
            return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        // Susun response sesuai interface CVData
        const result = {
            nama: lulusan.nama,
            email: lulusan.user?.email ?? null,
            noHp: lulusan.noHp ?? null,
            alamat: lulusan.alamat ?? null,
            jenisKelamin: lulusan.jenisKelamin ?? null,
            tahunMasuk: lulusan.tahunMasuk ?? (lulusan.tahunLulus ? lulusan.tahunLulus - 3 : null),
            tahunLulus: lulusan.tahunLulus ?? null,
            jurusan: lulusan.jurusan ? { nama: lulusan.jurusan.nama } : null,
            tracerStudy: lulusan.tracerStudy
                ? {
                    status: lulusan.tracerStudy.status,
                    namaPerusahaan: lulusan.tracerStudy.namaPerusahaan ?? null,
                    jabatan: lulusan.tracerStudy.jabatan ?? null,
                    mulaiKerja: lulusan.tracerStudy.mulaiKerja ?? null,
                    masaKerja: lulusan.tracerStudy.masaKerja ?? null,
                    alamatInstansi: lulusan.tracerStudy.alamatInstansi ?? null,
                    deskripsiPekerjaan: lulusan.tracerStudy.deskripsiPekerjaan ?? null,
                    gaji: lulusan.tracerStudy.gaji ?? null,
                    sesuaiKeahlian: lulusan.tracerStudy.sesuaiKeahlian ?? null,
                    namaKampus: lulusan.tracerStudy.namaKampus ?? null,
                    jurusanStudi: lulusan.tracerStudy.jurusanStudi ?? null,
                    alamatUniversitas: lulusan.tracerStudy.alamatUniversitas ?? null,
                    bulanTahunStudi: lulusan.tracerStudy.bulanTahunStudi ?? null,
                    namaUsaha: lulusan.tracerStudy.namaUsaha ?? null,
                    keterangan: lulusan.tracerStudy.keterangan ?? null,
                }
                : null,
            portofolio: lulusan.portofolio.map((p) => ({
                judul: p.judul,
                kategori: p.kategori ?? null,
                tahun: p.tahun ?? null,
                deskripsi: p.deskripsi ?? null,
                keahlian: p.keahlian ?? null,
            })),
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("[API /api/cv/:id] Error:", err);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
