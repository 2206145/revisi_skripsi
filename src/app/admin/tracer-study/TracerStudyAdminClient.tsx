"use client";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Download, Trash2, X, Info, Pencil, RotateCcw, FolderOpen, Award, Trophy, Briefcase, FileText, Layers, Eye } from "lucide-react";
import TracerStudyForm from "@/app/lulusan/tracer-study/TracerStudyForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import toast from "react-hot-toast";
import CVDownloadButton from "@/components/CVDownloadButton";

const JENIS_SERTIFIKAT_OPTIONS: { value: string; label: string }[] = [
  { value: "SMK", label: "Sertifikat kecakapan yang dikeluarkan oleh SMK" },
  { value: "PEMERINTAH", label: "Sertifikat kecakapan yang dikeluarkan oleh lembaga pemerintahan (misal: Dinas P&K, Kemendiknas, dll)" },
  { value: "LEMBAGA_KURSUS", label: "Sertifikat kecakapan yang dikeluarkan oleh lembaga kursus dan tidak terakreditasi (misal: lembaga non-pemerintahan / swasta)" },
];

function parseSertifikat(jsonStr?: string | null): string {
  if (!jsonStr) return "-";
  try {
    const arr: string[] = JSON.parse(jsonStr);
    if (!arr.length) return "-";
    return arr.map((v) => {
      const opt = JENIS_SERTIFIKAT_OPTIONS.find((o) => o.value === v);
      return opt ? opt.label : v;
    }).join("; ");
  } catch {
    return jsonStr;
  }
}

// Status bisa dari TracerStudy atau "BELUM_ISI" jika lulusan belum mengisi
const statusLabel: Record<string, string> = {
  BEKERJA: "Bekerja",
  KULIAH: "Melanjutkan Studi",
  WIRAUSAHA: "Wirausaha",
  BELUM_BEKERJA: "Belum Bekerja",
  BELUM_ISI: "Belum Mengisi",
};
const statusColor: Record<string, string> = {
  BEKERJA: "bg-blue-100 text-blue-700",
  KULIAH: "bg-green-100 text-green-700",
  WIRAUSAHA: "bg-yellow-100 text-yellow-700",
  BELUM_BEKERJA: "bg-red-100 text-red-700",
  BELUM_ISI: "bg-gray-100 text-gray-500",
};

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 break-all w-full">{String(value)}</span>
    </div>
  );
}

function formatMonthYear(val?: string) {
  if (!val) return "";
  if (val === "Sampai Sekarang") return val;
  const parts = val.split("-");
  if (parts.length !== 2) return val;
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  if (monthNum >= 1 && monthNum <= 12) {
    return `${months[monthNum - 1]} ${year}`;
  }
  return val;
}

