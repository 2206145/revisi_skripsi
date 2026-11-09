# Struktur Database (Kamus Data) Sistem Informasi Tracer Study & BKK
**SMK Bina Bhakti Mekarmukti**

Berikut adalah rincian struktur tabel yang digunakan pada sistem yang dibangun menggunakan PostgreSQL dan Prisma ORM.

---

### 1. Tabel `User`
Berfungsi untuk menyimpan data autentikasi seluruh pengguna (hak akses login).
* **Primary Key:** `id`

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik pengguna (CUID) | Primary Key |
| `email` | Varchar | Alamat email untuk login | Unique, Not Null |
| `password` | Varchar | Kata sandi (Terenkripsi bcrypt) | Not Null |
| `role` | Enum | Level akses (`ADMIN`, `LULUSAN`, `PERUSAHAAN`, `KEPALA_SEKOLAH`)| Not Null |
| `createdAt` | Timestamp | Waktu pembuatan akun pengguna | Default: Current Time |

---

### 2. Tabel `Jurusan`
Berfungsi menyimpan referensi master data program keahlian/jurusan di sekolah.
* **Primary Key:** `id`

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik jurusan (CUID) | Primary Key |
| `nomorId` | Integer | ID nomor urut (auto-increment) | Auto Increment |
| `kode` | Varchar | Singkatan jurusan (cth: RPL) | Unique, Not Null |
| `nama` | Varchar | Nama lengkap jurusan | Unique, Not Null |

---

### 3. Tabel `Lulusan`
Menyimpan biodata diri serta relasi alumni terhadap akun login dan jurusannya.
* **Primary Key:** `id`
* **Foreign Key:** `userId` (ke tabel `User`), `jurusanId` (ke tabel `Jurusan`)

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik lulusan (CUID) | Primary Key |
| `userId` | Varchar | Akun login relasi Lulusan | Unique, Foreign Key |
| `nis` | Varchar | Nomor Induk Siswa | Unique, Not Null |
| `nama` | Varchar | Nama lengkap lulusan | Not Null |
| `jurusanId`| Varchar | Relasi ke tabel Jurusan | Foreign Key, Not Null |
| `tahunLulus`| Integer | Angkatan kelulusan (cth: 2024) | Not Null |
| `noHp` | Varchar | Nomor telepon/WhatsApp | Nullable |
| `alamat` | Text | Alamat tempat tinggal kelulusan | Nullable |
| `createdAt` | Timestamp | Waktu data profil lulusan dibuat | Default: Current Time |

---

### 4. Tabel `TracerStudy`
Ekstensi pendataan dari lulusan, berfungsi menyimpan status keterserapan karir atau studi lanjutan dari alumni.
* **Primary Key:** `id`
* **Foreign Key:** `lulusanId` (ke tabel `Lulusan`)

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik data tracer study | Primary Key |
| `lulusanId`| Varchar | Pemilik data tracer study | Unique, Foreign Key |
| `status` | Enum | Status (`BEKERJA`, `KULIAH`, `WIRAUSAHA`, `BELUM_BEKERJA`) | Not Null |
| `namaPerusahaan` | Varchar | (Bekerja) Tempat instansi bekerja | Nullable |
| `jabatan` | Varchar | (Bekerja) Posisi lulusan bekerja | Nullable |
| `gaji` | Varchar | (Bekerja) Rentang gaji/pendapatan | Nullable |
| `lokasiKerja` | Varchar | (Bekerja) Kota/Daerah domisili kerja | Nullable |
| `latitude` | Float | KOORDINAT peta (Lintang) | Nullable |
| `longitude` | Float | KOORDINAT peta (Bujur) | Nullable |
| `namaKampus` | Varchar | (Kuliah) Universitas tempat studi | Nullable |
| `jurusanStudi` | Varchar | (Kuliah) Prodi studi lanjutan | Nullable |
| `namaUsaha` | Varchar | (Wirausaha) Nama bisnis rintisan | Nullable |
| `keterangan` | Text | Penjelasan ekstra dari status/usaha | Nullable |
| `updatedAt` | Timestamp | Waktu terakhir tracer diperbarui | Auto Update |
| `createdAt` | Timestamp | Waktu record pertama dibuat | Default: Current Time |
*(Catatan: beberapa kolom opsional disederhanakan pada tabel ini untuk keterbacaan)*

---

