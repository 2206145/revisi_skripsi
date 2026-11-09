import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTracerStudyReminderEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const { lulusanIds } = await req.json();

  // Ambil data lulusan + user (untuk email) yang dipilih
  const lulusanList = await prisma.lulusan.findMany({
    where: { id: { in: lulusanIds } },
    include: {
      tracerStudy: true,
      user: { select: { email: true } },
    },
  });

  // Filter yang belum mengisi tracer study
  const belumIsi = lulusanList.filter((l) => !l.tracerStudy);

  if (belumIsi.length === 0) {
    return NextResponse.json(
      { error: "Semua lulusan yang dipilih sudah mengisi tracer study" },
      { status: 400 }
    );
  }

  // Kirim email satu per satu, kumpulkan hasil
  const results: { nama: string; email: string; status: "berhasil" | "gagal"; error?: string }[] = [];

  await Promise.allSettled(
    belumIsi.map(async (l) => {
      const email = l.user?.email;
      if (!email) {
        results.push({ nama: l.nama, email: "-", status: "gagal", error: "Email tidak ditemukan" });
        return;
      }
      try {
        await sendTracerStudyReminderEmail(email, l.nama);
        results.push({ nama: l.nama, email, status: "berhasil" });
      } catch (err: any) {
        results.push({ nama: l.nama, email, status: "gagal", error: err?.message || "Gagal kirim email" });
      }
    })
  );

  const berhasil = results.filter((r) => r.status === "berhasil").length;
  const gagal = results.filter((r) => r.status === "gagal").length;

  return NextResponse.json({ results, berhasil, gagal });
}
