import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LowonganLulusanClient from "./LowonganLulusanClient";
import { prisma } from "@/lib/prisma";

export default async function LowonganLulusanPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "LULUSAN") redirect("/login");

  const lulusan = await prisma.lulusan.findUnique({
    where: { userId: (session.user as any).id },
    select: {
      jurusanId: true,
      jurusan: { select: { nama: true } },
    },
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar role="lulusan" />
      <main className="flex-1 p-8">
        <Topbar title="Lowongan Kerja" profileHref="/lulusan/profil" />
        <LowonganLulusanClient
          userJurusanId={lulusan?.jurusanId ?? undefined}
          userJurusanNama={lulusan?.jurusan?.nama ?? undefined}
        />
      </main>
    </div>
  );
}
