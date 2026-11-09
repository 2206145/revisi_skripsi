import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import TracerStudyAdminClient from "./TracerStudyAdminClient";

export default async function AdminTracerStudyPage() {
  const session = await getServerSession(authOptions);
  const role = session ? (session.user as any).role : null;
  if (!role || role !== "ADMIN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="admin" />
      <main className="flex-1 p-8">
        <Topbar title="Data Tracer Study" profileHref="/admin/profil" />
        <TracerStudyAdminClient />
      </main>
    </div>
  );
}