### 5. Tabel `Perusahaan`
Tabel master untuk entitas Dunia Usaha / Dunia Industri mitra BKK sekolah.
* **Primary Key:** `id`
* **Foreign Key:** `userId` (ke referensi login di tabel `User`)

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik perusahaan/mitra DUDI | Primary Key |
| `userId` | Varchar | Akun login untuk perusahaan | Unique, Foreign Key |
| `nama` | Varchar | Nama PT/CV Instansi terkait | Not Null |
| `bidang` | Varchar | Bidang industri (cth: Teknologi) | Nullable |
| `alamat` | Text | Alamat fisik kantor operasional | Nullable |
| `kota` | Varchar | Kota/Kabupaten letak perusahaan | Nullable |
| `telepon` | Varchar | Kontak resepsionis/HR | Nullable |
| `website` | Varchar | Situs profil instansi (URL) | Nullable |
| `deskripsi` | Text | Deskripsi profil instansi | Nullable |
| `latitude` | Float | Titik pemetaan (Lintang) | Nullable |
| `longitude`| Float | Titik pemetaan (Bujur) | Nullable |

---

### 6. Tabel `Lowongan`
Bursa pencarian kerja (Lowker) yang diterbitkan (diposting) oleh Perusahaan Mitra/Admin.
* **Primary Key:** `id`
* **Foreign Key:** `perusahaanId` (Penerbit Loker), `jurusanId` (opsional kriteria khusus)

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik lowongan pekerjaan | Primary Key |
| `perusahaanId`| Varchar| Relasi instansi yang menawarkan | Foreign Key, Not Null |
| `jurusanId` | Varchar | Filter jurusan yang diperbolehkan | Foreign Key, Nullable |
| `judul` | Varchar | Judul/Posisi (cth: Frontend Dev) | Not Null |
| `deskripsi` | Text | Detail tugas pekerjaan terkait | Not Null |
| `persyaratan` | Text | Kualifikasi (umur, skill, dll) | Nullable |
| `gaji` | Varchar | Rentang tunjangan/pendapatan | Nullable |
| `deadline` | Timestamp | Batas penutupan lamaran kerja | Nullable |
| `isActive` | Boolean | Apakah lowongan ini dibuka | Default: True |
| `createdAt` | Timestamp| Waktu lowongan diterbitkan | Default: Current Time |

---

### 7. Tabel `Lamaran`
Tabel perantara (Pivot / Transaksi) merekam jejak aplikasi pelamaran dari entitas *Lulusan* kepada entitas *Lowongan*.
* **Primary Key:** `id`
* **Foreign Key:** `lulusanId`, `lowonganId`

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik history transaksi lamaran | Primary Key |
| `lulusanId` | Varchar | Relasi ke kandidat yang melamar | Foreign Key, Not Null |
| `lowonganId` | Varchar | Relasi lamaran yang sedang dilamar| Foreign Key, Not Null |
| `status` | Varchar | Status (MENUNGGU, DITERIMA, DITOLAK)| Default: 'MENUNGGU' |
| `createdAt` | Timestamp | Waktu aksi melamar direkam | Default: Current Time |
*(Constraint: Lulusan tidak bisa mengirim dua entri di lowongan yang identik secara bersamaan)*

---

### 8. Tabel `Pengaturan`
Tabel metadata statis, hanya bisa menyimpan maksimal 1 record untuk dinamika footer landing page web BKK.
* **Primary Key:** `id` (Fix Constraint)

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | Identifier baris ('1') | Primary Key |
| `alamat` | Text | Text alamat admin BKK sekolah | Nullable |
| `email` | Varchar | Email resmi sekolahan/BKK | Nullable |
| `whatsapp` | Varchar | No WhatsApp pengurus resmi BKK | Nullable |
| `telepon` | Varchar | Nomor telepon BKK landline | Nullable |

---

### 9. Tabel `PasswordResetToken`
Kebutuhan utilitas temporer terkait mekanisme keamanan (Lupa Password).
* **Primary Key:** `id`

| Nama Field | Tipe Data | Keterangan | Aturan Tambahan |
| :--- | :--- | :--- | :--- |
| `id` | Varchar | ID unik entri token pemulihan | Primary Key |
| `email` | Varchar | Email sasaran pemulihan akun | Not Null |
| `token` | Varchar | Hash kode otentikasi unik di email | Unique, Not Null |
| `expiresAt` | Timestamp | Batas waktu validitas kadaluarsa | Not Null |
| `createdAt` | Timestamp | Waktu permintaan reset dikirim | Default: Current Time |
