import { prisma } from "@/lib/prisma";
import CVPageClient from "./CVPageClient";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
    title: "Curriculum Vitae | SMK Bina Bhakti",
};

export default async function CVPage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/"); // Redirect ke landing page, bukan login
    }

    const lulusanId = params.id;

    const lulusan = await prisma.lulusan.findUnique({
        where: { id: lulusanId },
        include: {
            user: { select: { email: true } },
            jurusan: true,
            tracerStudy: true,
            portofolio: { orderBy: { tahun: "desc" } }
        }
    });

    if (!lulusan) {
        return notFound();
    }

    // Tentukan tombol "Kembali" berdasarkan role
    const role = (session.user as any).role;
    let backUrl = "/";
    if (role === "LULUSAN") {
        backUrl = "/lulusan/profil";
    } else if (role === "ADMIN") {
        backUrl = "/admin/users";
    } else if (role === "PERUSAHAAN") {
        backUrl = "/perusahaan/lulusan";
    } else if (role === "KEPALA_SEKOLAH") {
        backUrl = "/kepala-sekolah";
    }

    return <CVPageClient lulusan={lulusan} backUrl={backUrl} />;
}
