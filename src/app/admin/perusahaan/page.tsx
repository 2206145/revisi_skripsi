import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PerusahaanAdminClient from "./PerusahaanAdminClient";

export default async function AdminPerusahaanPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!role || role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <Topbar title="Data Perusahaan Mitra" profileHref="/admin/profil" />
        <PerusahaanAdminClient role={role} />
      </main>
    </div>
  );
}
