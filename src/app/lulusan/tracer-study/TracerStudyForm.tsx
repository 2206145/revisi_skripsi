"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  status: "",
  // Pekerjaan
  pernahMelamar: "", jenisPekerjaan: "",
  namaPerusahaan: "", alamatInstansi: "", jabatan: "",
  deskripsiPekerjaan: "", masaKerja: "", mulaiKerja: "",
  sesuaiKeahlian: "", masaTunggu: "", gaji: "",
  lokasiKerja: "", latitude: "", longitude: "",
  // Kuliah
  namaKampus: "", alamatUniversitas: "", jurusanStudi: "", bulanTahunStudi: "",
  // Wirausaha
  namaUsaha: "", bidangUsaha: "", omsetUsaha: "", linkUsaha: "",
  // Belum Bekerja
  terakhirBekerja: "", belumPernahBekerja: "", kegiatanSaatIni: "",
  alasanBelumBekerja: "", aktifMencariKerja: "", saluranPencarianKerja: "", upayaPeningkatan: "",
  // Sertifikat
  pemilikSertifikat: "", jenisSertifikat: "",
  keterangan: "",
};

const JENIS_SERTIFIKAT_OPTIONS = [
  { value: "SMK", label: "Sertifikat kecakapan yang dikeluarkan oleh SMK" },
  { value: "PEMERINTAH", label: "Sertifikat kecakapan yang dikeluarkan oleh lembaga pemerintahan (misal: Dinas P&K, Kemendiknas, dll)" },
  { value: "LEMBAGA_KURSUS", label: "Sertifikat kecakapan yang dikeluarkan oleh lembaga kursus dan tidak terakreditasi (misal: lembaga non-pemerintahan / swasta)" },
];

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";
const sectionTitle = "text-sm font-bold text-gray-800 mb-3";
const fieldLabel = "block text-sm font-medium text-gray-600 mb-1";

function formatMonthYear(val?: string) {
  if (!val) return "";
  if (val === "Sampai Sekarang") return val;
  const parts = val.split("-");
  if (parts.length !== 2) return val;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  if (monthNum >= 1 && monthNum <= 12) return `${months[monthNum - 1]} ${year}`;
  return val;
}

