import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProfilAdminKepsekClient from "@/components/ProfilAdminKepsekClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminProfilPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

    const user = session.user as any;
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        // @ts-ignore
        select: { nomorId: true },
    });

    return (
        <div className="flex min-h-screen">
            <Sidebar role="admin" />
            <main className="flex-1 p-8">
                <Topbar title="Profil Saya" profileHref="/admin/profil" />
                <div className="max-w-2xl">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D704D] mb-5 transition"
                    >
                        <ChevronLeft size={16} /> Kembali ke Dashboard
                    </Link>
                    <ProfilAdminKepsekClient
                        userId={user.id}
                        // @ts-ignore
                        nomorId={dbUser?.nomorId ?? null}
                        userEmail={user.email!}
                        userRole="ADMIN"
                    />
                </div>
            </main>
        </div>
    );
}
