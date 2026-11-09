import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { nama, bidang, alamat, kota, telepon, website, deskripsi, latitude, longitude } = body;
  const data = await prisma.perusahaan.update({
    where: { id: params.id },
    data: {
      nama, bidang, alamat, kota, telepon, website, deskripsi,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const p = await prisma.perusahaan.findUnique({ where: { id: params.id } });
  if (p) await prisma.user.delete({ where: { id: p.userId } });
  return NextResponse.json({ ok: true });
}