export default function TracerStudyForm({
  adminLulusanId,
  adminInitialData,
  adminIdentity,
  onSuccess,
  onCancel
}: {
  adminLulusanId?: string;
  adminInitialData?: any;
  adminIdentity?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
} = {}) {
  const [form, setForm] = useState(emptyForm);
  const [existing, setExisting] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirm, setConfirm] = useState<"save" | "cancel" | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  // Identity state for admin edit
  const [identity, setIdentity] = useState({
    nama: "", jenisKelamin: "", alamat: "", noHp: "", email: "", jurusanId: "", tahunLulus: ""
  });
  const [jurusanList, setJurusanList] = useState<any[]>([]);

  async function loadData() {
    if (adminLulusanId) {
      if (adminInitialData) {
        setExisting(adminInitialData);
        setForm({ ...emptyForm, ...(adminInitialData || {}) });
      }
      if (adminIdentity) {
        setIdentity({
          nama: adminIdentity.nama || "",
          jenisKelamin: adminIdentity.jenisKelamin || "",
          alamat: adminIdentity.alamat || "",
          noHp: adminIdentity.noHp || "",
          email: adminIdentity.user?.email || "",
          jurusanId: adminIdentity.jurusanId || "",
          tahunLulus: adminIdentity.tahunLulus || "",
        });
      }
      setIsEdit(true); // Always edit mode in admin
      fetch("/api/jurusan").then((r) => r.json()).then(setJurusanList);
      return;
    }
    const data = await fetch("/api/tracer-study/me").then((r) => r.json()).catch(() => ({}));
    if (data && data.status) {
      setExisting(data);
      setForm({ ...emptyForm, ...data });
    }
    setIsFetching(false);
  }

  useEffect(() => { loadData(); }, [adminLulusanId, adminInitialData]);

  function set(key: string, val: string) { setForm((f) => ({ ...f, [key]: val })); }
  function setId(key: string, val: string) { setIdentity((i) => ({ ...i, [key]: val })); }

  function getLocation() {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { set("latitude", String(pos.coords.latitude)); set("longitude", String(pos.coords.longitude)); setLocating(false); toast.success("Lokasi didapatkan"); },
      () => { setLocating(false); toast.error("Gagal mendapatkan lokasi"); }
    );
  }

  async function doSave() {
    setConfirm(null); setLoading(true);
    const payload = adminLulusanId ? { ...form, ...identity, updateIdentity: true, lulusanId: adminLulusanId } : form;
    const res = await fetch("/api/tracer-study", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (res.ok) {
      const result = await res.json().catch(() => ({}));
      if (result?.identityOnly) {
        toast.success("Data identitas lulusan diperbarui");
      } else {
        toast.success(existing || adminInitialData ? "Tracer study diperbarui" : "Tracer study disimpan");
      }
      setIsEdit(false);
      if (onSuccess) onSuccess();
      else loadData();
    }
    else {
      const err = await res.json().catch(() => ({}));
      toast.error(err?.error || `Gagal menyimpan (${res.status})`);
      console.error("TracerStudy save error:", err);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Status wajib hanya jika: bukan admin (lulusan mengisi sendiri),
    // ATAU admin mode tapi sudah ada data tracer study sebelumnya
    const statusRequired = !adminLulusanId || !!adminInitialData;
    if (statusRequired && !form.status) {
      toast.error("Pilih Status Setelah Lulus terlebih dahulu");
      return;
    }
    setConfirm("save");
  }

  const statusLabel: Record<string, string> = { BEKERJA: "Bekerja", KULIAH: "Melanjutkan Kuliah", WIRAUSAHA: "Wirausaha", BELUM_BEKERJA: "Belum Bekerja" };
  const statusColor: Record<string, string> = { BEKERJA: "bg-blue-100 text-blue-700", KULIAH: "bg-green-100 text-green-700", WIRAUSAHA: "bg-yellow-100 text-yellow-700", BELUM_BEKERJA: "bg-red-100 text-red-700" };

  if (isFetching && !adminLulusanId) {
    return (
      <div className="w-full bg-white rounded-xl shadow p-6 animate-pulse">
        <div className="h-6 w-1/4 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
          <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // View mode
  if (existing && !isEdit && !adminLulusanId) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-semibold text-gray-700">Data Tracer Study Anda</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[existing.status]}`}>{statusLabel[existing.status]}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {existing.status === "BEKERJA" && (<>
              <div><p className="text-gray-400 text-xs">Nama Instansi</p><p className="font-medium">{existing.namaPerusahaan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Alamat Instansi</p><p className="font-medium">{existing.alamatInstansi || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jabatan</p><p className="font-medium">{existing.jabatan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jenis Pekerjaan</p><p className="font-medium">{existing.jenisPekerjaan || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Masa Kerja (Berakhir)</p><p className="font-medium">{existing.masaKerja ? formatMonthYear(existing.masaKerja) : "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Mulai Kerja</p><p className="font-medium">{existing.mulaiKerja ? formatMonthYear(existing.mulaiKerja) : "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Sesuai Keahlian</p><p className="font-medium">{existing.sesuaiKeahlian || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Masa Tunggu</p><p className="font-medium">{existing.masaTunggu || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Besar Gaji</p><p className="font-medium">{existing.gaji || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Lokasi Kerja</p><p className="font-medium">{existing.lokasiKerja || "-"}</p></div>
            </>)}
            {existing.status === "KULIAH" && (<>
              <div><p className="text-gray-400 text-xs">Nama Universitas</p><p className="font-medium">{existing.namaKampus || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Alamat Universitas</p><p className="font-medium">{existing.alamatUniversitas || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Jurusan/Program Studi</p><p className="font-medium">{existing.jurusanStudi || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Bulan & Tahun Awal Studi</p><p className="font-medium">{existing.bulanTahunStudi ? formatMonthYear(existing.bulanTahunStudi) : "-"}</p></div>
            </>)}
            {existing.status === "WIRAUSAHA" && (<>
              <div><p className="text-gray-400 text-xs">Nama Usaha</p><p className="font-medium">{existing.namaUsaha || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Bidang Usaha</p><p className="font-medium">{existing.bidangUsaha || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Omset Pendapatan</p><p className="font-medium">{existing.omsetUsaha || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Link Media Sosial / E-commerce</p><p className="font-medium break-all">{existing.linkUsaha ? <a href={existing.linkUsaha} target="_blank" rel="noopener noreferrer" className="text-green-700 underline">{existing.linkUsaha}</a> : "-"}</p></div>
            </>)}
            {existing.status === "BELUM_BEKERJA" && (<>
              <div><p className="text-gray-400 text-xs">Terakhir Bekerja</p><p className="font-medium">{existing.belumPernahBekerja === "Ya" ? "Belum pernah bekerja sama sekali" : (existing.terakhirBekerja ? formatMonthYear(existing.terakhirBekerja) : "-")}</p></div>
              <div><p className="text-gray-400 text-xs">Alasan Belum Bekerja</p><p className="font-medium">{existing.alasanBelumBekerja || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Keaktifan Mencari Kerja</p><p className="font-medium">{existing.aktifMencariKerja || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Saluran Pencarian Kerja</p><p className="font-medium">{existing.saluranPencarianKerja || "-"}</p></div>
              <div><p className="text-gray-400 text-xs">Upaya Peningkatan Diri</p><p className="font-medium">{existing.upayaPeningkatan || "-"}</p></div>
              <div className="col-span-2"><p className="text-gray-400 text-xs">Kegiatan / Keterangan</p><p className="font-medium">{existing.kegiatanSaatIni || "-"}</p></div>
            </>)}
            {existing.keterangan && <div className="col-span-2"><p className="text-gray-400 text-xs">Keterangan</p><p className="font-medium">{existing.keterangan}</p></div>}
            {/* Sertifikat */}
            <div className="col-span-2 border-t pt-3 mt-1">
              <p className="text-gray-400 text-xs mb-1">Memiliki Sertifikat Lain (Selain Ijasah)</p>
              <p className="font-medium">{existing.pemilikSertifikat || "-"}</p>
            </div>
            {existing.pemilikSertifikat === "Ya" && existing.jenisSertifikat && (
              <div className="col-span-2">
                <p className="text-gray-400 text-xs mb-1">Jenis Sertifikat</p>
                <ul className="list-disc list-inside space-y-1">
                  {(() => {
                    try {
                      const arr: string[] = JSON.parse(existing.jenisSertifikat);
                      return arr.map((v) => {
                        const opt = JENIS_SERTIFIKAT_OPTIONS.find((o) => o.value === v);
                        return <li key={v} className="text-sm font-medium">{opt ? opt.label : v}</li>;
                      });
                    } catch { return null; }
                  })()}
                </ul>
              </div>
            )}
            <div className="col-span-2 text-xs text-gray-400 pt-2 border-t">Terakhir diperbarui: {new Date(existing.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
          <button onClick={() => setIsEdit(true)} className="mt-5 w-full bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 font-medium text-sm">✏️ Perbarui Tracer Study</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow p-6 space-y-7">

          {/* 0. Identitas Lulusan (Admin Mode) */}
          {adminLulusanId && (
            <div>
              <p className={sectionTitle}>Identitas Pribadi Lulusan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Nama Lengkap</label>
                  <input value={identity.nama} onChange={(e) => setId("nama", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Jenis Kelamin</label>
                  <select value={identity.jenisKelamin} onChange={(e) => setId("jenisKelamin", e.target.value)} className={inp}>
                    <option value="">-- Pilih --</option>
                    <option value="LAKI_LAKI">Laki-Laki</option>
                    <option value="PEREMPUAN">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>No HP / WhatsApp</label>
                  <input value={identity.noHp} onChange={(e) => setId("noHp", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Email</label>
                  <input type="email" value={identity.email} onChange={(e) => setId("email", e.target.value)} className={inp} />
                </div>
                <div className="md:col-span-2">
                  <label className={fieldLabel}>Alamat Lengkap</label>
                  <input value={identity.alamat} onChange={(e) => setId("alamat", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Jurusan</label>
                  <select value={identity.jurusanId} onChange={(e) => setId("jurusanId", e.target.value)} className={inp}>
                    <option value="">-- Pilih Jurusan --</option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>{j.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={fieldLabel}>Tahun Lulus</label>
                  <input type="number" value={identity.tahunLulus} onChange={(e) => setId("tahunLulus", e.target.value)} className={inp} />
                </div>
              </div>
            </div>
          )}

          {/* 1. Status */}
          <div>
            <p className={sectionTitle}>Status Setelah Lulus <span className="text-red-500">*</span></p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { value: "BEKERJA", label: "Bekerja" },
                { value: "KULIAH", label: "Melanjutkan Kuliah" },
                { value: "WIRAUSAHA", label: "Wirausaha" },
                { value: "BELUM_BEKERJA", label: "Belum Bekerja" },
              ].map((o) => (
                <div
                  key={o.value}
                  onClick={() => set("status", form.status === o.value ? "" : o.value)}
                  className={`flex items-center gap-2 border rounded-lg px-4 py-2.5 cursor-pointer text-sm transition select-none ${form.status === o.value
                    ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                    : "border-gray-200 hover:border-green-400"
                    }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={o.value}
                    checked={form.status === o.value}
                    onChange={() => { }}
                    className="accent-green-600 pointer-events-none"
                  />
                  {o.label}
                </div>
              ))}
            </div>
          </div>

          {/* 2. Data Pekerjaan */}
          {form.status === "BEKERJA" && (
            <div className="space-y-5">
              <p className={sectionTitle}>Data Pekerjaan</p>

              {/* a. Pernah melamar */}
              <div>
                <label className={fieldLabel}>a. Pernah melamar pekerjaan</label>
                <div className="flex gap-6">
                  {[{ v: "ya", l: "Ya, pernah" }, { v: "belum", l: "Belum pernah" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="pernahMelamar" value={v} checked={form.pernahMelamar === v} onChange={() => set("pernahMelamar", v)} className="accent-green-600" /> {l}
                    </label>
                  ))}
                </div>
              </div>

              {/* b. Jenis Pekerjaan */}
              <div>
                <label className={fieldLabel}>b. Jenis Pekerjaan</label>
                <div className="flex gap-6">
                  {["PNS", "Swasta", "Wiraswasta"].map((j) => (
                    <label key={j} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="jenisPekerjaan" value={j} checked={form.jenisPekerjaan === j} onChange={() => set("jenisPekerjaan", j)} className="accent-green-600" /> {j}
                    </label>
                  ))}
                </div>
              </div>

              {/* Fields pekerjaan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Nama Instansi", key: "namaPerusahaan" },
                  { label: "Alamat Instansi", key: "alamatInstansi" },
                  { label: "Jabatan", key: "jabatan" },
                  { label: "Deskripsi Pekerjaan", key: "deskripsiPekerjaan" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={fieldLabel}>{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} className={inp} />
                  </div>
                ))}

                {/* Mulai Kerja (Bulan & Tahun) */}
                <div>
                  <label className={fieldLabel}>Mulai Kerja <span className="text-xs text-gray-400 font-normal ml-1">(Bulan & Tahun)</span></label>
                  <input type="month" value={form.mulaiKerja} onChange={(e) => set("mulaiKerja", e.target.value)} className={inp} />
                </div>

                {/* Masa Kerja (Akhir Kerja / Sampai Sekarang) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-600">Selesai Kerja / Berakhir</label>
                    <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-green-600"
                        checked={form.masaKerja === "Sampai Sekarang"}
                        onChange={(e) => set("masaKerja", e.target.checked ? "Sampai Sekarang" : "")}
                      />
                      Sampai Sekarang
                    </label>
                  </div>
                  <input
                    type="month"
                    value={form.masaKerja === "Sampai Sekarang" ? "" : form.masaKerja}
                    onChange={(e) => set("masaKerja", e.target.value)}
                    disabled={form.masaKerja === "Sampai Sekarang"}
                    className={`${inp} ${form.masaKerja === "Sampai Sekarang" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  />
                </div>
              </div>

              {/* c. Sesuai Keahlian */}
              <div>
                <label className={fieldLabel}>c. Sesuai Keahlian</label>
                <div className="flex gap-6">
                  {["Sesuai", "Tidak"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="sesuaiKeahlian" value={v} checked={form.sesuaiKeahlian === v} onChange={() => set("sesuaiKeahlian", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* d. Masa Tunggu */}
              <div>
                <label className={fieldLabel}>d. Masa Tunggu</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Kurang dari 6 bulan", "Antara 6-12 bulan", "Lebih dari 12 bulan"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="masaTunggu" value={v} checked={form.masaTunggu === v} onChange={() => set("masaTunggu", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* e. Besar Gaji */}
              <div>
                <label className={fieldLabel}>e. Besar Gaji</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {["Kurang dari 500.000", "Antara 500.000 – 1.000.000", "Antara 1.000.000 – 1.500.000", "Antara 1.500.000 – 2.000.000", "Diatas 2.000.000"].map((v) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="gaji" value={v} checked={form.gaji === v} onChange={() => set("gaji", v)} className="accent-green-600" /> {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* Lokasi & Koordinat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Lokasi Kerja (Kota/Kabupaten)</label>
                  <input value={form.lokasiKerja} onChange={(e) => set("lokasiKerja", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Koordinat Lokasi</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Latitude" className={inp} />
                      <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Longitude" className={inp} />
                    </div>
                    <button type="button" onClick={getLocation} disabled={locating}
                      className="flex items-center gap-1.5 text-xs text-green-700 border border-green-500 rounded-lg px-3 py-1.5 hover:bg-green-50 disabled:opacity-50 w-fit font-medium transition">
                      <span>{locating ? "⏳" : "📍"}</span>
                      {locating ? "Mendapatkan lokasi..." : "Gunakan lokasi saat ini"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Data Kuliah */}
          {form.status === "KULIAH" && (
            <div className="space-y-4">
              <p className={sectionTitle}>Data Bagi Lulusan yang Melanjutkan Studi</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "a. Nama Universitas", key: "namaKampus" },
                  { label: "b. Alamat Universitas", key: "alamatUniversitas" },
                  { label: "c. Jurusan / Program Studi", key: "jurusanStudi" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className={fieldLabel}>{label}</label>
                    <input value={(form as any)[key]} onChange={(e) => set(key, e.target.value)} className={inp} />
                  </div>
                ))}
                <div>
                  <label className={fieldLabel}>d. Bulan dan Tahun Awal Studi <span className="text-xs text-gray-400 font-normal ml-1">(Bulan & Tahun)</span></label>
                  <input type="month" value={form.bulanTahunStudi} onChange={(e) => set("bulanTahunStudi", e.target.value)} className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <label className={fieldLabel}>Lokasi (Kota/Kabupaten)</label>
                  <input value={form.lokasiKerja} onChange={(e) => set("lokasiKerja", e.target.value)} placeholder="Contoh: Bandung" className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Koordinat Kampus</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Latitude" className={inp} />
                      <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Longitude" className={inp} />
                    </div>
                    <button type="button" onClick={getLocation} disabled={locating}
                      className="flex items-center gap-1.5 text-xs text-green-700 border border-green-500 rounded-lg px-3 py-1.5 hover:bg-green-50 disabled:opacity-50 w-fit font-medium transition">
                      <span>{locating ? "⏳" : "📍"}</span>
                      {locating ? "Mendapatkan lokasi..." : "Gunakan lokasi saat ini"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Wirausaha */}
          {form.status === "WIRAUSAHA" && (
            <div className="space-y-4">
              <p className={sectionTitle}>Data Wirausaha</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={fieldLabel}>Nama Usaha</label>
                  <input value={form.namaUsaha} onChange={(e) => set("namaUsaha", e.target.value)} className={inp} />
                </div>
                <div>
                  <label className={fieldLabel}>Bidang Usaha</label>
                  <input value={form.bidangUsaha} onChange={(e) => set("bidangUsaha", e.target.value)} placeholder="Contoh: Kuliner, Agribisnis..." className={inp} />
                </div>
                <div className="md:col-span-2">
                  <label className={fieldLabel}>Lokasi Usaha (Kota / Area)</label>
                  <input value={form.lokasiKerja} onChange={(e) => set("lokasiKerja", e.target.value)} className={inp} />
                </div>
              </div>

              {/* Omset Pendapatan */}
              <div>
                <label className={fieldLabel}>Omset Pendapatan per Bulan</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {["< Rp 1 Juta", "Rp 1-3 Juta", "Rp 3-5 Juta", "> Rp 5 Juta"].map((v) => (
                    <label key={v} className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition select-none ${form.omsetUsaha === v
                      ? "border-green-600 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-200 hover:border-green-400"
                      }`}>
                      <input
                        type="radio"
                        name="omsetUsaha"
                        value={v}
                        checked={form.omsetUsaha === v}
                        onChange={() => set("omsetUsaha", v)}
                        className="accent-green-600 pointer-events-none"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* Link Media Sosial */}
              <div>
                <label className={fieldLabel}>Link Media Sosial / E-commerce Usaha <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
                <input
                  value={form.linkUsaha}
                  onChange={(e) => set("linkUsaha", e.target.value)}
                  placeholder="Contoh: https://instagram.com/namaUsaha atau https://tokopedia.com/..."
                  className={inp}
                />
              </div>

              {/* Koordinat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className={fieldLabel}>Koordinat Lokasi Usaha</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input value={form.latitude} onChange={(e) => set("latitude", e.target.value)} placeholder="Latitude" className={inp} />
                      <input value={form.longitude} onChange={(e) => set("longitude", e.target.value)} placeholder="Longitude" className={inp} />
                    </div>
                    <button type="button" onClick={getLocation} disabled={locating}
                      className="flex items-center gap-1.5 text-xs text-green-700 border border-green-500 rounded-lg px-3 py-1.5 hover:bg-green-50 disabled:opacity-50 w-fit font-medium transition">
                      <span>{locating ? "⏳" : "📍"}</span>
                      {locating ? "Mendapatkan lokasi..." : "Gunakan lokasi saat ini"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Belum Bekerja */}
          {form.status === "BELUM_BEKERJA" && (
            <div className="space-y-5">
              <p className={sectionTitle}>Data Belum Bekerja</p>

              {/* Terakhir Bekerja + Checkbox belum pernah */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={fieldLabel + " mb-0"}>Kapan terakhir bekerja? <span className="text-xs text-gray-400 font-normal ml-1">(Bulan & Tahun)</span></label>
                  <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="accent-green-600"
                      checked={form.belumPernahBekerja === "Ya"}
                      onChange={(e) => {
                        set("belumPernahBekerja", e.target.checked ? "Ya" : "");
                        if (e.target.checked) set("terakhirBekerja", "");
                      }}
                    />
                    Belum pernah bekerja sama sekali
                  </label>
                </div>
                <input
                  type="month"
                  value={form.terakhirBekerja}
                  onChange={(e) => set("terakhirBekerja", e.target.value)}
                  disabled={form.belumPernahBekerja === "Ya"}
                  className={`${inp} ${form.belumPernahBekerja === "Ya" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
                />
              </div>

              {/* Alasan Belum Bekerja */}
              <div>
                <label className={fieldLabel}>Alasan Belum Bekerja</label>
                <div className="space-y-2">
                  {[
                    "Sedang mencari pekerjaan / Menunggu panggilan.",
                    "Mengikuti kursus / Pelatihan tambahan.",
                    "Fokus mengurus keluarga / Menikah.",
                    "Masalah kesehatan.",
                    "Merasa belum memiliki keterampilan yang cukup.",
                    "Belum mulai mencari pekerjaan.",
                  ].map((v) => (
                    <label key={v} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="alasanBelumBekerja"
                        value={v}
                        checked={form.alasanBelumBekerja === v}
                        onChange={() => set("alasanBelumBekerja", v)}
                        className="accent-green-600 shrink-0"
                      />
                      <span className="leading-snug">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Seberapa Aktif Mencari Kerja */}
              <div>
                <label className={fieldLabel}>Seberapa Aktif Mencari Kerja?</label>
                <div className="space-y-2">
                  {[
                    "Sangat Aktif (Rutin melamar ke banyak tempat).",
                    "Cukup Aktif (Melamar sesekali).",
                    "Pasif (Hanya menunggu info/tawaran).",
                  ].map((v) => (
                    <label key={v} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="aktifMencariKerja"
                        value={v}
                        checked={form.aktifMencariKerja === v}
                        onChange={() => set("aktifMencariKerja", v)}
                        className="accent-green-600 shrink-0"
                      />
                      <span className="leading-snug">{v}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Saluran Pencarian Kerja */}
              <div>
                <label className={fieldLabel}>
                  Saluran Pencarian Kerja Utama
                  <span className="block text-xs text-gray-400 font-normal mt-0.5">Sumber utama yang Anda andalkan untuk mencari pekerjaan</span>
                </label>
                <select
                  value={form.saluranPencarianKerja}
                  onChange={(e) => set("saluranPencarianKerja", e.target.value)}
                  className={inp}
                >
                  <option value="">-- Pilih Saluran --</option>
                  <option>Hanya mengandalkan BKK (Bursa Kerja Khusus) Sekolah</option>
                  <option>Portal Lowongan Kerja Online (LinkedIn, Jobstreet, Glints, dll)</option>
                  <option>Media Sosial atau Grup WhatsApp</option>
                  <option>Referensi/Jejaring dari keluarga atau teman</option>
                  <option>Langsung mendatangi perusahaan/pabrik</option>
                </select>
              </div>

              {/* Upaya Peningkatan */}
              <div>
                <label className={fieldLabel}>
                  Upaya Peningkatan Diri Saat Ini
                  <span className="block text-xs text-gray-400 font-normal mt-0.5">Kegiatan yang sedang dilakukan untuk meningkatkan kompetensi</span>
                </label>
                <select
                  value={form.upayaPeningkatan}
                  onChange={(e) => set("upayaPeningkatan", e.target.value)}
                  className={inp}
                >
                  <option value="">-- Pilih Upaya --</option>
                  <option>Mengikuti pelatihan/kursus formal atau bootcamp</option>
                  <option>Belajar otodidak secara online (YouTube, dll)</option>
                  <option>Mencoba kerja lepas (freelance) atau magang tidak dibayar</option>
                  <option>Tidak ada kegiatan khusus (Hanya menunggu)</option>
                </select>
              </div>

              {/* Keterangan tambahan */}
              <div>
                <label className={fieldLabel}>Keterangan / Kegiatan Saat Ini <span className="text-xs text-gray-400 font-normal">(opsional)</span></label>
                <textarea
                  value={form.kegiatanSaatIni}
                  onChange={(e) => set("kegiatanSaatIni", e.target.value)}
                  placeholder="Ceritakan kondisi Anda saat ini secara singkat..."
                  rows={3}
                  className={inp}
                />
              </div>
            </div>
          )}

          {/* Sertifikat - muncul di semua status */}
          {form.status && (
            <div className="space-y-4">
              <p className={sectionTitle}>Sertifikat Lain (Selain Ijasah)</p>
              <div>
                <label className={fieldLabel}>Apakah Anda memiliki Sertifikat lain selain Ijasah?</label>
                <div className="flex gap-6">
                  {[
                    { v: "Ya", l: "Ya" },
                    { v: "Tidak", l: "Tidak (lewati pertanyaan di bawah)" },
                  ].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="pemilikSertifikat"
                        value={v}
                        checked={form.pemilikSertifikat === v}
                        onChange={() => set("pemilikSertifikat", v)}
                        className="accent-green-600"
                      />
                      {l}
                    </label>
                  ))}
                </div>
              </div>
              {form.pemilikSertifikat === "Ya" && (
                <div>
                  <label className={fieldLabel}>Apakah jenis SERTIFIKAT yang Anda terima? <span className="text-xs text-gray-400 font-normal">(Jawaban bisa lebih dari satu)</span></label>
                  <div className="space-y-2">
                    {JENIS_SERTIFIKAT_OPTIONS.map((opt) => {
                      let arr: string[] = [];
                      try { arr = JSON.parse(form.jenisSertifikat || "[]"); } catch { arr = []; }
                      const checked = arr.includes(opt.value);
                      return (
                        <label key={opt.value} className="flex items-start gap-2.5 text-sm cursor-pointer group">
                          <input
                            type="checkbox"
                            className="mt-0.5 accent-green-600 shrink-0"
                            checked={checked}
                            onChange={() => {
                              let current: string[] = [];
                              try { current = JSON.parse(form.jenisSertifikat || "[]"); } catch { current = []; }
                              const next = checked
                                ? current.filter((x) => x !== opt.value)
                                : [...current, opt.value];
                              set("jenisSertifikat", JSON.stringify(next));
                            }}
                          />
                          <span className="leading-snug">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keterangan */}
          <div>
            <label className={fieldLabel}>Keterangan Tambahan</label>
            <textarea value={form.keterangan} onChange={(e) => set("keterangan", e.target.value)}
              rows={3} className={inp} />
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-green-700 text-white py-2.5 rounded-lg hover:bg-green-800 font-semibold disabled:opacity-60 text-sm">
              {loading ? "Menyimpan..." : existing ? "Perbarui Tracer Study" : "Simpan Tracer Study"}
            </button>
            <button type="button" onClick={() => setConfirm("cancel")}
              className="px-6 border border-gray-300 py-2.5 rounded-lg hover:bg-gray-50 text-sm text-gray-600">
              Batal
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog open={confirm === "save"} title={existing ? "Konfirmasi Perbarui" : "Konfirmasi Simpan"}
        message={existing ? "Apakah Anda yakin ingin memperbarui data tracer study?" : "Apakah Anda yakin ingin menyimpan data tracer study ini?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm === "cancel"} title="Batalkan Perubahan?"
        message="Data yang sudah diisi akan hilang."
        onConfirm={() => {
          setConfirm(null);
          if (!existing) {
            // Pengisian pertama: reset form ke kosong
            setForm(emptyForm);
          }
          setIsEdit(false);
          if (onCancel) onCancel();
        }}
        onCancel={() => setConfirm(null)} />
    </div>
  );
}
