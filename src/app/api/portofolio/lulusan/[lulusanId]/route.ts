import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/portofolio/lulusan/[lulusanId]
// Digunakan oleh Admin untuk melihat portofolio milik lulusan tertentu
export async function GET(_: Request, { params }: { params: { lulusanId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.portofolio.findMany({
        where: { lulusanId: params.lulusanId },
        orderBy: [{ tahun: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(data);
}
