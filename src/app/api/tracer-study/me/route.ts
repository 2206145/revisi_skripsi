import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lulusan = await prisma.lulusan.findUnique({ where: { userId: (session.user as any).id } });
  if (!lulusan) return NextResponse.json({});

  const data = await prisma.tracerStudy.findUnique({ where: { lulusanId: lulusan.id } });
  return NextResponse.json(data || {});
}
