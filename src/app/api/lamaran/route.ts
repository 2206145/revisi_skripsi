import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "LULUSAN") {
    const lulusan = await prisma.lulusan.findUnique({ where: { userId } });
    if (!lulusan) return NextResponse.json([]);
    const data = await prisma.lamaran.findMany({
      where: { lulusanId: lulusan.id },
      include: { lowongan: { include: { perusahaan: true, jurusan: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  }

  if (role === "PERUSAHAAN") {
    const perusahaan = await prisma.perusahaan.findUnique({ where: { userId } });
    if (!perusahaan) return NextResponse.json([]);
    const data = await prisma.lamaran.findMany({
      where: { lowongan: { perusahaanId: perusahaan.id } },
      include: { lulusan: { include: { jurusan: true } }, lowongan: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(data);
  }

  const data = await prisma.lamaran.findMany({
    include: { lulusan: { include: { jurusan: true } }, lowongan: { include: { perusahaan: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lowonganId } = await req.json();
  const lulusan = await prisma.lulusan.findUnique({ where: { userId: (session.user as any).id } });
  if (!lulusan) return NextResponse.json({ error: "Lulusan tidak ditemukan" }, { status: 404 });

  const data = await prisma.lamaran.create({
    data: { lulusanId: lulusan.id, lowonganId },
  });
  return NextResponse.json(data);
}
