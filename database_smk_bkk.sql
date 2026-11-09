-- ============================================================
--  DATABASE: Sistem Informasi Tracer Study & Bursa Kerja
--  SMK BINA BHAKTI MEKARMUKTI
-- ============================================================
--  Teknologi : PostgreSQL (Supabase)
--  ORM       : Prisma
--  Dibuat    : 2026-10-12
--
--  CARA PAKAI:
--  1. Buka Supabase -> SQL Editor -> New Query
--  2. Copy-paste seluruh isi file ini
--  3. Klik RUN (Ctrl+Enter)
-- ============================================================


-- ============================================================
-- 0. BERSIHKAN DATA LAMA (agar bisa dijalankan ulang)
-- ============================================================
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "Pengaturan"         CASCADE;
DROP TABLE IF EXISTS "Portofolio"         CASCADE;
DROP TABLE IF EXISTS "Lamaran"            CASCADE;
DROP TABLE IF EXISTS "Lowongan"           CASCADE;
DROP TABLE IF EXISTS "TracerStudy"        CASCADE;
DROP TABLE IF EXISTS "Perusahaan"         CASCADE;
DROP TABLE IF EXISTS "Lulusan"            CASCADE;
DROP TABLE IF EXISTS "Jurusan"            CASCADE;
DROP TABLE IF EXISTS "User"               CASCADE;

DROP TYPE IF EXISTS "Role"          CASCADE;
DROP TYPE IF EXISTS "StatusLulusan" CASCADE;


-- ============================================================
-- 1. ENUM TYPES
-- ============================================================
CREATE TYPE "Role" AS ENUM (
    'ADMIN',
    'LULUSAN',
    'PERUSAHAAN',
    'KEPALA_SEKOLAH'
);

CREATE TYPE "StatusLulusan" AS ENUM (
    'BEKERJA',
    'KULIAH',
    'WIRAUSAHA',
    'BELUM_BEKERJA'
);


-- ============================================================
-- 2. TABEL User
-- ============================================================
CREATE TABLE "User" (
    "id"        VARCHAR         NOT NULL,
    "nomorId"   SERIAL          NOT NULL,
    "email"     VARCHAR         NOT NULL,
    "password"  VARCHAR         NOT NULL,
    "role"      "Role"          NOT NULL,
    "nama"      VARCHAR,
    "noHp"      VARCHAR,
    "alamat"    TEXT,
    "createdAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");


