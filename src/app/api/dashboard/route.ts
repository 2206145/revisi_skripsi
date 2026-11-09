import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Jalankan semua query secara paralel dengan field SELECT minimal
  const [totalLulusan, totalPerusahaan, totalLowongan, tracerAgg, jurusanList] =
    await Promise.all([
      // Hanya COUNT → sangat cepat
      prisma.lulusan.count(),
      prisma.perusahaan.count(),
      prisma.lowongan.count({ where: { isActive: true } }),

      // Hanya ambil field status + koordinat (bukan full relations)
      prisma.tracerStudy.findMany({
        select: {
          id: true,
          status: true,
          latitude: true,
          longitude: true,
          lulusan: {
            select: {
              nama: true,
              tahunLulus: true,
              jurusan: { select: { nama: true } },
            },
          },
        },
      }),

      // Hitung per-jurusan menggunakan groupBy di DB (efisien)
      prisma.jurusan.findMany({
        select: {
          nama: true,
          lulusan: {
            select: {
              tracerStudy: { select: { status: true } },
            },
          },
        },
      }),
    ]);

  // Hitung status dari data yang sudah di-fetch
  const bekerja = tracerAgg.filter((t) => t.status === "BEKERJA").length;
  const kuliah = tracerAgg.filter((t) => t.status === "KULIAH").length;
  const wirausaha = tracerAgg.filter((t) => t.status === "WIRAUSAHA").length;
  const belumBekerja = tracerAgg.filter((t) => t.status === "BELUM_BEKERJA").length;

  const perJurusan = jurusanList.map((j) => ({
    jurusan: j.nama,
    total: j.lulusan.length,
    bekerja: j.lulusan.filter((l) => l.tracerStudy?.status === "BEKERJA").length,
    kuliah: j.lulusan.filter((l) => l.tracerStudy?.status === "KULIAH").length,
    wirausaha: j.lulusan.filter((l) => l.tracerStudy?.status === "WIRAUSAHA").length,
  }));

  const markers = tracerAgg
    .filter((t) => t.latitude && t.longitude)
    .map((t) => ({
      id: t.id,
      lat: t.latitude!,
      lng: t.longitude!,
      title: t.lulusan.nama,
      tahunLulus: t.lulusan.tahunLulus,
      jurusan: t.lulusan.jurusan?.nama || "-",
      status: t.status,
    }));

  const response = NextResponse.json({
    totalLulusan,
    totalPerusahaan,
    totalLowongan,
    totalTracerStudy: tracerAgg.length,
    bekerja,
    kuliah,
    wirausaha,
    belumBekerja,
    perJurusan,
    markers,
  });

  // Cache di browser/CDN selama 60 detik, stale-while-revalidate 120 detik
  response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  return response;
}
