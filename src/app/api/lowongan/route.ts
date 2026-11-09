import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all"); // admin/perusahaan can request all

  const now = new Date();

  // Auto-deactivate any lowongan whose deadline has passed
  await prisma.lowongan.updateMany({
    where: {
      isActive: true,
      deadline: { lt: now },
    },
    data: { isActive: false },
  });

  const where: any = all ? {} : { isActive: true };

  const data = await prisma.lowongan.findMany({
    where,
    include: { perusahaan: true, jurusan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { judul, deskripsi, persyaratan, gaji, deadline, perusahaanId, perusahaanRaw } = body;

  let resolvedPerusahaanId = perusahaanId;
  if (!resolvedPerusahaanId && perusahaanRaw) {
    const dummyUser = await prisma.user.create({
      data: { email: `dudi-${Date.now()}@example.com`, role: "PERUSAHAAN", password: "" }
    });
    const p = await prisma.perusahaan.create({
      data: { userId: dummyUser.id, nama: perusahaanRaw, bidang: "" }
    });
    resolvedPerusahaanId = p.id;
  } else if (!resolvedPerusahaanId) {
    const p = await prisma.perusahaan.findUnique({ where: { userId: (session.user as any).id } });
    if (!p) return NextResponse.json({ error: "Perusahaan tidak ditemukan" }, { status: 404 });
    resolvedPerusahaanId = p.id;
  }

  const deadlineDate = deadline ? new Date(deadline) : null;
  // Auto-deactivate if deadline is in the past
  const isActive = deadlineDate ? deadlineDate > new Date() : true;

  const jurusanId = body.jurusanId || null;

  const data = await prisma.lowongan.create({
    data: {
      perusahaanId: resolvedPerusahaanId,
      judul, deskripsi, persyaratan, gaji,
      jurusanId,
      deadline: deadlineDate,
      isActive,
    },
  });
  return NextResponse.json(data);
}
