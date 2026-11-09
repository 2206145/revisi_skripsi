import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { nis, nama, jurusanId, tahunLulus, noHp, alamat, email } = await req.json();
  const lulusan = await prisma.lulusan.update({
    where: { id: params.id },
    data: { nis, nama, jurusanId, tahunLulus: Number(tahunLulus), noHp, alamat },
  });
  if (email) {
    await prisma.user.update({ where: { id: lulusan.userId }, data: { email } });
  }
  return NextResponse.json(lulusan);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const lulusan = await prisma.lulusan.findUnique({ where: { id: params.id } });
  if (lulusan) await prisma.user.delete({ where: { id: lulusan.userId } });
  return NextResponse.json({ ok: true });
}
