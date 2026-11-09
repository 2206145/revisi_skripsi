import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const lulusan = await prisma.lulusan.findMany({
    include: {
      jurusan: true,
      tracerStudy: true,
      user: { select: { email: true } }
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lulusan);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nis, nama, jurusanId, tahunLulus, noHp, alamat, email, password } = body;

  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      role: "LULUSAN",
      lulusan: {
        create: { nis, nama, jurusanId, tahunLulus: Number(tahunLulus), noHp, alamat },
      },
    },
    include: { lulusan: true },
  });

  return NextResponse.json(user.lulusan);
}
