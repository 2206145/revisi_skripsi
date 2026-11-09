import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { status } = await req.json();
  const data = await prisma.lamaran.update({
    where: { id: params.id },
    data: { status },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.lamaran.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
