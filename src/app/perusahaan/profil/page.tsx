import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProfilPerusahaanClient from "./ProfilPerusahaanClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function PerusahaanProfilPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "PERUSAHAAN") redirect("/login");

    return (
        <div className="flex min-h-screen">
            <Sidebar role="perusahaan" />
            <main className="flex-1 p-8">
                <Topbar title="Profil Perusahaan" profileHref="/perusahaan/profil" />
                <div className="max-w-3xl">
                    <Link
                        href="/perusahaan"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D704D] mb-5 transition"
                    >
                        <ChevronLeft size={16} /> Kembali ke Dashboard
                    </Link>
                    <ProfilPerusahaanClient />
                </div>
            </main>
        </div>
    );
}
