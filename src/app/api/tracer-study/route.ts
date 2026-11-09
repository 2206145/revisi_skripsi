import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.tracerStudy.findMany({
    include: { lulusan: { include: { jurusan: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const user = session.user as any;
  let targetLulusanId: string;

  if (user.role === "ADMIN" || user.role === "KEPALA_SEKOLAH") {
    if (!body.lulusanId) return NextResponse.json({ error: "lulusanId harus ada" }, { status: 400 });
    targetLulusanId = body.lulusanId;
  } else {
    const lulusan = await prisma.lulusan.findUnique({
      where: { userId: user.id },
    });
    if (!lulusan) return NextResponse.json({ error: "Lulusan tidak ditemukan" }, { status: 404 });
    targetLulusanId = lulusan.id;
  }

  const cleaned = {
    status: body.status,
    pernahMelamar: body.pernahMelamar || null,
    jenisPekerjaan: body.jenisPekerjaan || null,
    namaPerusahaan: body.namaPerusahaan || null,
    alamatInstansi: body.alamatInstansi || null,
    jabatan: body.jabatan || null,
    deskripsiPekerjaan: body.deskripsiPekerjaan || null,
    masaKerja: body.masaKerja || null,
    mulaiKerja: body.mulaiKerja || null,
    sesuaiKeahlian: body.sesuaiKeahlian || null,
    masaTunggu: body.masaTunggu || null,
    gaji: body.gaji || null,
    lokasiKerja: body.lokasiKerja || null,
    latitude: body.latitude ? Number(body.latitude) : null,
    longitude: body.longitude ? Number(body.longitude) : null,
    namaKampus: body.namaKampus || null,
    alamatUniversitas: body.alamatUniversitas || null,
    jurusanStudi: body.jurusanStudi || null,
    bulanTahunStudi: body.bulanTahunStudi || null,
    namaUsaha: body.namaUsaha || null,
    bidangUsaha: body.bidangUsaha || null,
    omsetUsaha: body.omsetUsaha || null,
    linkUsaha: body.linkUsaha || null,
    terakhirBekerja: body.terakhirBekerja || null,
    belumPernahBekerja: body.belumPernahBekerja || null,
    kegiatanSaatIni: body.kegiatanSaatIni || null,
    alasanBelumBekerja: body.alasanBelumBekerja || null,
    aktifMencariKerja: body.aktifMencariKerja || null,
    saluranPencarianKerja: body.saluranPencarianKerja || null,
    upayaPeningkatan: body.upayaPeningkatan || null,
    keterangan: body.kegiatanSaatIni || body.keterangan || null,
    pemilikSertifikat: body.pemilikSertifikat || null,
    jenisSertifikat: body.jenisSertifikat || null,
  };

  try {
    const isAdmin = user.role === "ADMIN" || user.role === "KEPALA_SEKOLAH";

    if (isAdmin) {
      // Update identity data if sent
      if (body.updateIdentity) {
        await prisma.lulusan.update({
          where: { id: targetLulusanId },
          data: {
            nama: body.nama,
            jenisKelamin: body.jenisKelamin,
            alamat: body.alamat,
            noHp: body.noHp,
            jurusan: body.jurusanId ? { connect: { id: body.jurusanId } } : undefined,
            tahunLulus: body.tahunLulus ? Number(body.tahunLulus) : undefined,
            user: body.email ? { update: { email: body.email } } : undefined,
          }
        });
      }

      // Jika status kosong → admin hanya update identitas, skip upsert tracer study
      if (!body.status) {
        return NextResponse.json({ ok: true, identityOnly: true });
      }
    }

    const data = await prisma.tracerStudy.upsert({
      where: { lulusanId: targetLulusanId },
      update: cleaned,
      create: { lulusanId: targetLulusanId, ...cleaned },
    });
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("TracerStudy upsert error:", e);
    return NextResponse.json({ error: e?.message || "Database error" }, { status: 500 });
  }
}
