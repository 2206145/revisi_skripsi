import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import PengaturanClient from "./PengaturanClient";

export default async function AdminPengaturanPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />
            <main className="flex-1 p-8">
                <Topbar title="Pengaturan Sistem" profileHref="/admin/profil" />
                <PengaturanClient />
            </main>
        </div>
    );
}
