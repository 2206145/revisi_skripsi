import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jurusan = await prisma.jurusan.findMany({
      orderBy: { nomorId: "asc" },
      include: { _count: { select: { lulusan: true } } },
    });
    return NextResponse.json(jurusan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Gagal mengambil data jurusan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { kode, nama } = await req.json();

    // Cek duplikat kode
    const existingKode = await prisma.jurusan.findFirst({ where: { kode } });
    if (existingKode) {
      return NextResponse.json({ error: `Kode jurusan "${kode}" sudah digunakan.` }, { status: 400 });
    }

    // Cek duplikat nama
    const existingNama = await prisma.jurusan.findFirst({ where: { nama } });
    if (existingNama) {
      return NextResponse.json({ error: `Nama jurusan "${nama}" sudah digunakan.` }, { status: 400 });
    }

    const jurusan = await prisma.jurusan.create({ data: { kode, nama } });
    return NextResponse.json(jurusan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Gagal menambahkan jurusan." }, { status: 500 });
  }
}
