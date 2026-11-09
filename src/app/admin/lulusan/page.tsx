import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LulusanClient from "./LulusanClient";

export default async function AdminLulusanPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!role || role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <Topbar title="Data Lulusan" profileHref="/admin/profil" />
        <LulusanClient role={role} />
      </main>
    </div>
  );
}
