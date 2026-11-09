import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data = await prisma.tracerStudy.update({
    where: { id: params.id },
    data: {
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
      keterangan: body.keterangan || null,
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.tracerStudy.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
