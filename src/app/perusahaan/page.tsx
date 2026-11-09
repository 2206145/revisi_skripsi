import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PerusahaanDashboardClient from "./PerusahaanDashboardClient";

export default async function PerusahaanPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PERUSAHAAN") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="perusahaan" />
      <main className="flex-1 p-8">
        <Topbar title="Dashboard Perusahaan" profileHref="/perusahaan/profil" />
        <PerusahaanDashboardClient />
      </main>
    </div>
  );
}