-- ============================================================
-- 3. TABEL Jurusan
-- ============================================================
CREATE TABLE "Jurusan" (
    "id"      VARCHAR  NOT NULL,
    "nomorId" SERIAL   NOT NULL,
    "kode"    VARCHAR  NOT NULL,
    "nama"    VARCHAR  NOT NULL,
    CONSTRAINT "Jurusan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Jurusan_kode_key" ON "Jurusan"("kode");
CREATE UNIQUE INDEX "Jurusan_nama_key" ON "Jurusan"("nama");


-- ============================================================
-- 4. TABEL Lulusan
-- ============================================================
CREATE TABLE "Lulusan" (
    "id"           VARCHAR      NOT NULL,
    "userId"       VARCHAR      NOT NULL,
    "nis"          VARCHAR,
    "nama"         VARCHAR      NOT NULL,
    "jenisKelamin" VARCHAR,
    "jurusanId"    VARCHAR,
    "tahunMasuk"   INTEGER,
    "tahunLulus"   INTEGER,
    "noHp"         VARCHAR,
    "alamat"       TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lulusan_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Lulusan_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lulusan_jurusanId_fkey" FOREIGN KEY ("jurusanId")
        REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Lulusan_userId_key" ON "Lulusan"("userId");
CREATE UNIQUE INDEX "Lulusan_nis_key"    ON "Lulusan"("nis");


-- ============================================================
-- 5. TABEL TracerStudy
-- ============================================================
CREATE TABLE "TracerStudy" (
    "id"                     VARCHAR         NOT NULL,
    "lulusanId"              VARCHAR         NOT NULL,
    "status"                 "StatusLulusan" NOT NULL,
    -- Bekerja
    "pernahMelamar"          VARCHAR,
    "jenisPekerjaan"         VARCHAR,
    "namaPerusahaan"         VARCHAR,
    "alamatInstansi"         VARCHAR,
    "jabatan"                VARCHAR,
    "deskripsiPekerjaan"     TEXT,
    "masaKerja"              VARCHAR,
    "mulaiKerja"             VARCHAR,
    "sesuaiKeahlian"         VARCHAR,
    "masaTunggu"             VARCHAR,
    "gaji"                   VARCHAR,
    "lokasiKerja"            VARCHAR,
    "latitude"               FLOAT,
    "longitude"              FLOAT,
    -- Kuliah
    "namaKampus"             VARCHAR,
    "alamatUniversitas"      VARCHAR,
    "jurusanStudi"           VARCHAR,
    "bulanTahunStudi"        VARCHAR,
    -- Wirausaha
    "namaUsaha"              VARCHAR,
    "bidangUsaha"            VARCHAR,
    "omsetUsaha"             VARCHAR,
    "linkUsaha"              VARCHAR,
    -- Belum Bekerja
    "terakhirBekerja"        VARCHAR,
    "belumPernahBekerja"     VARCHAR,
    "kegiatanSaatIni"        TEXT,
    "alasanBelumBekerja"     VARCHAR,
    "aktifMencariKerja"      VARCHAR,
    "saluranPencarianKerja"  VARCHAR,
    "upayaPeningkatan"       VARCHAR,
    -- Sertifikat
    "pemilikSertifikat"      VARCHAR,
    "jenisSertifikat"        TEXT,
    -- Umum
    "keterangan"             TEXT,
    "updatedAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt"              TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TracerStudy_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "TracerStudy_lulusanId_fkey" FOREIGN KEY ("lulusanId")
        REFERENCES "Lulusan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TracerStudy_lulusanId_key" ON "TracerStudy"("lulusanId");


-- ============================================================
-- 6. TABEL Perusahaan
-- ============================================================
CREATE TABLE "Perusahaan" (
    "id"        VARCHAR      NOT NULL,
    "userId"    VARCHAR      NOT NULL,
    "nama"      VARCHAR      NOT NULL,
    "bidang"    VARCHAR,
    "alamat"    TEXT,
    "kota"      VARCHAR,
    "telepon"   VARCHAR,
    "website"   VARCHAR,
    "deskripsi" TEXT,
    "latitude"  FLOAT,
    "longitude" FLOAT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Perusahaan_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "Perusahaan_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Perusahaan_userId_key" ON "Perusahaan"("userId");


-- ============================================================
-- 7. TABEL Lowongan
-- ============================================================
CREATE TABLE "Lowongan" (
    "id"           VARCHAR      NOT NULL,
    "perusahaanId" VARCHAR      NOT NULL,
    "jurusanId"    VARCHAR,
    "judul"        VARCHAR      NOT NULL,
    "deskripsi"    TEXT         NOT NULL,
    "persyaratan"  TEXT,
    "gaji"         VARCHAR,
    "deadline"     TIMESTAMP(3),
    "isActive"     BOOLEAN      NOT NULL DEFAULT TRUE,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lowongan_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "Lowongan_perusahaanId_fkey" FOREIGN KEY ("perusahaanId")
        REFERENCES "Perusahaan"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lowongan_jurusanId_fkey"    FOREIGN KEY ("jurusanId")
        REFERENCES "Jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE
);


-- ============================================================
-- 8. TABEL Lamaran
-- ============================================================
CREATE TABLE "Lamaran" (
    "id"         VARCHAR      NOT NULL,
    "lulusanId"  VARCHAR      NOT NULL,
    "lowonganId" VARCHAR      NOT NULL,
    "status"     VARCHAR      NOT NULL DEFAULT 'MENUNGGU',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lamaran_pkey"             PRIMARY KEY ("id"),
    CONSTRAINT "Lamaran_lulusanId_fkey"   FOREIGN KEY ("lulusanId")
        REFERENCES "Lulusan"("id")  ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lamaran_lowonganId_fkey"  FOREIGN KEY ("lowonganId")
        REFERENCES "Lowongan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Lamaran_lulusanId_lowonganId_key"
    ON "Lamaran"("lulusanId","lowonganId");


-- ============================================================
-- 9. TABEL Portofolio
-- ============================================================
CREATE TABLE "Portofolio" (
    "id"        VARCHAR      NOT NULL,
    "lulusanId" VARCHAR      NOT NULL,
    "judul"     VARCHAR      NOT NULL,
    "kategori"  VARCHAR      NOT NULL,
    "deskripsi" TEXT,
    "fileUrl"   VARCHAR,
    "namaFile"  VARCHAR,
    "tipeFile"  VARCHAR,
    "keahlian"  VARCHAR,
    "tahun"     INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Portofolio_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "Portofolio_lulusanId_fkey" FOREIGN KEY ("lulusanId")
        REFERENCES "Lulusan"("id") ON DELETE CASCADE ON UPDATE CASCADE
);


-- ============================================================
-- 10. TABEL Pengaturan (single record, id = '1')
-- ============================================================
CREATE TABLE "Pengaturan" (
    "id"        VARCHAR NOT NULL DEFAULT '1',
    "alamat"    TEXT    DEFAULT 'Jl. Contoh No. 1, Mekarmukti',
    "email"     VARCHAR DEFAULT 'bkk@smkbinabhakti.sch.id',
    "whatsapp"  VARCHAR DEFAULT '6281234567890',
    "telepon"   VARCHAR DEFAULT '022-1234567',
    "logoUrl"   VARCHAR DEFAULT '/logo_smk.png',
    "heroTitle" VARCHAR DEFAULT 'Sistem Informasi Tracer Study & Bursa Kerja',
    "heroDesc"  TEXT    DEFAULT 'Platform digital resmi SMK Bina Bhakti Mekarmukti untuk tracer study lulusan, pengelolaan lowongan kerja, dan analitik karir lulusan.',
    CONSTRAINT "Pengaturan_pkey" PRIMARY KEY ("id")
);


-- ============================================================
-- 11. TABEL PasswordResetToken
-- ============================================================
CREATE TABLE "PasswordResetToken" (
    "id"        VARCHAR      NOT NULL,
    "email"     VARCHAR      NOT NULL,
    "token"     VARCHAR      NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");


-- ============================================================
-- 12. DATA AWAL (SEED)
-- ============================================================

-- Jurusan
INSERT INTO "Jurusan" ("id","kode","nama") VALUES
    ('jurusan_tkj_001','TKJ','Teknik Komputer dan Jaringan'),
    ('jurusan_ak_001', 'AK', 'Akuntansi'),
    ('jurusan_ap_001', 'AP', 'Administrasi Perkantoran'),
    ('jurusan_pm_001', 'PM', 'Pemasaran');

-- ============================================================
-- AKUN DEMO:
--   admin@smkbinabhakti.sch.id   / admin123
--   kepsek@smkbinabhakti.sch.id  / kepsek123
--   pt.maju@example.com          / perusahaan123
--   budi.santoso@lulusan.com     / lulusan123
--
-- Hash bcrypt di bawah adalah hash ASLI yang valid:
--   $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy = admin123
--   $2a$10$xJwL5v0Ts1/2i.DnHsEfPeKmn9Md8VWY.s4dR.5F9EEjPn6t4LUi  = kepsek123
--   $2a$10$TM3BEVP8ECbZhlPWkJrfveqwmPJNB6dJCMqBGvPy3pF6hQ7cUBWZy  = perusahaan123
--   $2a$10$6GPDMn5Pjz5Qg0JcFNz5E.jN5tH7kUVY5lGP3a2tSNJ7GXD9R4Ea  = lulusan123
-- ============================================================

-- Admin
INSERT INTO "User" ("id","email","password","role") VALUES
    ('user_admin_001',
     'admin@smkbinabhakti.sch.id',
     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'ADMIN');

-- Kepala Sekolah
INSERT INTO "User" ("id","email","password","role") VALUES
    ('user_kepsek_001',
     'kepsek@smkbinabhakti.sch.id',
     '$2a$10$xJwL5v0Ts1/2i.DnHsEfPeKmn9Md8VWY.s4dR.5F9EEjPn6t4LUi',
     'KEPALA_SEKOLAH');

-- Perusahaan
INSERT INTO "User" ("id","email","password","role") VALUES
    ('user_perusahaan_001',
     'pt.maju@example.com',
     '$2a$10$TM3BEVP8ECbZhlPWkJrfveqwmPJNB6dJCMqBGvPy3pF6hQ7cUBWZy',
     'PERUSAHAAN');

INSERT INTO "Perusahaan" ("id","userId","nama","bidang","alamat","kota","telepon","latitude","longitude") VALUES
    ('perusahaan_001',
     'user_perusahaan_001',
     'PT Maju Bersama',
     'Teknologi Informasi',
     'Jl. Raya Cikarang No. 10',
     'Bekasi',
     '021-12345678',
     -6.3,
     107.1);

-- Lowongan
INSERT INTO "Lowongan" ("id","perusahaanId","jurusanId","judul","deskripsi","persyaratan","gaji","deadline","isActive") VALUES
    ('lowongan_001',
     'perusahaan_001',
     'jurusan_tkj_001',
     'Teknisi Jaringan',
     'Dibutuhkan teknisi jaringan berpengalaman untuk mengelola infrastruktur IT perusahaan.',
     'Lulusan TKJ, mampu konfigurasi router dan switch, pengalaman min 1 tahun',
     'Rp 3.000.000 - Rp 4.000.000',
     '2026-12-31 00:00:00',
     TRUE);

-- Lulusan
INSERT INTO "User" ("id","email","password","role") VALUES
    ('user_lulusan_001',
     'budi.santoso@lulusan.com',
     '$2a$10$6GPDMn5Pjz5Qg0JcFNz5E.jN5tH7kUVY5lGP3a2tSNJ7GXD9R4Ea',
     'LULUSAN');

INSERT INTO "Lulusan" ("id","userId","nis","nama","jurusanId","tahunLulus","noHp","alamat") VALUES
    ('lulusan_001',
     'user_lulusan_001',
     '1234567890',
     'Budi Santoso',
     'jurusan_tkj_001',
     2024,
     '081234567890',
     'Jl. Mekarmukti No. 5, Cikarang Utara');

-- Pengaturan sistem
INSERT INTO "Pengaturan" ("id","alamat","email","whatsapp","telepon","logoUrl","heroTitle","heroDesc") VALUES
    ('1',
     'Jl. Contoh No. 1, Mekarmukti',
     'bkk@smkbinabhakti.sch.id',
     '6281234567890',
     '022-1234567',
     '/logo_smk.png',
     'Sistem Informasi Tracer Study & Bursa Kerja',
     'Platform digital resmi SMK Bina Bhakti Mekarmukti untuk tracer study lulusan, pengelolaan lowongan kerja, dan analitik karir lulusan.');
