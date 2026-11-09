import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    let pengaturan = await prisma.pengaturan.findUnique({ where: { id: "1" } });
    if (!pengaturan) {
        pengaturan = await prisma.pengaturan.create({
            data: { id: "1" }
        });
    }
    return NextResponse.json(pengaturan);
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { alamat, email, whatsapp, telepon, logoUrl, heroTitle, heroDesc } = body;
    const data = await prisma.pengaturan.upsert({
        where: { id: "1" },
        update: { alamat, email, whatsapp, telepon, logoUrl, heroTitle, heroDesc },
        create: { id: "1", alamat, email, whatsapp, telepon, logoUrl, heroTitle, heroDesc },
    });

    return NextResponse.json(data);
}
