/**
 * generateCVPdf.ts
 * Generate CV lulusan langsung sebagai PDF menggunakan jsPDF v4+
 * Dipanggil client-side, tidak membuka halaman baru.
 */

export interface CVData {
    nama: string;
    email?: string | null;
    noHp?: string | null;
    alamat?: string | null;
    jenisKelamin?: string | null;
    tahunMasuk?: number | null;
    tahunLulus?: number | null;
    jurusan?: { nama: string } | null;
    tracerStudy?: {
        status: string;
        namaPerusahaan?: string | null;
        jabatan?: string | null;
        mulaiKerja?: string | null;
        masaKerja?: string | null;
        alamatInstansi?: string | null;
        deskripsiPekerjaan?: string | null;
        gaji?: string | number | null;
        sesuaiKeahlian?: string | null;
        namaKampus?: string | null;
        jurusanStudi?: string | null;
        alamatUniversitas?: string | null;
        bulanTahunStudi?: string | null;
        namaUsaha?: string | null;
        keterangan?: string | null;
    } | null;
    portofolio?: Array<{
        judul: string;
        kategori?: string | null;
        tahun?: string | number | null;
        deskripsi?: string | null;
        keahlian?: string | null;
    }>;
}

function statusText(status: string): string {
    switch (status) {
        case "BEKERJA": return "Bekerja";
        case "KULIAH": return "Melanjutkan Pendidikan (Kuliah)";
        case "WIRAUSAHA": return "Wirausaha";
        case "BELUM_BEKERJA": return "Belum / Tidak Bekerja";
        case "BELUM_ISI": return "Belum Mengisi Tracer Study";
        default: return status;
    }
}

// Warna dengan format hex yang didukung jsPDF
const C = {
    GREEN: "#0D704D" as string,
    LIGHT_GREEN: "#A7F3D0" as string,
    DARK: "#1F2937" as string,
    GRAY: "#6B7280" as string,
    LIGHT_GRAY: "#F3F4F6" as string,
    LINE: "#E5E7EB" as string,
    WHITE: "#FFFFFF" as string,
    GREEN_BG: "#E6F4EE" as string,
};

