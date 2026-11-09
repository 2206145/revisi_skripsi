import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.perusahaan.findMany({
    include: { lowongan: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nama, bidang, alamat, kota, telepon, website, deskripsi, latitude, longitude, email, password } = body;

  const user = await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      role: "PERUSAHAAN",
      perusahaan: {
        create: {
          nama, bidang, alamat, kota, telepon, website, deskripsi,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        },
      },
    },
    include: { perusahaan: true },
  });
  return NextResponse.json(user.perusahaan);
}
