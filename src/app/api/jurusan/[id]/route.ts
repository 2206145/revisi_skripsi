import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { kode, nama } = await req.json();

    // Cek apakah kode sudah digunakan oleh jurusan LAIN
    const existingKode = await prisma.jurusan.findFirst({
      where: { kode, NOT: { id: params.id } },
    });
    if (existingKode) {
      return NextResponse.json({ error: `Kode jurusan "${kode}" sudah digunakan.` }, { status: 400 });
    }

    // Cek apakah nama sudah digunakan oleh jurusan LAIN
    const existingNama = await prisma.jurusan.findFirst({
      where: { nama, NOT: { id: params.id } },
    });
    if (existingNama) {
      return NextResponse.json({ error: `Nama jurusan "${nama}" sudah digunakan.` }, { status: 400 });
    }

    const data = await prisma.jurusan.update({
      where: { id: params.id },
      data: { kode, nama },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Gagal memperbarui jurusan." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    // Cek apakah masih ada lulusan di jurusan ini
    const jumlahLulusan = await prisma.lulusan.count({
      where: { jurusanId: params.id },
    });

    if (jumlahLulusan > 0) {
      return NextResponse.json(
        { error: `Jurusan tidak dapat dihapus karena masih terdapat ${jumlahLulusan} lulusan yang terdaftar di jurusan ini.` },
        { status: 400 }
      );
    }

    await prisma.jurusan.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "Gagal menghapus jurusan." },
      { status: 500 }
    );
  }
}
