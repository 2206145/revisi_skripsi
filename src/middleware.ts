import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/admin", "/lulusan", "/perusahaan", "/kepala-sekolah", "/cv"];

const roleDashboard: Record<string, string> = {
    ADMIN: "/admin",
    LULUSAN: "/lulusan",
    PERUSAHAAN: "/perusahaan",
    KEPALA_SEKOLAH: "/kepala-sekolah",
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    const token =
        (await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        })) ||
        (await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: "next-auth.session-token",
        }));

    // ─── SUDAH LOGIN + AKSES "/" atau "/login" → redirect ke dashboard ─────────
    if (token && (pathname === "/" || pathname === "/login")) {
        const role = token.role as string;
        const dashboard = roleDashboard[role];
        if (dashboard) {
            return NextResponse.redirect(new URL(dashboard, request.url));
        }
    }

    // ─── BELUM LOGIN + AKSES PROTECTED → redirect ke "/login" ─────────────────
    if (!token) {
        const isProtected = protectedRoutes.some((route) =>
            pathname.startsWith(route)
        );
        if (isProtected) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)|api/).*)",
    ],
};
