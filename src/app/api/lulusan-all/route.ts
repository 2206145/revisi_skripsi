import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET all lulusan WITH their tracer study status (including those who haven't filled)
export async function GET() {
    const lulusan = await prisma.lulusan.findMany({
        include: {
            jurusan: true,
            tracerStudy: true,
            user: { select: { email: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(lulusan);
}
