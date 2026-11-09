-- AlterTable
ALTER TABLE "Lulusan" ADD COLUMN     "tahunMasuk" INTEGER;

-- AlterTable
ALTER TABLE "Pengaturan" ADD COLUMN     "heroDesc" TEXT DEFAULT 'Platform digital resmi SMK Bina Bhakti Mekarmukti untuk tracer study lulusan, pengelolaan lowongan kerja, dan analitik karir lulusan.',
ADD COLUMN     "heroTitle" TEXT DEFAULT 'Sistem Informasi Tracer Study & Bursa Kerja',
ADD COLUMN     "logoUrl" TEXT DEFAULT '/logo_smk.png';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "alamat" TEXT,
ADD COLUMN     "nama" TEXT,
ADD COLUMN     "noHp" TEXT;

-- CreateTable
CREATE TABLE "Portofolio" (
    "id" TEXT NOT NULL,
    "lulusanId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "deskripsi" TEXT,
    "link" TEXT,
    "keahlian" TEXT,
    "tahun" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Portofolio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Portofolio" ADD CONSTRAINT "Portofolio_lulusanId_fkey" FOREIGN KEY ("lulusanId") REFERENCES "Lulusan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
