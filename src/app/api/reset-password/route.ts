import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token dan password diperlukan" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
        }

        // Cari token yang valid
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken) {
            return NextResponse.json({ error: "Token tidak valid" }, { status: 400 });
        }

        if (new Date() > resetToken.expiresAt) {
            await prisma.passwordResetToken.delete({ where: { token } });
            return NextResponse.json({ error: "Token sudah kadaluarsa. Silakan minta ulang." }, { status: 400 });
        }

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({ where: { email: resetToken.email } });
        if (!user) {
            return NextResponse.json({ error: "User tidak ditemukan" }, { status: 400 });
        }

        // Hash password baru dan update
        const hashed = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashed },
        });

        // Hapus token setelah digunakan
        await prisma.passwordResetToken.delete({ where: { token } });

        return NextResponse.json({ message: "Password berhasil direset. Silakan login." });
    } catch (error) {
        console.error("Error reset-password:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
        return NextResponse.json({ valid: false, error: "Token tidak ada" }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken) {
        return NextResponse.json({ valid: false, error: "Token tidak valid" });
    }
    if (new Date() > resetToken.expiresAt) {
        return NextResponse.json({ valid: false, error: "Token sudah kadaluarsa" });
    }

    return NextResponse.json({ valid: true, email: resetToken.email });
}
