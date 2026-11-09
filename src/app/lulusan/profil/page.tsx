import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import ProfileLulusanClient from "../ProfileLulusanClient";
import PortofolioClient from "../PortofolioClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";

export default async function LulusanProfilPage() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") redirect("/login");

    const lulusan = await prisma.lulusan.findUnique({
        where: { userId: (session.user as any).id },
        include: { jurusan: true },
    });

    if (!lulusan) redirect("/lulusan");

    const tahunMasuk = lulusan.tahunLulus ? lulusan.tahunLulus - 3 : null;

    return (
        <div className="flex min-h-screen">
            <Sidebar role="lulusan" />
            <main className="flex-1 p-8">
                <Topbar title="Profil Saya" profileHref="/lulusan/profil" />
                <div className="max-w-2xl">
                    <div className="flex justify-between items-center mb-5">
                        <Link
                            href="/lulusan"
                            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0D704D] transition"
                        >
                            <ChevronLeft size={16} /> Kembali ke Dashboard
                        </Link>
                        <CVDownloadButton lulusanId={lulusan.id} />
                    </div>

                    {/* Profil Lulusan - Info Umum (tidak dapat diedit) */}
                    <div className="bg-white rounded-xl shadow p-6 mb-6">
                        <h2 className="font-semibold text-gray-700 mb-4">Profil Lulusan</h2>
                        <div className="space-y-3 text-sm">
                            {([
                                ["Nama Lengkap", lulusan.nama],
                                ["Jenis Kelamin", (lulusan as any).jenisKelamin || "-"],
                                ["Alamat", lulusan.alamat || "-"],
                                ["Telepon", lulusan.noHp || "-"],
                                ["Email", session.user?.email || "-"],
                                ["Tahun Masuk", tahunMasuk ? String(tahunMasuk) : "-"],
                                ["Tahun Lulus", String(lulusan.tahunLulus)],
                            ] as [string, string][]).map(([label, value]) => (
                                <div key={label} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-500 w-36 shrink-0 pt-0.5">{label}</span>
                                    <span className="text-gray-800 font-medium flex-1 break-words">{value}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4">* Data profil hanya dapat diubah oleh Admin.</p>
                    </div>

                    {/* Form edit akun (email, no hp, alamat) */}
                    <div className="mb-6">
                        <ProfileLulusanClient lulusan={lulusan} userEmail={session.user?.email || ""} />
                    </div>

                    {/* Portofolio */}
                    <PortofolioClient />
                </div>
            </main>
        </div>
    );
}
