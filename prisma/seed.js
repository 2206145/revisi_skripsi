const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding...");

  // ── Jurusan ────────────────────────────────────────────────────
  const jurusanData = [
    { kode: "TKJ", nama: "Teknik Komputer dan Jaringan" },
    { kode: "AK", nama: "Akuntansi" },
    { kode: "AP", nama: "Administrasi Perkantoran" },
    { kode: "PM", nama: "Pemasaran" },
  ];

  const jurusanList = [];
  for (const { kode, nama } of jurusanData) {
    const j = await prisma.jurusan.upsert({
      where: { kode },
      update: { nama },
      create: { kode, nama },
    });
    jurusanList.push(j);
    console.log(`  ✅ Jurusan: ${kode} - ${nama}`);
  }

  // ── Admin ──────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "admin@smkbinabhakti.sch.id" },
    update: {},
    create: {
      email: "admin@smkbinabhakti.sch.id",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });
  console.log("  ✅ Admin: admin@smkbinabhakti.sch.id / admin123");

  // ── Kepala Sekolah ─────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "kepsek@smkbinabhakti.sch.id" },
    update: {},
    create: {
      email: "kepsek@smkbinabhakti.sch.id",
      password: await bcrypt.hash("kepsek123", 10),
      role: "KEPALA_SEKOLAH",
    },
  });
  console.log("  ✅ Kepala Sekolah: kepsek@smkbinabhakti.sch.id / kepsek123");

  // ── Perusahaan ─────────────────────────────────────────────────
  const userPerusahaan = await prisma.user.upsert({
    where: { email: "pt.maju@example.com" },
    update: {},
    create: {
      email: "pt.maju@example.com",
      password: await bcrypt.hash("perusahaan123", 10),
      role: "PERUSAHAAN",
    },
  });
  const perusahaan = await prisma.perusahaan.upsert({
    where: { userId: userPerusahaan.id },
    update: {},
    create: {
      userId: userPerusahaan.id,
      nama: "PT Maju Bersama",
      bidang: "Teknologi Informasi",
      alamat: "Jl. Raya Cikarang No. 10",
      kota: "Bekasi",
      telepon: "021-12345678",
      latitude: -6.3,
      longitude: 107.1,
    },
  });
  console.log("  ✅ Perusahaan: pt.maju@example.com / perusahaan123");

  // ── Lowongan Kerja ─────────────────────────────────────────────
  const lowonganCount = await prisma.lowongan.count({ where: { perusahaanId: perusahaan.id } });
  if (lowonganCount === 0) {
    await prisma.lowongan.create({
      data: {
        perusahaanId: perusahaan.id,
        jurusanId: jurusanList[0].id,
        judul: "Teknisi Jaringan",
        deskripsi: "Dibutuhkan teknisi jaringan berpengalaman untuk mengelola infrastruktur IT perusahaan.",
        persyaratan: "Lulusan TKJ, mampu konfigurasi router dan switch, pengalaman min 1 tahun",
        gaji: "Rp 3.000.000 - Rp 4.000.000",
        deadline: new Date("2026-12-31"),
      },
    });
    console.log("  ✅ Lowongan: Teknisi Jaringan (PT Maju Bersama)");
  }

  // ── Lulusan ────────────────────────────────────────────────────
  const userLulusan = await prisma.user.upsert({
    where: { email: "budi.santoso@lulusan.com" },
    update: {},
    create: {
      email: "budi.santoso@lulusan.com",
      password: await bcrypt.hash("lulusan123", 10),
      role: "LULUSAN",
    },
  });
  const existingLulusan = await prisma.lulusan.findFirst({
    where: {
      OR: [
        { userId: userLulusan.id },
        { nis: "1234567890" },
      ],
    },
  });

  if (existingLulusan) {
    await prisma.lulusan.update({
      where: { id: existingLulusan.id },
      data: {
        userId: userLulusan.id,
        nis: "1234567890",
        nama: "Budi Santoso",
        jurusanId: jurusanList[0].id,
        tahunLulus: 2024,
        noHp: "081234567890",
        alamat: "Jl. Mekarmukti No. 5, Cikarang Utara",
      },
    });
  } else {
    await prisma.lulusan.create({
      data: {
        userId: userLulusan.id,
        nis: "1234567890",
        nama: "Budi Santoso",
        jurusanId: jurusanList[0].id,
        tahunLulus: 2024,
        noHp: "081234567890",
        alamat: "Jl. Mekarmukti No. 5, Cikarang Utara",
      },
    });
  }
  console.log("  ✅ Lulusan: budi.santoso@lulusan.com / lulusan123");

  console.log("\n🎉 Seeding selesai!\n");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║              AKUN DEMO TERSEDIA                       ║");
  console.log("╠═══════════════════╦════════════════════════╦══════════╣");
  console.log("║ Role              ║ Email                  ║ Password ║");
  console.log("╠═══════════════════╬════════════════════════╬══════════╣");
  console.log("║ Admin             ║ admin@smk...           ║ admin123 ║");
  console.log("║ Kepala Sekolah    ║ kepsek@smk...          ║ kepsek123 ║");
  console.log("║ Perusahaan (DUDI) ║ pt.maju@example.com    ║ perusahaan123 ║");
  console.log("║ Lulusan           ║ budi.santoso@...       ║ lulusan123 ║");
  console.log("╚═══════════════════╩════════════════════════╩══════════╝");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
