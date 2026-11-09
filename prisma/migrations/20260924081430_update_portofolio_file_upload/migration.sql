/*
  Warnings:

  - You are about to drop the column `link` on the `Portofolio` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Portofolio" DROP COLUMN "link",
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "namaFile" TEXT,
ADD COLUMN     "tipeFile" TEXT;
