"use client";
import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { LabelList } from "recharts";
import StatCard from "@/components/StatCard";
import {
  Users, Briefcase, GraduationCap,
  Download, X, FileSpreadsheet, Filter, FileText, MapPin,
} from "lucide-react";
import * as XLSX from "xlsx";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444"];
const STATUS_LABEL: Record<string, string> = {
  BEKERJA: "Bekerja",
  KULIAH: "Kuliah",
  WIRAUSAHA: "Wirausaha",
  BELUM_BEKERJA: "Belum Bekerja",
};

type ModalType = "keterserapan" | "lulusan" | null;

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

export default function KepsekDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [tracerList, setTracerList] = useState<any[]>([]);

  // Filter grafik (tampil langsung di dashboard)
  const [filterTahun, setFilterTahun] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");

  // Modal unduh
  const [modal, setModal] = useState<ModalType>(null);
  const [modalFilterTahun, setModalFilterTahun] = useState("semua");
  const [modalFilterJurusan, setModalFilterJurusan] = useState("semua");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard").then((r) => r.json()).then(setData);
    fetch("/api/lulusan").then((r) => r.json()).then((list) => {
      // Map lulusan records to the expected tracer study shape for compatibility
      const mapped = list.map((l: any) => ({
        ...l.tracerStudy,
        status: l.tracerStudy?.status || "BELUM_ISI",
        lulusan: l,
        createdAt: l.tracerStudy?.createdAt
      }));
      setTracerList(mapped);
    });
  }, []);

  // ── Daftar tahun & jurusan unik ────────────────────────────────────────
  const tahunList = useMemo(() => {
    const set = new Set<number>();
    tracerList.forEach((t) => { if (t.lulusan?.tahunLulus) set.add(t.lulusan.tahunLulus); });
    return Array.from(set).sort((a, b) => b - a);
  }, [tracerList]);

  const jurusanList = useMemo(() => {
    const set = new Set<string>();
    tracerList.forEach((t) => { if (t.lulusan?.jurusan?.nama) set.add(t.lulusan.jurusan.nama); });
    return Array.from(set).sort();
  }, [tracerList]);

  // ── Data terfilter untuk grafik ─────────────────────────────────────────
  const filtered = useMemo(() => {
    return tracerList.filter((t) => {
      const tahunOk = filterTahun === "semua" || String(t.lulusan?.tahunLulus) === filterTahun;
      const jurusanOk = filterJurusan === "semua" || t.lulusan?.jurusan?.nama === filterJurusan;
      const tFilled = t.status !== "BELUM_ISI"; // Only show filled in chart
      return tahunOk && jurusanOk && tFilled;
    });
  }, [tracerList, filterTahun, filterJurusan]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      BEKERJA: 0, KULIAH: 0, WIRAUSAHA: 0, BELUM_BEKERJA: 0,
    };
    let total = 0;
    filtered.forEach((t) => { if (counts[t.status] !== undefined) { counts[t.status]++; total++; } });
    return Object.entries(counts).map(([key, value], i) => ({
      name: STATUS_LABEL[key] || key,
      value,
      percentage: total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0,
      fill: COLORS[i],
    }));
  }, [filtered]);

  // ── Data terfilter untuk modal unduh ───────────────────────────────────
  function getModalFiltered() {
    return tracerList.filter((t) => {
      const tahunOk = modalFilterTahun === "semua" || String(t.lulusan?.tahunLulus) === modalFilterTahun;
      const jurusanOk = modalFilterJurusan === "semua" || t.lulusan?.jurusan?.nama === modalFilterJurusan;
      return tahunOk && jurusanOk;
    });
  }

  function openModal(type: ModalType) {
    setModalFilterTahun("semua");
    setModalFilterJurusan("semua");
    setModal(type);
  }
  function closeModal() { setModal(null); }

  // ── Unduh Data Tracer Study (Format seperti Admin) ─────────────────────
  function doDownloadTracerStudy() {
    setDownloading(true);
    const mFiltered = getModalFiltered();

    const rows = mFiltered.map((item: any, i: number) => {
      const ts = item; // in Kepsek dashboard, item corresponds to the mapped tracerStudy object 
      const l = item.lulusan;
      const tahunMasuk = l?.tahunLulus ? l.tahunLulus - 3 : "";
      const status = item.status || "BELUM_ISI";
      const isBekerja = status === "BEKERJA";
      const isKuliah = status === "KULIAH";
      const isWirausaha = status === "WIRAUSAHA";
      const isBelum = status === "BELUM_BEKERJA";

      return {
        // Data Pribadi
        "No": i + 1,
        "Nama Lengkap": l?.nama || "",
        "Jenis Kelamin": l?.jenisKelamin || "",
        "Alamat": l?.alamat || "",
        "Telepon": l?.noHp || "",
        // Data Akademik
        "NIS": l?.nis || "",
        "Jurusan": l?.jurusan?.nama || "",
        "Tahun Masuk": tahunMasuk,
        "Tahun Lulus": l?.tahunLulus || "",
        "Email Akun": l?.user?.email || "",
        // Status
        "Status Keterserapan": STATUS_LABEL[status] || status,
        // Pekerjaan (hanya BEKERJA)
        "Pernah Melamar Pekerjaan": isBekerja ? (ts?.pernahMelamar || "") : "",
        "Jenis Pekerjaan": isBekerja ? (ts?.jenisPekerjaan || "") : "",
        "Nama Instansi": isBekerja ? (ts?.namaPerusahaan || "") : "",
        "Alamat Instansi": isBekerja ? (ts?.alamatInstansi || "") : "",
        "Jabatan": isBekerja ? (ts?.jabatan || "") : "",
        "Deskripsi Pekerjaan": isBekerja ? (ts?.deskripsiPekerjaan || "") : "",
        "Masa Kerja": isBekerja ? (ts?.masaKerja || "") : "",
        "Mulai Kerja": isBekerja ? (ts?.mulaiKerja || "") : "",
        "Sesuai Keahlian": isBekerja ? (ts?.sesuaiKeahlian || "") : "",
        "Masa Tunggu (Bulan)": isBekerja ? (ts?.masaTunggu || "") : "",
        "Besar Gaji": isBekerja ? (ts?.gaji ? `Rp ${Number(ts.gaji).toLocaleString("id-ID")}` : "") : "",
        "Lokasi Kerja": isBekerja ? (ts?.lokasiKerja || "") : "",
        // Kuliah
        "Nama Universitas": isKuliah ? (ts?.namaKampus || "") : "",
        "Alamat Universitas": isKuliah ? (ts?.alamatUniversitas || "") : "",
        "Jurusan / Program Studi": isKuliah ? (ts?.jurusanStudi || "") : "",
        "Bulan dan Tahun Awal Studi": isKuliah ? (ts?.bulanTahunStudi ? formatMonthYear(ts.bulanTahunStudi) : "") : "",
        // Wirausaha
        "Nama Usaha": isWirausaha ? (ts?.namaUsaha || "") : "",
        // Keterangan
        "Keterangan": (isWirausaha || isBelum) ? (ts?.keterangan || "") : "",
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

    const suffix = [
      modalFilterJurusan !== "semua" ? modalFilterJurusan.replace(/\s+/g, "_") : "",
      modalFilterTahun !== "semua" ? modalFilterTahun : "",
    ].filter(Boolean).join("_");

    XLSX.writeFile(wb, `data_tracer_study_${suffix || "semua"}.xlsx`);
    setDownloading(false);
    closeModal();
  }

  // removed doDownloadLulusan

  // ── Loading Skeleton ────────────────────────────────────────────────────
  if (!data) return (
    <div className="space-y-8 animate-pulse">
      <div className="flex gap-3">
        <div className="bg-gray-200 rounded-lg h-9 w-52" />
        <div className="bg-gray-200 rounded-lg h-9 w-44" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-200 rounded-xl h-24" />)}
      </div>
      <div className="bg-gray-200 rounded-xl h-96" />
    </div>
  );

  const totalFiltered = filtered.length;
  const bekerjaCount = filtered.filter((t) => t.status === "BEKERJA").length;
  const persen = data.totalTracerStudy > 0 ? Math.round((data.bekerja / data.totalTracerStudy) * 100) : 0;
  const persenFiltered = totalFiltered > 0 ? Math.round((bekerjaCount / totalFiltered) * 100) : 0;

  const modalTitle = "Unduh Data Tracer Study";
  const modalColor = "#16a34a";

  return (
    <div className="space-y-8">

      {/* ── TOMBOL UNDUH ── */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => openModal("keterserapan")}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm font-medium shadow transition-all active:scale-95"
        >
          <Download size={16} /> Unduh Data Tracer Study
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Lulusan" value={data.totalLulusan} color="bg-green-700" icon={<Users size={22} />} />
        <StatCard label="Bekerja" value={data.bekerja} color="bg-emerald-600" icon={<Briefcase size={22} />} />
        <StatCard label="Melanjutkan Kuliah" value={data.kuliah} color="bg-teal-600" icon={<GraduationCap size={22} />} />
      </div>

      {/* ── GRAFIK TUNGGAL + FILTER ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">

        {/* Header + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Grafik Status Lulusan</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {totalFiltered} data tracer study
              {filterTahun !== "semua" ? ` · Tahun ${filterTahun}` : ""}
              {filterJurusan !== "semua" ? ` · ${filterJurusan}` : ""}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-400 shrink-0" />

            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600 transition"
            >
              <option value="semua">Semua Tahun</option>
              {tahunList.map((t) => (
                <option key={t} value={String(t)}>{t}</option>
              ))}
            </select>

            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-600 transition"
            >
              <option value="semua">Semua Jurusan</option>
              {jurusanList.map((j) => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>

            {(filterTahun !== "semua" || filterJurusan !== "semua") && (
              <button
                onClick={() => { setFilterTahun("semua"); setFilterJurusan("semua"); }}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Chart Area */}
        {totalFiltered === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Tidak ada data untuk filter yang dipilih</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Donut / Pie Chart */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center mb-2">Distribusi Status</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(value: any, name: string, props: any) => [`${value} lulusan (${props.payload.percentage}%)`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal Bar Chart */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center mb-2">Persentase per Status</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 40 }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(val) => `${val}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} />
                  <Tooltip formatter={(value: any, name: string, props: any) => [`${props.payload.value} lulusan (${value}%)`, "Persentase"]} />
                  <Bar dataKey="percentage" name="Persentase" radius={[0, 6, 6, 0]} maxBarSize={38}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList dataKey="percentage" position="right" formatter={(val: any) => `${val}%`} style={{ fontSize: 13, fontWeight: 600, fill: "#374151" }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL FILTER UNDUH ── */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${modalColor}15` }}>
                  <FileSpreadsheet size={20} style={{ color: modalColor }} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{modalTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Pilih filter sebelum mengunduh</p>
                </div>
              </div>
              <button onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">
                <Filter size={13} /> Pilihan Filter
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Jurusan</label>
                <select
                  value={modalFilterJurusan}
                  onChange={(e) => setModalFilterJurusan(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-gray-50 transition"
                >
                  <option value="semua">Semua Jurusan</option>
                  {jurusanList.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Tahun Lulus</label>
                <select
                  value={modalFilterTahun}
                  onChange={(e) => setModalFilterTahun(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 bg-gray-50 transition"
                >
                  <option value="semua">Semua Tahun</option>
                  {tahunList.map((t) => (
                    <option key={t} value={String(t)}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-xs text-green-800">
                <span className="font-bold">
                  {modal === "keterserapan" ? getModalFiltered().length : "—"} data
                </span>
                {" "}akan diunduh sesuai filter yang dipilih.
              </div>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={doDownloadTracerStudy}
                disabled={downloading}
                className="flex-grow flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition active:scale-95 disabled:opacity-70"
                style={{ background: modalColor }}
              >
                {downloading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Mengunduh...
                  </span>
                ) : (
                  <>
                    <Download size={15} />
                    Unduh Excel
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ── PETA PERSEBARAN ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={18} className="text-green-700" />
          <h2 className="font-semibold text-gray-700">Peta Persebaran Lulusan</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          {data.markers?.length || 0} lulusan dengan data lokasi terdeteksi
        </p>
        <div style={{ height: "450px" }}>
          <MapView markers={data.markers || []} />
        </div>
      </div>

      {/* ── RINGKASAN PER JURUSAN ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Ringkasan per Jurusan</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                {["Jurusan", "Total Lulusan", "Bekerja", "Kuliah", "Wirausaha", "Keterserapan"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.perJurusan.map((j: any) => (
                <tr key={j.jurusan} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{j.jurusan}</td>
                  <td className="px-4 py-3">{j.total}</td>
                  <td className="px-4 py-3 text-green-700 font-medium">{j.bekerja}</td>
                  <td className="px-4 py-3 text-teal-600 font-medium">{j.kuliah}</td>
                  <td className="px-4 py-3 text-yellow-600 font-medium">{j.wirausaha}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-green-700">
                      {j.total > 0 ? `${Math.round((j.bekerja / j.total) * 100)}%` : "-"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
