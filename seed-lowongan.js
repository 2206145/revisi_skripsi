const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Ambil perusahaan pertama
    const perusahaan = await prisma.perusahaan.findFirst();
    if (!perusahaan) {
        console.log("❌ Perusahaan tidak ditemukan!");
        return;
    }

    // Ambil semua jurusan
    const jurusanAll = await prisma.jurusan.findMany();
    const jurusanMap = {};
    for (const j of jurusanAll) {
        jurusanMap[j.kode] = { id: j.id, nama: j.nama };
    }
    console.log("Jurusan tersedia:");
    for (const [kode, v] of Object.entries(jurusanMap)) {
        console.log(`  ${kode} → ${v.nama} (${v.id})`);
    }

    // Hapus lowongan lama
    await prisma.lowongan.deleteMany({});
    console.log("\n🗑️  Lowongan lama dihapus.\n");

    // Lowongan dirancang untuk lulusan Asisten Keperawatan (AK)
    // Urutan relevansi: Sangat Cocok → Cocok → Umum → Tidak Cocok (x2)

    const lowongans = [
        // ===== SKOR 3: SANGAT COCOK (jurusanId = AK/Asisten Keperawatan) =====
        {
            perusahaanId: perusahaan.id,
            jurusanId: jurusanMap["AK"]?.id || null,
            judul: "Asisten Perawat Klinik Kesehatan",
            deskripsi: "Dibutuhkan segera tenaga asisten perawat untuk klinik kesehatan primer. Bertugas membantu dokter umum dalam pemeriksaan pasien, pencatatan rekam medis, dan pemberian obat sesuai resep.",
            persyaratan: "- Lulusan SMK jurusan Asisten Keperawatan\n- Teliti, ramah, dan sabar\n- Memiliki passion di bidang kesehatan\n- Bersedia kerja shift",
            gaji: "Rp 3.500.000 - Rp 4.000.000",
            deadline: new Date("2026-12-31"),
        },

        // ===== SKOR 2: COCOK (jurusanId null, tapi keyword "keperawatan/kesehatan/perawat" di deskripsi) =====
        {
            perusahaanId: perusahaan.id,
            jurusanId: null,
            judul: "Tenaga Kesehatan Puskesmas",
            deskripsi: "Membuka lowongan tenaga kesehatan untuk membantu pelayanan di Puskesmas. Tugas meliputi pendaftaran pasien, pengukuran tanda vital, dan asistensi keperawatan dasar. Diutamakan yang memiliki latar belakang kesehatan atau keperawatan.",
            persyaratan: "- Terbuka semua jurusan\n- Diutamakan berlatar belakang kesehatan/keperawatan\n- Komunikatif dan teliti\n- Mampu bekerja dalam tim medis",
            gaji: "Rp 3.000.000 - Rp 3.500.000",
            deadline: new Date("2026-11-30"),
        },

        // ===== SKOR 1: UMUM (jurusanId null, tanpa keyword terkait keperawatan) =====
        {
            perusahaanId: perusahaan.id,
            jurusanId: null,
            judul: "Staf Administrasi Umum",
            deskripsi: "Mengerjakan rekapitulasi data harian, pengarsipan surat masuk dan keluar, serta mengelola dokumen perusahaan. Posisi ini terbuka untuk semua jurusan SMK tanpa pengalaman khusus.",
            persyaratan: "- Terbuka semua jurusan SMK\n- Bisa mengoperasikan MS Word & Excel\n- Rapi, disiplin, dan bertanggung jawab\n- Siap bekerja full-time",
            gaji: "Rp 2.500.000 - Rp 3.000.000",
            deadline: new Date("2026-12-15"),
        },

        // ===== SKOR 0: TIDAK COCOK (jurusanId = AP/Akomodasi Perhotelan) =====
        {
            perusahaanId: perusahaan.id,
            jurusanId: jurusanMap["AP"]?.id || null,
            judul: "Resepsionis Hotel Bintang 4",
            deskripsi: "Mencari resepsionis profesional untuk hotel bintang 4. Bertugas melayani tamu check-in/check-out, reservasi kamar, dan memberikan informasi layanan hotel dengan standar hospitality tinggi.",
            persyaratan: "- Lulusan SMK jurusan Akomodasi Perhotelan\n- Berpenampilan menarik dan komunikatif\n- Mampu berbahasa Inggris dasar\n- Berpengalaman di bidang perhotelan menjadi nilai plus",
            gaji: "Rp 3.200.000 - Rp 3.800.000",
            deadline: new Date("2026-11-15"),
        },

        // ===== SKOR 0: TIDAK COCOK (jurusanId = AP/Akomodasi Perhotelan) =====
        {
            perusahaanId: perusahaan.id,
            jurusanId: jurusanMap["AP"]?.id || null,
            judul: "Chef Spesialis Masakan Nusantara",
            deskripsi: "Mencari koki kreatif untuk restoran hotel yang menyajikan hidangan tradisional Nusantara. Bertanggung jawab atas penyajian menu, manajemen dapur, dan standar kebersihan makanan.",
            persyaratan: "- Lulusan SMK Perhotelan / Tata Boga\n- Pengalaman minimal 1 tahun di dapur profesional\n- Kreatif dalam meracik menu\n- Memahami food safety",
            gaji: "Rp 4.000.000 - Rp 5.000.000",
            deadline: new Date("2026-12-20"),
        },
    ];

    for (const l of lowongans) {
        const created = await prisma.lowongan.create({ data: l });
        const jurusanLabel = l.jurusanId
            ? jurusanAll.find(j => j.id === l.jurusanId)?.kode || "?"
            : "Semua Jurusan";
        console.log(`  ✅ ${created.judul} → Target: ${jurusanLabel}`);
    }

    console.log("\n🎉 5 Lowongan berhasil dibuat!\n");
    console.log("📋 Urutan yang akan muncul untuk lulusan Asisten Keperawatan (AK):");
    console.log("  1. 🟢 Sangat Cocok → Asisten Perawat Klinik Kesehatan (AK exact match)");
    console.log("  2. 🔵 Cocok        → Tenaga Kesehatan Puskesmas (keyword 'keperawatan')");
    console.log("  3. ⚪ Umum         → Staf Administrasi Umum (semua jurusan, no keyword)");
    console.log("  4. 🔴 Tidak Cocok  → Resepsionis Hotel Bintang 4 (AP)");
    console.log("  5. 🔴 Tidak Cocok  → Chef Spesialis Masakan Nusantara (AP)");
}

main().catch(console.error).finally(() => prisma.$disconnect());
