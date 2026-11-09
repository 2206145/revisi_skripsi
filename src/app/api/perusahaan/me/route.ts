import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Auto-deactivate any lowongan past their deadline
  await prisma.lowongan.updateMany({
    where: {
      isActive: true,
      deadline: { lt: new Date() },
    },
    data: { isActive: false },
  });

  const data = await prisma.perusahaan.findUnique({
    where: { userId: (session.user as any).id },
    include: { lowongan: { include: { lamaran: { include: { lulusan: { include: { jurusan: true } } } } }, orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(data || {});
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { nama, bidang, alamat, kota, telepon, website, deskripsi, latitude, longitude } = body;

  const data = await prisma.perusahaan.update({
    where: { userId: (session.user as any).id },
    data: {
      nama, bidang, alamat, kota, telepon, website, deskripsi,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    },
  });
  return NextResponse.json(data);
}
