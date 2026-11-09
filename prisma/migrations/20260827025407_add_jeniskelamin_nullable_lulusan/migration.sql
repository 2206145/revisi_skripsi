/*
  Warnings:

  - The values [SUPER_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[kode]` on the table `Jurusan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `kode` to the `Jurusan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'LULUSAN', 'PERUSAHAAN', 'KEPALA_SEKOLAH');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Lulusan" DROP CONSTRAINT "Lulusan_jurusanId_fkey";

-- AlterTable
ALTER TABLE "Jurusan" ADD COLUMN     "kode" TEXT NOT NULL,
ADD COLUMN     "nomorId" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Lulusan" ADD COLUMN     "jenisKelamin" TEXT,
ALTER COLUMN "nis" DROP NOT NULL,
ALTER COLUMN "jurusanId" DROP NOT NULL,
ALTER COLUMN "tahunLulus" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nomorId" SERIAL NOT NULL;

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" TEXT NOT NULL DEFAULT '1',
    "alamat" TEXT DEFAULT 'Jl. Contoh No. 1, Mekarmukti',
    "email" TEXT DEFAULT 'bkk@smkbinabhakti.sch.id',
    "whatsapp" TEXT DEFAULT '6281234567890',
    "telepon" TEXT DEFAULT '022-1234567',

    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Jurusan_kode_key" ON "Jurusan"("kode");

-- AddForeignKey
ALTER TABLE "Lulusan" ADD CONSTRAINT "Lulusan_jurusanId_fkey" FOREIGN KEY ("jurusanId") REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