export async function generateCVPdf(
    data: CVData,
    onProgress?: (msg: string) => void
): Promise<void> {
    onProgress?.("Memuat library PDF...");

    // jsPDF v4 menggunakan named export
    const { jsPDF } = await import("jspdf");

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = 210;
    const pageH = 297;
    const ml = 14;   // margin kiri
    const mr = 14;   // margin kanan
    const cW = pageW - ml - mr; // lebar konten

    let y = 0;

    // ── Pastikan tidak overflow halaman ──────────────────────────────────────
    function newPageIfNeeded(needed = 12) {
        if (y + needed > pageH - 12) {
            pdf.addPage();
            y = 16;
        }
    }

    // ── Text dengan word wrap ─────────────────────────────────────────────────
    function wrappedText(
        text: string,
        x: number,
        startY: number,
        maxW: number,
        lineH: number,
        hexColor: string = C.DARK
    ): number {
        pdf.setTextColor(hexColor);
        const lines: string[] = pdf.splitTextToSize(text || "-", maxW);
        for (const line of lines) {
            newPageIfNeeded(lineH + 2);
            pdf.text(line, x, startY);
            startY += lineH;
        }
        return startY;
    }

    // ── Row label-value ───────────────────────────────────────────────────────
    function detailRow(label: string, value?: string | number | null) {
        if (value === null || value === undefined || value === "") return;
        newPageIfNeeded(7);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(C.GRAY);
        pdf.text(label, ml, y);

        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(C.DARK);
        const lines: string[] = pdf.splitTextToSize(String(value), cW - 46);
        pdf.text(lines[0] || "", ml + 46, y);
        if (lines.length > 1) {
            for (let i = 1; i < lines.length; i++) {
                y += 5;
                newPageIfNeeded(5);
                pdf.text(lines[i], ml + 46, y);
            }
        }
        y += 6;
    }

    // ── Section header ────────────────────────────────────────────────────────
    function sectionHeader(title: string) {
        newPageIfNeeded(14);
        // Garis bawah
        pdf.setDrawColor(C.LIGHT_GREEN);
        pdf.setLineWidth(0.6);
        pdf.line(ml, y + 2, pageW - mr, y + 2);
        // Teks
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10.5);
        pdf.setTextColor(C.GREEN);
        pdf.text(title.toUpperCase(), ml, y);
        y += 8;
    }

    onProgress?.("Membuat halaman CV...");

    // ════════════════════════════════════════
    //  HEADER (background hijau)
    // ════════════════════════════════════════
    pdf.setFillColor(C.GREEN);
    pdf.rect(0, 0, pageW, 54, "F");

    // Nama lulusan
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(22);
    pdf.setTextColor(C.WHITE);
    pdf.text(data.nama || "-", ml, 16);

    // Sub-judul
    const subTitle = `Lulusan ${data.jurusan?.nama || "SMK Bina Bhakti"}` +
        (data.tahunLulus ? ` · ${data.tahunLulus}` : "");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(C.LIGHT_GREEN);
    pdf.text(subTitle, ml, 23);

    // 3 kolom kontak
    const colW3 = cW / 3;
    const infoY = 31;
    const contactItems = [
        { label: "EMAIL", value: data.email || "-" },
        { label: "TELEPON / WHATSAPP", value: data.noHp || "-" },
        { label: "ALAMAT", value: data.alamat || "-" },
    ];
    contactItems.forEach((item, idx) => {
        const cx = ml + idx * colW3;

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(C.LIGHT_GREEN);
        pdf.text(item.label, cx, infoY);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(C.WHITE);
        const shortened = pdf.splitTextToSize(item.value, colW3 - 4);
        pdf.text(shortened[0] || "-", cx, infoY + 5);
    });

    y = 62;

    // ════════════════════════════════════════
    //  PROFIL
    // ════════════════════════════════════════
    sectionHeader("Profil");

    detailRow("Jenis Kelamin", data.jenisKelamin);
    detailRow("Tahun Masuk", data.tahunMasuk ?? (data.tahunLulus ? data.tahunLulus - 3 : null));
    detailRow("Tahun Lulus", data.tahunLulus);

    // Status badge (kotak hijau muda)
    newPageIfNeeded(10);
    const statusVal = data.tracerStudy
        ? statusText(data.tracerStudy.status)
        : "Belum mengisi tracer study";

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(C.GRAY);
    pdf.text("Status Saat Ini", ml, y);

    const badgeX = ml + 46;
    const badgeW = pdf.getStringUnitWidth(statusVal) * 8.5 / pdf.internal.scaleFactor + 8;
    pdf.setFillColor(C.GREEN_BG);
    pdf.roundedRect(badgeX, y - 4, badgeW, 6.5, 1.5, 1.5, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(C.GREEN);
    pdf.text(statusVal, badgeX + 3, y);
    y += 10;

    // ════════════════════════════════════════
    //  PENGALAMAN KERJA / KULIAH / WIRAUSAHA
    // ════════════════════════════════════════
    if (data.tracerStudy && data.tracerStudy.status !== "BELUM_BEKERJA" && data.tracerStudy.status !== "BELUM_ISI") {
        const ts = data.tracerStudy;
        const sTitle =
            ts.status === "BEKERJA" ? "Pengalaman Kerja" :
                ts.status === "KULIAH" ? "Pendidikan Lanjut" : "Wirausaha";

        y += 4;
        sectionHeader(sTitle);

        if (ts.status === "BEKERJA") {
            newPageIfNeeded(14);
            // Jabatan
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(C.DARK);
            pdf.text(ts.jabatan || "-", ml, y);
            y += 6;
            // Perusahaan
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(C.GREEN);
            pdf.text(ts.namaPerusahaan || "-", ml, y);
            y += 7;
            // Detail
            detailRow("Mulai Kerja", ts.mulaiKerja);
            detailRow("Masa Kerja", ts.masaKerja);
            detailRow("Lokasi Kerja", ts.alamatInstansi);
            if (ts.gaji) detailRow("Besar Gaji", String(ts.gaji));
            detailRow("Sesuai Keahlian", ts.sesuaiKeahlian);
            if (ts.deskripsiPekerjaan) {
                newPageIfNeeded(12);
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(8.5);
                y = wrappedText(ts.deskripsiPekerjaan, ml, y, cW, 5, C.GRAY);
                y += 2;
            }
        }

        if (ts.status === "KULIAH") {
            newPageIfNeeded(14);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(C.DARK);
            pdf.text(ts.jurusanStudi || "-", ml, y);
            y += 6;
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.setTextColor(C.GREEN);
            pdf.text(ts.namaKampus || "-", ml, y);
            y += 7;
            detailRow("Lokasi Kampus", ts.alamatUniversitas);
            detailRow("Mulai Studi", ts.bulanTahunStudi);
        }

        if (ts.status === "WIRAUSAHA") {
            newPageIfNeeded(14);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(11);
            pdf.setTextColor(C.DARK);
            pdf.text(ts.namaUsaha || "-", ml, y);
            y += 7;
            if (ts.keterangan) {
                y = wrappedText(ts.keterangan, ml, y, cW, 5, C.GRAY);
                y += 2;
            }
        }
    }

    // ════════════════════════════════════════
    //  PORTOFOLIO & PENGALAMAN
    // ════════════════════════════════════════
    if (data.portofolio && data.portofolio.length > 0) {
        y += 4;
        sectionHeader("Portofolio & Pengalaman");

        for (const item of data.portofolio) {
            newPageIfNeeded(20);

            // Bullets
            pdf.setFillColor(C.GREEN);
            pdf.circle(ml + 1.5, y - 1.5, 1.5, "F");

            // Judul
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.setTextColor(C.DARK);
            pdf.text(item.judul || "-", ml + 5, y);

            // Tahun di kanan
            if (item.tahun) {
                const tahunStr = String(item.tahun);
                const tw = (pdf.getStringUnitWidth(tahunStr) * 9) / pdf.internal.scaleFactor + 6;
                pdf.setFillColor(C.GREEN_BG);
                pdf.roundedRect(pageW - mr - tw, y - 4, tw, 6, 1.2, 1.2, "F");
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(8);
                pdf.setTextColor(C.GREEN);
                pdf.text(tahunStr, pageW - mr - tw + 3, y);
            }
            y += 5.5;

            // Kategori
            if (item.kategori) {
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(8.5);
                pdf.setTextColor(C.GREEN);
                pdf.text(item.kategori, ml + 5, y);
                y += 5;
            }

            // Deskripsi
            if (item.deskripsi) {
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(8.5);
                y = wrappedText(item.deskripsi, ml + 5, y, cW - 5, 5, C.GRAY);
                y += 2;
            }

            // Tag keahlian
            if (item.keahlian) {
                const tags = item.keahlian.split(",").map((k) => k.trim()).filter(Boolean);
                let tx = ml + 5;
                newPageIfNeeded(8);
                for (const tag of tags) {
                    const tw = (pdf.getStringUnitWidth(tag) * 7.5) / pdf.internal.scaleFactor + 8;
                    if (tx + tw > pageW - mr) {
                        tx = ml + 5;
                        y += 7;
                        newPageIfNeeded(8);
                    }
                    pdf.setFillColor(C.LIGHT_GRAY);
                    pdf.roundedRect(tx, y - 4, tw, 6, 1.2, 1.2, "F");
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(7.5);
                    pdf.setTextColor(C.GRAY);
                    pdf.text(tag, tx + 3, y);
                    tx += tw + 3;
                }
                y += 9;
            }

            // Garis pemisah
            pdf.setDrawColor(C.LINE);
            pdf.setLineWidth(0.3);
            pdf.line(ml + 5, y, pageW - mr, y);
            y += 6;
        }
    }

    // ════════════════════════════════════════
    //  FOOTER
    // ════════════════════════════════════════
    newPageIfNeeded(14);
    y += 6;
    pdf.setDrawColor(C.LINE);
    pdf.setLineWidth(0.3);
    pdf.line(ml, y, pageW - mr, y);
    y += 5;
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(7.5);
    pdf.setTextColor(C.GRAY);
    pdf.text(
        "CV ini digenerate otomatis oleh Sistem Informasi BKK SMK Bina Bhakti Mekarmukti",
        pageW / 2,
        y,
        { align: "center" }
    );

    // ────── TAMPILKAN DI TAB BARU ────────────────────────────────────────────
    onProgress?.("Membuka CV...");

    // Generate sebagai Blob, lalu buat Object URL dan buka di tab baru
    const blob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(blob);
    const newTab = window.open(blobUrl, "_blank");

    if (!newTab) {
        // Fallback: kalau popup diblokir browser, langsung unduh saja
        const filename = `CV_${(data.nama || "Lulusan").replace(/\s+/g, "_")}.pdf`;
        pdf.save(filename);
    }

    // Bersihkan object URL setelah beberapa detik
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
}
