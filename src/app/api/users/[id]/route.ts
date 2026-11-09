import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { email, password, role, nama, noHp, alamat, jurusanId, tahunLulus, tahunMasuk, bidang, kota, website, deskripsi, latitude, longitude } = await req.json();
  const data: any = { email, role };
  if (password) data.password = await bcrypt.hash(password, 10);

  // Update logic to propagate to children models
  if (role === "LULUSAN") {
    data.lulusan = {
      update: {
        nama,
        noHp,
        alamat,
        jurusanId: jurusanId || null,
        tahunLulus: tahunLulus ? parseInt(tahunLulus) : null,
        tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
      }
    };
  } else if (role === "PERUSAHAAN") {
    data.perusahaan = {
      update: {
        nama, alamat, telepon: noHp, bidang, kota, website, deskripsi,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      }
    };
  } else {
    data.nama = nama;
    data.noHp = noHp;
    data.alamat = alamat;
  }

  const user = await prisma.user.update({ where: { id: params.id }, data });
  return NextResponse.json({ ...user, password: undefined });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
