import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Tipe file yang diizinkan
const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg",
];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "LULUSAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Validasi tipe file
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: "Tipe file tidak diizinkan. Harus PDF, JPG, atau PNG" },
            { status: 400 }
        );
    }

    // Validasi ukuran file
    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
            { error: `Ukuran file maksimal ${MAX_SIZE_MB}MB` },
            { status: 400 }
        );
    }

    // Buat nama file unik
    const ext = file.name.split(".").pop() || "pdf";
    const userId = (session.user as any).id as string;
    const timestamp = Date.now();
    const fileName = `${userId}-${timestamp}.${ext}`;

    // Pastikan direktori ada
    const uploadDir = path.join(process.cwd(), "public", "uploads", "portofolio");
    await mkdir(uploadDir, { recursive: true });

    // Tulis file ke disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return URL publik
    const publicUrl = `/uploads/portofolio/${fileName}`;
    return NextResponse.json({ url: publicUrl, name: file.name, type: file.type });
}
