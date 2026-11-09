import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { judul, deskripsi, persyaratan, gaji, deadline, isActive, perusahaanId, perusahaanRaw, jurusanId } = body;

  let resolvedPerusahaanId = perusahaanId;
  if (!resolvedPerusahaanId && perusahaanRaw) {
    const dummyUser = await prisma.user.create({
      data: { email: `dudi-${Date.now()}@example.com`, role: "PERUSAHAAN", password: "" }
    });
    const p = await prisma.perusahaan.create({
      data: { userId: dummyUser.id, nama: perusahaanRaw, bidang: "" }
    });
    resolvedPerusahaanId = p.id;
  }

  const deadlineDate = deadline ? new Date(deadline) : null;
  // Auto-deactivate if deadline passed
  const computedActive = deadlineDate ? deadlineDate > new Date() : (isActive ?? true);

  const data = await prisma.lowongan.update({
    where: { id: params.id },
    data: {
      judul, deskripsi, persyaratan, gaji,
      jurusanId: jurusanId || null,
      ...(resolvedPerusahaanId ? { perusahaanId: resolvedPerusahaanId } : {}),
      deadline: deadlineDate,
      isActive: computedActive,
    },
  });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.lowongan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
