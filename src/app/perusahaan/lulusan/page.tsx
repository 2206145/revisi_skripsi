import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LulusanPerusahaanClient from "./LulusanPerusahaanClient";

export default async function LulusanPerusahaanPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "PERUSAHAAN") redirect("/login");

    return (
        <div className="flex min-h-screen">
            <Sidebar role="perusahaan" />
            <main className="flex-1 p-8">
                <Topbar title="Pencarian Kandidat (Lulusan)" profileHref="/perusahaan/profil" />
                <LulusanPerusahaanClient />
            </main>
        </div>
    );
}
