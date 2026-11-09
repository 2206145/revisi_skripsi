import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import KepsekPetaClient from "./KepsekPetaClient";

export default async function KepsekPetaPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "KEPALA_SEKOLAH") redirect("/login");

    return (
        <div className="flex min-h-screen">
            <Sidebar role="kepala-sekolah" />
            <main className="flex-1 p-8">
                <Topbar title="Peta Persebaran Lulusan" profileHref="/kepala-sekolah/profil" />
                <KepsekPetaClient />
            </main>
        </div>
    );
}
