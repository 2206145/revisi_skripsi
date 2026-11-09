-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'LULUSAN', 'PERUSAHAAN', 'KEPALA_SEKOLAH');

-- CreateEnum
CREATE TYPE "StatusLulusan" AS ENUM ('BEKERJA', 'KULIAH', 'WIRAUSAHA', 'BELUM_BEKERJA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jurusan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "Jurusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lulusan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jurusanId" TEXT NOT NULL,
    "tahunLulus" INTEGER NOT NULL,
    "noHp" TEXT,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lulusan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TracerStudy" (
    "id" TEXT NOT NULL,
    "lulusanId" TEXT NOT NULL,
    "status" "StatusLulusan" NOT NULL,
    "pernahMelamar" TEXT,
    "jenisPekerjaan" TEXT,
    "namaPerusahaan" TEXT,
    "alamatInstansi" TEXT,
    "jabatan" TEXT,
    "deskripsiPekerjaan" TEXT,
    "masaKerja" TEXT,
    "mulaiKerja" TEXT,
    "sesuaiKeahlian" TEXT,
    "masaTunggu" TEXT,
    "gaji" TEXT,
    "lokasiKerja" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "namaKampus" TEXT,
    "alamatUniversitas" TEXT,
    "jurusanStudi" TEXT,
    "bulanTahunStudi" TEXT,
    "namaUsaha" TEXT,
    "keterangan" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TracerStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Perusahaan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bidang" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "telepon" TEXT,
    "website" TEXT,
    "deskripsi" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Perusahaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lowongan" (
    "id" TEXT NOT NULL,
    "perusahaanId" TEXT NOT NULL,
    "jurusanId" TEXT,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "persyaratan" TEXT,
    "gaji" TEXT,
    "deadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lowongan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lamaran" (
    "id" TEXT NOT NULL,
    "lulusanId" TEXT NOT NULL,
    "lowonganId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lamaran_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Jurusan_nama_key" ON "Jurusan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Lulusan_userId_key" ON "Lulusan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lulusan_nis_key" ON "Lulusan"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "TracerStudy_lulusanId_key" ON "TracerStudy"("lulusanId");

-- CreateIndex
CREATE UNIQUE INDEX "Perusahaan_userId_key" ON "Perusahaan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Lamaran_lulusanId_lowonganId_key" ON "Lamaran"("lulusanId", "lowonganId");

-- AddForeignKey
ALTER TABLE "Lulusan" ADD CONSTRAINT "Lulusan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lulusan" ADD CONSTRAINT "Lulusan_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TracerStudy" ADD CONSTRAINT "TracerStudy_lulusanId_fkey" FOREIGN KEY ("lulusanId") REFERENCES "Lulusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Perusahaan" ADD CONSTRAINT "Perusahaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lowongan" ADD CONSTRAINT "Lowongan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId") REFERENCES "Perusahaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lowongan" ADD CONSTRAINT "Lowongan_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_lulusanId_fkey" FOREIGN KEY ("lulusanId") REFERENCES "Lulusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lamaran" ADD CONSTRAINT "Lamaran_lowonganId_fkey" FOREIGN KEY ("lowonganId") REFERENCES "Lowongan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
