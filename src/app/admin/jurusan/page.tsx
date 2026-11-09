import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import JurusanClient from "@/app/admin/jurusan/JurusanClient";

export default async function AdminJurusanPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <Topbar title="Kelola Jurusan" profileHref="/admin/profil" />
        <JurusanClient />
      </main>
    </div>
  );
}