export default function TracerStudyAdminClient() {
  // list = array of Lulusan (with optional tracerStudy)
  const [list, setList] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [limit, setLimit] = useState<number | "ALL">(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ type: "bulkDelete" } | { type: "reset", item: any } | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [detailTab, setDetailTab] = useState<"tracer" | "portofolio">("tracer");
  const [portofolioList, setPortofolioList] = useState<any[]>([]);
  const [portofolioLoading, setPortofolioLoading] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const KATEGORI_STYLES: Record<string, { color: string; Icon: any }> = {
    "Proyek": { color: "bg-blue-100 text-blue-700", Icon: FolderOpen },
    "Sertifikat": { color: "bg-yellow-100 text-yellow-700", Icon: Award },
    "Prestasi": { color: "bg-orange-100 text-orange-700", Icon: Trophy },
    "Pengalaman": { color: "bg-purple-100 text-purple-700", Icon: Briefcase },
    "Karya Tulis": { color: "bg-teal-100 text-teal-700", Icon: FileText },
    "Lainnya": { color: "bg-gray-100 text-gray-700", Icon: Layers },
  };

  async function openDetail(item: any) {
    setDetailItem(item);
    setDetailTab("tracer");
    setPortofolioList([]);
    setPortofolioLoading(true);
    const res = await fetch(`/api/portofolio/lulusan/${item.id}`);
    const data = await res.json();
    setPortofolioList(Array.isArray(data) ? data : []);
    setPortofolioLoading(false);
  }

  async function load() {
    // Fetch all lulusan including those without tracer study
    const data = await fetch("/api/lulusan-all").then((r) => r.json());
    setList(Array.isArray(data) ? data : []);
    setSelected(new Set());
  }

  useEffect(() => { load(); }, []);

  // Helper: get effective status of a lulusan row
  function getStatus(item: any): string {
    return item.tracerStudy?.status ?? "BELUM_ISI";
  }

  const filtered = list.filter((t) => {
    const status = getStatus(t);
    const matchStatus = filter ? status === filter : true;
    const matchJurusan = filterJurusan ? t.jurusanId === filterJurusan : true;
    const matchTahun = filterTahun ? String(t.tahunLulus) === filterTahun : true;
    return matchStatus && matchJurusan && matchTahun;
  });

  const displayedList = limit === "ALL" ? filtered : filtered.slice(0, limit);

  const uniqueJurusan = Array.from(
    new Map(list.filter((t) => t.jurusan).map((t) => [t.jurusan.id, t.jurusan.nama])).entries()
  );
  const uniqueTahun = Array.from(
    new Set(list.filter((t) => t.tahunLulus).map((t) => String(t.tahunLulus)))
  ).sort((a, b) => Number(b) - Number(a));

  // Count per status
  const countAll = list.length;
  const countStatus = (s: string) => list.filter((t) => getStatus(t) === s).length;

  function toggleOne(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (filtered.every((t) => selected.has(t.id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }

  function downloadExcel() {
    const targets = selected.size > 0
      ? filtered.filter((t) => selected.has(t.id))
      : filtered;

    const rows = targets.map((item, i) => {
      const ts = item.tracerStudy;
      const tahunMasuk = item.tahunLulus ? item.tahunLulus - 3 : "";
      const status = getStatus(item);
      const isBekerja = status === "BEKERJA";
      const isKuliah = status === "KULIAH";
      const isWirausaha = status === "WIRAUSAHA";
      const isBelum = status === "BELUM_BEKERJA";

      return {
        // Data Pribadi
        "No": i + 1,
        "Nama Lengkap": item.nama || "",
        "Jenis Kelamin": item.jenisKelamin || "",
        "Alamat": item.alamat || "",
        "Telepon": item.noHp || "",
        // Data Akademik
        "NIS": item.nis || "",
        "Jurusan": item.jurusan?.nama || "",
        "Tahun Masuk": tahunMasuk,
        "Tahun Lulus": item.tahunLulus || "",
        "Email Akun": item.user?.email || "",
        // Status
        "Status Keterserapan": statusLabel[status] || status,
        // Pekerjaan (hanya BEKERJA)
        "Pernah Melamar Pekerjaan": isBekerja ? (ts?.pernahMelamar || "") : "",
        "Jenis Pekerjaan": isBekerja ? (ts?.jenisPekerjaan || "") : "",
        "Nama Instansi": isBekerja ? (ts?.namaPerusahaan || "") : "",
        "Alamat Instansi": isBekerja ? (ts?.alamatInstansi || "") : "",
        "Jabatan": isBekerja ? (ts?.jabatan || "") : "",
        "Deskripsi Pekerjaan": isBekerja ? (ts?.deskripsiPekerjaan || "") : "",
        "Mulai Kerja": isBekerja ? formatMonthYear(ts?.mulaiKerja) : "",
        "Berakhir (Masa Kerja)": isBekerja ? formatMonthYear(ts?.masaKerja) : "",
        "Sesuai Keahlian": isBekerja ? (ts?.sesuaiKeahlian || "") : "",
        "Masa Tunggu (Bulan)": isBekerja ? (ts?.masaTunggu || "") : "",
        "Besar Gaji": isBekerja ? (ts?.gaji ? `Rp ${Number(ts.gaji).toLocaleString("id-ID")}` : "") : "",
        "Lokasi Kerja": isBekerja ? (ts?.lokasiKerja || "") : "",
        // Kuliah
        "Nama Universitas": isKuliah ? (ts?.namaKampus || "") : "",
        "Alamat Universitas": isKuliah ? (ts?.alamatUniversitas || "") : "",
        "Jurusan / Program Studi": isKuliah ? (ts?.jurusanStudi || "") : "",
        "Bulan dan Tahun Awal Studi": isKuliah ? (ts?.bulanTahunStudi || "") : "",
        // Wirausaha
        "Nama Usaha": isWirausaha ? (ts?.namaUsaha || "") : "",
        "Bidang Usaha": isWirausaha ? (ts?.bidangUsaha || "") : "",
        "Omset Pendapatan": isWirausaha ? (ts?.omsetUsaha || "") : "",
        "Link Media Sosial / E-commerce": isWirausaha ? (ts?.linkUsaha || "") : "",
        // Belum Bekerja
        "Pernah Bekerja Sebelumnya": isBelum ? (ts?.belumPernahBekerja === "Ya" ? "Belum pernah bekerja" : "Pernah bekerja") : "",
        "Terakhir Bekerja": isBelum ? (ts?.belumPernahBekerja === "Ya" ? "-" : formatMonthYear(ts?.terakhirBekerja)) : "",
        "Alasan Belum Bekerja": isBelum ? (ts?.alasanBelumBekerja || "") : "",
        "Keaktifan Mencari Kerja": isBelum ? (ts?.aktifMencariKerja || "") : "",
        "Saluran Pencarian Kerja": isBelum ? (ts?.saluranPencarianKerja || "") : "",
        "Upaya Peningkatan Diri": isBelum ? (ts?.upayaPeningkatan || "") : "",
        "Kegiatan Saat Ini": isBelum ? (ts?.kegiatanSaatIni || "") : "",
        // Keterangan
        "Keterangan": (isWirausaha || isBelum) ? (ts?.keterangan || "") : "",
        // Sertifikat (semua status)
        "Memiliki Sertifikat (Selain Ijasah)": ts?.pemilikSertifikat || "",
        "Jenis Sertifikat": ts?.pemilikSertifikat === "Ya" ? parseSertifikat(ts?.jenisSertifikat) : "",
        // Meta
        "Tanggal Isi": ts?.createdAt
          ? new Date(ts.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : "Belum Mengisi",
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 5 }, { wch: 28 }, { wch: 14 }, { wch: 35 }, { wch: 16 },
      { wch: 16 }, { wch: 32 }, { wch: 14 }, { wch: 14 }, { wch: 28 }, { wch: 20 },
      { wch: 28 }, { wch: 22 }, { wch: 30 }, { wch: 35 },
      { wch: 22 }, { wch: 35 }, { wch: 18 }, { wch: 18 },
      { wch: 18 }, { wch: 20 }, { wch: 24 }, { wch: 22 },
      { wch: 30 }, { wch: 35 }, { wch: 28 }, { wch: 26 },
      { wch: 25 }, { wch: 30 }, { wch: 22 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tracer Study");
    const filterLabel2 = filter ? `_${statusLabel[filter].replace(/\s+/g, "_")}` : "";
    XLSX.writeFile(wb, `tracer_study_smk_bina_bhakti${filterLabel2}.xlsx`);
    toast.success(`${targets.length} data diunduh`);
  }

  const allChecked = filtered.length > 0 && filtered.every((t) => selected.has(t.id));
  const someChecked = filtered.some((t) => selected.has(t.id)) && !allChecked;

  return (
    <div>
      {/* ── Filter Area ── */}
      <div className="mb-4 bg-white rounded-xl shadow px-4 py-3">

        {/* Baris 2: Dropdown di kiri, Download di kanan — 1 baris sejajar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select value={filterJurusan} onChange={(e) => { setFilterJurusan(e.target.value); setSelected(new Set()); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">Semua Jurusan</option>
              {uniqueJurusan.map(([id, nama]) => <option key={id} value={id}>{nama}</option>)}
            </select>
            <select value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setSelected(new Set()); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="">Semua Tahun</option>
              {uniqueTahun.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={limit} onChange={(e) => { setLimit(e.target.value === "ALL" ? "ALL" : Number(e.target.value)); }}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
              <option value="10">1 - 10 Data</option>
              <option value="50">1 - 50 Data</option>
              <option value="100">1 - 100 Data</option>
              <option value="ALL">Tampilkan Semua</option>
            </select>
          </div>
          <button onClick={downloadExcel}
            className="flex items-center gap-2 bg-green-700 text-white px-4 py-1.5 rounded-lg hover:bg-green-800 text-sm font-medium whitespace-nowrap flex-shrink-0">
            <Download size={15} /> {selected.size > 0 ? `Download (${selected.size})` : "Download"}
          </button>
        </div>

      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="px-3 py-3 w-10">
                <input type="checkbox" checked={allChecked}
                  ref={(el) => { if (el) el.indeterminate = someChecked; }}
                  onChange={toggleAll} className="w-4 h-4 accent-green-700 cursor-pointer" />
              </th>
              {["No", "Nama Lengkap", "Jenis Kelamin", "Alamat", "No HP", "Email", "Jurusan", "Tahun Masuk", "Tahun Lulus", "Status Tracer", "Aksi"].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedList.map((item, i) => {
              const ts = item.tracerStudy;
              const status = getStatus(item);
              return (
                <tr key={item.id} className={`border-t hover:bg-gray-50 ${selected.has(item.id) ? "bg-green-50" : ""}`}>
                  <td className="px-3 py-3">
                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)}
                      className="w-4 h-4 accent-green-700 cursor-pointer" />
                  </td>
                  <td className="px-3 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-3 py-3 font-medium whitespace-nowrap">{item.nama}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.jenisKelamin || "—"}</td>
                  <td className="px-3 py-3 max-w-[200px] truncate" title={item.alamat || ""}>{item.alamat || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.noHp || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.user?.email || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.jurusan?.nama || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.tahunLulus ? item.tahunLulus - 3 : "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">{item.tahunLulus || "—"}</td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor[status]}`}>
                      {statusLabel[status]}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => openDetail(item)} className="text-green-600 hover:text-green-800" title="Lihat Detail">
                        <Info size={17} />
                      </button>
                      <button onClick={() => setEditItem(item)} className="text-blue-600 hover:text-blue-800" title="Edit Tracer Study">
                        <Pencil size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayedList.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-10 text-center text-gray-400 text-sm">Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <div>
                <h2 className="font-bold text-lg">Detail Lulusan</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {detailItem.nama} {detailItem.jurusan ? `· ${detailItem.jurusan.nama}` : ""} {detailItem.tahunLulus ? `· Angkatan ${detailItem.tahunLulus}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[getStatus(detailItem)]}`}>
                  {statusLabel[getStatus(detailItem)]}
                </span>
                <button onClick={() => setDetailItem(null)}><X size={20} className="text-gray-500" /></button>
              </div>
            </div>

            {/* Tab Navigasi */}
            <div className="flex border-b">
              <button
                onClick={() => setDetailTab("tracer")}
                className={`flex-1 py-2.5 text-sm font-medium transition ${detailTab === "tracer"
                  ? "border-b-2 border-[#0D704D] text-[#0D704D]"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Tracer Study
              </button>
              <button
                onClick={() => setDetailTab("portofolio")}
                className={`flex-1 py-2.5 text-sm font-medium transition flex items-center justify-center gap-1.5 ${detailTab === "portofolio"
                  ? "border-b-2 border-[#0D704D] text-[#0D704D]"
                  : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                Portofolio
                {portofolioList.length > 0 && (
                  <span className="bg-[#0D704D] text-white text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {portofolioList.length}
                  </span>
                )}
              </button>
            </div>

            {/* Konten Tab */}
            <div className="overflow-y-auto flex-1 px-6 py-5">

              {/* Tab: Tracer Study */}
              {detailTab === "tracer" && (
                <div className="space-y-5">
                  {/* Identitas */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Identitas Lengkap Lulusan</p>
                    <DetailRow label="Nama Lengkap" value={detailItem.nama} />
                    <DetailRow label="Jenis Kelamin" value={detailItem.jenisKelamin} />
                    <DetailRow label="Alamat" value={detailItem.alamat} />
                    <DetailRow label="No HP" value={detailItem.noHp} />
                    <DetailRow label="Email" value={detailItem.user?.email} />
                    <DetailRow label="Jurusan" value={detailItem.jurusan?.nama} />
                    <DetailRow label="Tahun Masuk" value={detailItem.tahunLulus ? detailItem.tahunLulus - 3 : null} />
                    <DetailRow label="Tahun Lulus" value={detailItem.tahunLulus} />
                  </div>

                  {/* Belum Mengisi */}
                  {!detailItem.tracerStudy && (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                      <p className="text-sm font-medium">Lulusan ini belum mengisi data tracer study.</p>
                    </div>
                  )}

                  {detailItem.tracerStudy && (
                    <>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Tracer Study</p>
                        <DetailRow label="Status" value={statusLabel[detailItem.tracerStudy.status]} />
                        <DetailRow label="Tanggal Isi" value={new Date(detailItem.tracerStudy.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
                      </div>
                      {detailItem.tracerStudy.status === "BEKERJA" && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Pekerjaan</p>
                          <DetailRow label="Pernah Melamar" value={detailItem.tracerStudy.pernahMelamar} />
                          <DetailRow label="Jenis Pekerjaan" value={detailItem.tracerStudy.jenisPekerjaan} />
                          <DetailRow label="Nama Instansi" value={detailItem.tracerStudy.namaPerusahaan} />
                          <DetailRow label="Alamat Instansi" value={detailItem.tracerStudy.alamatInstansi} />
                          <DetailRow label="Jabatan" value={detailItem.tracerStudy.jabatan} />
                          <DetailRow label="Deskripsi Pekerjaan" value={detailItem.tracerStudy.deskripsiPekerjaan} />
                          <DetailRow label="Mulai Kerja" value={formatMonthYear(detailItem.tracerStudy.mulaiKerja)} />
                          <DetailRow label="Berakhir / Selesai" value={formatMonthYear(detailItem.tracerStudy.masaKerja)} />
                          <DetailRow label="Besar Gaji" value={detailItem.tracerStudy.gaji ? `Rp ${Number(detailItem.tracerStudy.gaji).toLocaleString("id-ID")} / ${detailItem.tracerStudy.gaji}` : null} />
                          <DetailRow label="Lokasi Kerja" value={detailItem.tracerStudy.lokasiKerja} />
                          <DetailRow label="Sesuai Keahlian" value={detailItem.tracerStudy.sesuaiKeahlian} />
                          <DetailRow label="Masa Tunggu" value={detailItem.tracerStudy.masaTunggu ? `${detailItem.tracerStudy.masaTunggu}` : null} />
                        </div>
                      )}
                      {detailItem.tracerStudy.status === "KULIAH" && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Perkuliahan</p>
                          <DetailRow label="Nama Universitas" value={detailItem.tracerStudy.namaKampus} />
                          <DetailRow label="Alamat Universitas" value={detailItem.tracerStudy.alamatUniversitas} />
                          <DetailRow label="Jurusan / Program Studi" value={detailItem.tracerStudy.jurusanStudi} />
                          <DetailRow label="Bulan dan Tahun Studi" value={detailItem.tracerStudy.bulanTahunStudi} />
                        </div>
                      )}
                      {detailItem.tracerStudy.status === "WIRAUSAHA" && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Wirausaha</p>
                          <DetailRow label="Nama Usaha" value={detailItem.tracerStudy.namaUsaha} />
                          <DetailRow label="Bidang Usaha" value={detailItem.tracerStudy.bidangUsaha} />
                          <DetailRow label="Omset Pendapatan" value={detailItem.tracerStudy.omsetUsaha} />
                          <DetailRow label="Link Media Sosial / E-commerce" value={detailItem.tracerStudy.linkUsaha} />
                          <DetailRow label="Lokasi Usaha" value={detailItem.tracerStudy.lokasiKerja} />
                          <DetailRow label="Keterangan" value={detailItem.tracerStudy.keterangan} />
                        </div>
                      )}
                      {detailItem.tracerStudy.status === "BELUM_BEKERJA" && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Data Belum Bekerja</p>
                          <DetailRow
                            label="Terakhir Bekerja"
                            value={detailItem.tracerStudy.belumPernahBekerja === "Ya"
                              ? "Belum pernah bekerja sama sekali"
                              : formatMonthYear(detailItem.tracerStudy.terakhirBekerja)}
                          />
                          <DetailRow label="Alasan Belum Bekerja" value={detailItem.tracerStudy.alasanBelumBekerja} />
                          <DetailRow label="Keaktifan Mencari Kerja" value={detailItem.tracerStudy.aktifMencariKerja} />
                          <DetailRow label="Saluran Pencarian Kerja" value={detailItem.tracerStudy.saluranPencarianKerja} />
                          <DetailRow label="Upaya Peningkatan Diri" value={detailItem.tracerStudy.upayaPeningkatan} />
                          <DetailRow label="Kegiatan / Keterangan" value={detailItem.tracerStudy.kegiatanSaatIni} />
                          <DetailRow label="Keterangan Tambahan" value={detailItem.tracerStudy.keterangan} />
                        </div>
                      )}
                      {/* Sertifikat - ditampilkan untuk semua status */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sertifikat Lain (Selain Ijasah)</p>
                        <DetailRow label="Memiliki Sertifikat" value={detailItem.tracerStudy.pemilikSertifikat || "-"} />
                        {detailItem.tracerStudy.pemilikSertifikat === "Ya" && (
                          <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
                            <span className="text-xs text-gray-500 w-40 shrink-0">Jenis Sertifikat</span>
                            <div className="text-xs font-medium text-gray-800 w-full">
                              {(() => {
                                const parsed = parseSertifikat(detailItem.tracerStudy.jenisSertifikat);
                                if (parsed === "-") return <span>-</span>;
                                return (
                                  <ul className="list-disc list-inside space-y-1">
                                    {parsed.split("; ").map((item: string, idx: number) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab: Portofolio */}
              {detailTab === "portofolio" && (
                <div>
                  {portofolioLoading ? (
                    <div className="py-10 text-center text-gray-400 text-sm">Memuat portofolio...</div>
                  ) : portofolioList.length === 0 ? (
                    <div className="py-10 text-center">
                      <Layers size={36} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400">Lulusan ini belum mengisi portofolio.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {portofolioList.map((p: any) => {
                        const style = KATEGORI_STYLES[p.kategori] ?? KATEGORI_STYLES["Lainnya"];
                        const Icon = style.Icon;
                        return (
                          <div key={p.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg shrink-0 ${style.color}`}>
                                <Icon size={15} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-gray-800 text-sm">{p.judul}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.color}`}>{p.kategori}</span>
                                  {p.tahun && <span className="text-xs text-gray-400">{p.tahun}</span>}
                                </div>
                                {p.deskripsi && (
                                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.deskripsi}</p>
                                )}
                                {p.keahlian && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {p.keahlian.split(",").map((k: string) => k.trim()).filter(Boolean).map((k: string) => (
                                      <span key={k} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">{k}</span>
                                    ))}
                                  </div>
                                )}
                                {p.fileUrl && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                      {p.tipeFile === "application/pdf"
                                        ? <FileText size={13} className="text-red-500" />
                                        : <Award size={13} className="text-blue-500" />}
                                      <span className="text-xs text-gray-600 max-w-[160px] truncate">{p.namaFile || "File"}</span>
                                    </div>
                                    <a href={p.fileUrl} target="_blank" rel="noopener noreferrer"
                                      className="flex items-center gap-1 text-xs text-[#0D704D] hover:underline">
                                      <Eye size={12} /> Lihat
                                    </a>
                                    <a href={p.fileUrl} download={p.namaFile || true}
                                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700">
                                      <Download size={12} /> Unduh
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3 justify-between items-center bg-gray-50 rounded-b-2xl">
              <CVDownloadButton
                lulusanId={detailItem.id}
                label="Lihat CV"
                className="inline-flex items-center gap-1.5 bg-[#0D704D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0a5c3f] disabled:opacity-60 transition font-medium"
              />
              <button onClick={() => setDetailItem(null)} className="px-6 py-2 border rounded-lg hover:bg-gray-100 text-sm font-medium transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b flex-shrink-0">
              <div>
                <h2 className="font-bold text-lg">Edit Tracer Study</h2>
                <p className="text-xs text-gray-400 mt-0.5">Edit data atas nama {editItem.nama}</p>
              </div>
              <button onClick={() => setEditItem(null)}><X size={20} className="text-gray-500 hover:text-gray-900" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <TracerStudyForm
                adminLulusanId={editItem.id}
                adminInitialData={editItem.tracerStudy}
                adminIdentity={editItem}
                onSuccess={() => { setEditItem(null); load(); }}
                onCancel={() => setEditItem(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
