import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LowonganAdminClient from "./LowonganAdminClient";

export default async function AdminLowonganPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!role || role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <Topbar title="Kelola Lowongan Kerja" profileHref="/admin/profil" />
        <LowonganAdminClient role={role} />
      </main>
    </div>
  );
}
