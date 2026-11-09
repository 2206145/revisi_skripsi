import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lulusan: { include: { jurusan: true, tracerStudy: true } },
      perusahaan: true,
    },
  });
  return NextResponse.json(users.map((u) => ({ ...u, password: undefined })));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, role, nama, jenisKelamin, noHp, alamat } = body;

  const dataPayload: any = {
    email,
    password: await bcrypt.hash(password, 10),
    role,
  };

  if (role === "LULUSAN") {
    dataPayload.lulusan = {
      create: {
        nama: nama || "",
        jenisKelamin: jenisKelamin || null,
        noHp: noHp || null,
        alamat: alamat || null,
        jurusanId: body.jurusanId || null,
        tahunLulus: body.tahunLulus ? parseInt(body.tahunLulus) : null,
        tahunMasuk: body.tahunMasuk ? parseInt(body.tahunMasuk) : null,
      },
    };
  } else if (role === "PERUSAHAAN") {
    dataPayload.perusahaan = {
      create: {
        nama: body.nama || "Mitra DUDI Baru",
        bidang: body.bidang || "",
        alamat: body.alamat || "",
        kota: body.kota || "",
        telepon: body.noHp || "",
        website: body.website || "",
        deskripsi: body.deskripsi || "",
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
      },
    };
  } else {
    // For ADMIN and KEPALA_SEKOLAH, store in User table
    dataPayload.nama = nama || "";
    dataPayload.noHp = noHp || null;
    dataPayload.alamat = alamat || null;
  }

  try {
    const user = await prisma.user.create({
      data: dataPayload,
      include: { lulusan: true, perusahaan: true },
    });
    return NextResponse.json({ ...user, password: undefined });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat akun" }, { status: 500 });
  }
}
