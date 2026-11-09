"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Search, Loader2, Phone, Briefcase, GraduationCap, MapPin,
  Users, Mail, Award, FileText, ExternalLink, X, ChevronLeft,
  ChevronRight, ArrowUpDown, Tag, Calendar, Sparkles, LayoutGrid,
  Table as TableIcon, HelpCircle, CheckCircle2, MessageCircle
} from "lucide-react";
import CVDownloadButton from "@/components/CVDownloadButton";

interface PortofolioItem {
  id: string;
  judul: string;
  kategori: string;
  deskripsi?: string | null;
  fileUrl?: string | null;
  namaFile?: string | null;
  tipeFile?: string | null;
  keahlian?: string | null;
  tahun?: number | null;
}

interface LulusanItem {
  id: string;
  nama: string;
  nis?: string | null;
  tahunLulus?: number | null;
  noHp?: string | null;
  alamat?: string | null;
  jurusanId?: string | null;
  jurusan?: { id: string; kode: string; nama: string } | null;
  tracerStudy?: {
    status: string;
    namaPerusahaan?: string | null;
    jabatan?: string | null;
    namaKampus?: string | null;
    namaUsaha?: string | null;
    alasanBelumBekerja?: string | null;
    aktifMencariKerja?: string | null;
    kegiatanSaatIni?: string | null;
    terakhirBekerja?: string | null;
  } | null;
  user?: { email: string } | null;
  portofolio?: PortofolioItem[];
  _count?: { portofolio: number };
}

export default function LulusanPerusahaanClient() {
  const [data, setData] = useState<LulusanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tampilan: 'table' atau 'grid' (Default 'table' untuk kebutuhan data padat)
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Filters
  const [search, setSearch] = useState("");
  const [filterJurusan, setFilterJurusan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOnlyPortofolio, setFilterOnlyPortofolio] = useState(false);
  const [sortBy, setSortBy] = useState<"nama_asc" | "nama_desc" | "tahun_desc" | "portofolio_desc">("nama_asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal Detail & Info Siap Kerja
  const [selectedKandidat, setSelectedKandidat] = useState<LulusanItem | null>(null);
  const [showInfoSiapKerja, setShowInfoSiapKerja] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/perusahaan/lulusan");
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch (err) {
        console.error("Gagal memuat kandidat:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Ambil daftar jurusan dan tahun lulus unik
  const jurusans = useMemo(() => {
    const map = new Map<string, { id: string; nama: string; kode: string }>();
    data.forEach((l) => {
      if (l.jurusan) map.set(l.jurusan.id, l.jurusan);
    });
    return Array.from(map.values()).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [data]);

  const tahunList = useMemo(() => {
    const set = new Set<number>();
    data.forEach((l) => {
      if (l.tahunLulus) set.add(l.tahunLulus);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [data]);

  const getStatusText = (status?: string | null) => {
    switch (status) {
      case "BEKERJA": return "Sudah Bekerja";
      case "KULIAH": return "Melanjutkan Kuliah";
      case "WIRAUSAHA": return "Wirausaha";
      case "BELUM_BEKERJA": return "Siap Kerja (Mencari Kerja)";
      default: return "Belum Mengisi Tracer";
    }
  };

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case "BEKERJA": return "text-blue-700 bg-blue-50 border-blue-200";
      case "KULIAH": return "text-indigo-700 bg-indigo-50 border-indigo-200";
      case "WIRAUSAHA": return "text-amber-700 bg-amber-50 border-amber-200";
      case "BELUM_BEKERJA": return "text-emerald-700 bg-emerald-50 border-emerald-300 font-bold";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Reset pagination when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJurusan, filterTahun, filterStatus, filterOnlyPortofolio, sortBy]);

  // Filter & Search Logic
  const filtered = useMemo(() => {
    return data.filter((item) => {
      // 1. Search Query (Nama, Jurusan, Keahlian di Portofolio, atau Judul Portofolio)
      const q = search.trim().toLowerCase();
      let matchSearch = true;
      if (q) {
        const matchNama = item.nama.toLowerCase().includes(q);
        const matchJurusan = item.jurusan?.nama.toLowerCase().includes(q) || item.jurusan?.kode.toLowerCase().includes(q);
        const matchKeahlian = (item.portofolio || []).some(
          (p) =>
            (p.keahlian && p.keahlian.toLowerCase().includes(q)) ||
            p.judul.toLowerCase().includes(q) ||
            (p.deskripsi && p.deskripsi.toLowerCase().includes(q))
        );
        matchSearch = !!(matchNama || matchJurusan || matchKeahlian);
      }

      // 2. Filter Jurusan
      const matchJurusan = !filterJurusan || item.jurusanId === filterJurusan;

      // 3. Filter Tahun Lulus
      const matchTahun = !filterTahun || String(item.tahunLulus) === filterTahun;

      // 4. Filter Status
      const currentStatus = item.tracerStudy?.status || "BELUM_ISI";
      const matchStatus = !filterStatus || currentStatus === filterStatus;

      // 5. Filter Hanya yang punya portofolio
      const portofolioCount = item.portofolio?.length || item._count?.portofolio || 0;
      const matchPortofolio = !filterOnlyPortofolio || portofolioCount > 0;

      return matchSearch && matchJurusan && matchTahun && matchStatus && matchPortofolio;
    }).sort((a, b) => {
      if (sortBy === "nama_asc") return a.nama.localeCompare(b.nama);
      if (sortBy === "nama_desc") return b.nama.localeCompare(a.nama);
      if (sortBy === "tahun_desc") return (b.tahunLulus || 0) - (a.tahunLulus || 0);
      if (sortBy === "portofolio_desc") {
        const countA = a.portofolio?.length || a._count?.portofolio || 0;
        const countB = b.portofolio?.length || b._count?.portofolio || 0;
        return countB - countA;
      }
      return 0;
    });
  }, [data, search, filterJurusan, filterTahun, filterStatus, filterOnlyPortofolio, sortBy]);

  // Paginated Data
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Ekstraksi keahlian unik dari portofolio seorang lulusan
  const getSkillsFromCandidate = (candidate: LulusanItem): string[] => {
    if (!candidate.portofolio) return [];
    const skills = new Set<string>();
    candidate.portofolio.forEach((p) => {
      if (p.keahlian) {
        p.keahlian.split(",").forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) skills.add(trimmed);
        });
      }
    });
    return Array.from(skills);
  };

  return (
    <div className="space-y-6">
      {/* ── CARD FILTER & PENCARIAN KOMPREHENSIF ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="text-[#0D704D]" size={22} />
                Pencarian & Seleksi Kandidat Lulusan
              </h2>
              {/* Tooltip info Siap Kerja */}
              <button
                type="button"
                onClick={() => setShowInfoSiapKerja(true)}
                className="text-gray-400 hover:text-[#0D704D] transition"
                title="Bagaimana sistem mengetahui lulusan Siap Kerja?"
              >
                <HelpCircle size={17} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Pilih jurusan, saring status kesiapan kerja, dan telusuri portofolio serta sertifikasi keahlian kandidat.
            </p>
          </div>

          {/* Quick Stats & View Mode Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-emerald-50 text-[#0D704D] border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
              Ditemukan: {filtered.length} dari {data.length} Lulusan
            </span>

            {/* Toggle Table vs Grid */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === "table"
                    ? "bg-white text-[#0D704D] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <TableIcon size={14} />
                Tabel
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-[#0D704D] shadow-sm font-bold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid size={14} />
                Kartu (Grid)
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar Baris 1: Search & Filter Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Bar */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau keahlian (misal: Jaringan, Excel)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D704D] focus:border-transparent transition"
            />
          </div>

          {/* Filter Jurusan */}
          <div>
            <select
              value={filterJurusan}
              onChange={(e) => setFilterJurusan(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D704D] bg-white transition"
            >
              <option value="">🎓 Semua Jurusan</option>
              {jurusans.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} ({j.kode})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Tahun Lulus */}
          <div>
            <select
              value={filterTahun}
              onChange={(e) => setFilterTahun(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D704D] bg-white transition"
            >
              <option value="">📅 Semua Tahun Lulus</option>
              {tahunList.map((th) => (
                <option key={th} value={th}>
                  Angkatan {th}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Kesiapan Kerja */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D704D] bg-white transition"
            >
              <option value="">💼 Semua Status Tracer</option>
              <option value="BELUM_BEKERJA">✨ Siap Kerja (Belum Bekerja)</option>
              <option value="BEKERJA">Sudah Bekerja</option>
              <option value="KULIAH">Melanjutkan Kuliah</option>
              <option value="WIRAUSAHA">Wirausaha</option>
            </select>
          </div>
        </div>

        {/* Toolbar Baris 2: Filter Tambahan & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Checkbox Hanya yang punya Portofolio */}
            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 transition select-none">
              <input
                type="checkbox"
                checked={filterOnlyPortofolio}
                onChange={(e) => setFilterOnlyPortofolio(e.target.checked)}
                className="rounded text-[#0D704D] focus:ring-[#0D704D] h-4 w-4"
              />
              <span className="font-medium text-gray-700">Hanya yang memiliki Portofolio / Sertifikat</span>
            </label>

            {/* Reset Button */}
            {(search || filterJurusan || filterTahun || filterStatus || filterOnlyPortofolio) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterJurusan("");
                  setFilterTahun("");
                  setFilterStatus("");
                  setFilterOnlyPortofolio(false);
                }}
                className="text-red-600 hover:text-red-700 hover:underline font-medium"
              >
                Reset Semua Filter
              </button>
            )}
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium flex items-center gap-1">
              <ArrowUpDown size={13} /> Urutkan:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium focus:ring-1 focus:ring-[#0D704D]"
            >
              <option value="nama_asc">Nama (A - Z)</option>
              <option value="nama_desc">Nama (Z - A)</option>
              <option value="portofolio_desc">Portofolio &amp; Sertifikat Terbanyak</option>
              <option value="tahun_desc">Tahun Lulus Terbaru</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── TAMPILAN DATA (TABLE vs GRID) ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Loader2 className="animate-spin text-[#0D704D] mb-3" size={36} />
          <p className="text-gray-500 text-sm font-medium">Memuat data kandidat lulusan...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800">Tidak ada kandidat yang cocok</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mt-1 mb-5">
            Coba ubah kata kunci pencarian atau sesuaikan pilihan filter jurusan dan status.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setFilterJurusan("");
              setFilterTahun("");
              setFilterStatus("");
              setFilterOnlyPortofolio(false);
            }}
            className="inline-flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition"
          >
            Bersihkan Filter
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* ══════════════════════════════════════════════════════════
           TAMPILAN TABEL (Sangat cocok untuk data ribuan lulusan)
           ══════════════════════════════════════════════════════════ */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 border-collapse">
              <thead className="bg-gray-50/90 text-gray-700 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">Kandidat Lulusan</th>
                  <th className="py-3.5 px-4">Jurusan &amp; Angkatan</th>
                  <th className="py-3.5 px-4">Status Kesiapan Kerja</th>
                  <th className="py-3.5 px-4">Keahlian (Skills)</th>
                  <th className="py-3.5 px-4">Portofolio &amp; Berkas</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4 text-center w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedData.map((item, index) => {
                  const skills = getSkillsFromCandidate(item);
                  const portofolioList = item.portofolio || [];
                  const sertifikatCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("sertifikat")).length;
                  const prestasiCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("prestasi")).length;
                  const proyekCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("proyek")).length;
                  const isSiapKerja = item.tracerStudy?.status === "BELUM_BEKERJA";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/30 transition duration-150"
                    >
                      {/* Nomor Urut */}
                      <td className="py-4 px-4 text-center font-medium text-gray-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      {/* Info Kandidat */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-800 text-sm leading-snug">
                          {item.nama}
                        </div>
                        {item.nis && (
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            NIS: {item.nis}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{item.alamat || "Alamat belum diisi"}</span>
                        </div>
                      </td>

                      {/* Jurusan & Angkatan */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#0D704D] flex items-center gap-1">
                          <GraduationCap size={14} />
                          {item.jurusan?.nama || "-"}
                        </div>
                        {item.tahunLulus && (
                          <div className="text-[11px] text-gray-500 font-medium mt-0.5">
                            Angkatan {item.tahunLulus}
                          </div>
                        )}
                      </td>

                      {/* Status Kesiapan Kerja */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${getStatusColor(item.tracerStudy?.status)}`}>
                          {isSiapKerja && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                          {getStatusText(item.tracerStudy?.status)}
                        </span>
                        {/* Jika ada status keaktifan mencari kerja dari form tracer */}
                        {isSiapKerja && item.tracerStudy?.aktifMencariKerja && (
                          <div className="text-[10px] text-emerald-700 mt-1 font-medium italic">
                            {item.tracerStudy.aktifMencariKerja}
                          </div>
                        )}
                      </td>

                      {/* Keahlian (Skills) */}
                      <td className="py-4 px-4 max-w-[200px]">
                        {skills.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {skills.slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-emerald-50 text-[#0D704D] border border-emerald-100 px-1.5 py-0.5 rounded font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                            {skills.length > 3 && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                +{skills.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Portofolio & Sertifikat */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1 text-[11px]">
                          {sertifikatCount > 0 && (
                            <span className="text-blue-700 font-semibold flex items-center gap-1">
                              <Award size={12} /> {sertifikatCount} Sertifikat Pelatihan
                            </span>
                          )}
                          {prestasiCount > 0 && (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <Sparkles size={12} /> {prestasiCount} Prestasi
                            </span>
                          )}
                          {proyekCount > 0 && (
                            <span className="text-purple-700 font-medium flex items-center gap-1">
                              <Briefcase size={12} /> {proyekCount} Proyek
                            </span>
                          )}
                          {portofolioList.length === 0 && (
                            <span className="text-gray-400 text-[11px]">Belum ada data</span>
                          )}
                        </div>
                      </td>

                      {/* Kontak Langsung */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          {item.noHp ? (
                            <a
                              href={`https://wa.me/${item.noHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition"
                              title={`Chat WhatsApp: ${item.noHp}`}
                            >
                              <Phone size={13} />
                            </a>
                          ) : (
                            <span className="text-gray-300 p-1.5"><Phone size={13} /></span>
                          )}

                          {item.user?.email ? (
                            <a
                              href={`mailto:${item.user.email}`}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition"
                              title={`Kirim Email: ${item.user.email}`}
                            >
                              <Mail size={13} />
                            </a>
                          ) : (
                            <span className="text-gray-300 p-1.5"><Mail size={13} /></span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedKandidat(item)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0D704D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition"
                            title="Buka Portofolio, Sertifikat &amp; Detail Lengkap"
                          >
                            <FileText size={13} /> Detail
                          </button>

                          <CVDownloadButton
                            lulusanId={item.id}
                            label="CV"
                            className="inline-flex items-center gap-1 text-[11px] text-white bg-[#0D704D] hover:bg-[#0a5c3f] px-2.5 py-1.5 rounded-lg disabled:opacity-60 transition font-semibold shadow-sm"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════
           TAMPILAN KARTU (GRID)
           ══════════════════════════════════════════════════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedData.map((item) => {
            const skills = getSkillsFromCandidate(item);
            const portofolioList = item.portofolio || [];
            const sertifikatCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("sertifikat")).length;
            const proyekCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("proyek")).length;
            const prestasiCount = portofolioList.filter((p) => p.kategori.toLowerCase().includes("prestasi")).length;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md hover:border-emerald-200 transition duration-200 overflow-hidden"
              >
                {/* Bagian Atas Card */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Status Kesiapan Kerja Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${getStatusColor(item.tracerStudy?.status)}`}>
                      {getStatusText(item.tracerStudy?.status)}
                    </span>
                    {item.tahunLulus && (
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} /> Angkatan {item.tahunLulus}
                      </span>
                    )}
                  </div>

                  {/* Nama & Jurusan */}
                  <h3 className="font-bold text-gray-800 text-lg leading-snug line-clamp-1" title={item.nama}>
                    {item.nama}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#0D704D] font-medium mt-1 mb-3">
                    <GraduationCap size={15} />
                    <span>{item.jurusan?.nama || "Jurusan Tidak Terdata"}</span>
                  </div>

                  {/* Kontak & Alamat */}
                  <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-gray-400" />
                      <span className="line-clamp-1">{item.alamat || "Alamat belum diisi"}</span>
                    </div>
                    {item.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="shrink-0 text-gray-400" />
                        <span className="truncate">{item.user.email}</span>
                      </div>
                    )}
                    {item.noHp && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="shrink-0 text-gray-400" />
                        <span>{item.noHp}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags Keahlian / Skill Tags */}
                  <div className="mt-auto">
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
                      <Tag size={11} /> Keahlian Kandidat:
                    </p>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-emerald-50 text-[#0D704D] border border-emerald-100 px-2 py-0.5 rounded-md font-medium"
                          >
                            {sk}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">
                            +{skills.length - 4} lainnya
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Belum mengisi tag keahlian</p>
                    )}
                  </div>

                  {/* Ringkasan Portofolio & Sertifikat Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100 text-[11px]">
                    {sertifikatCount > 0 && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-medium border border-blue-100 flex items-center gap-1">
                        <Award size={11} /> {sertifikatCount} Sertifikat
                      </span>
                    )}
                    {prestasiCount > 0 && (
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-100 flex items-center gap-1">
                        <Sparkles size={11} /> {prestasiCount} Prestasi
                      </span>
                    )}
                    {proyekCount > 0 && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium border border-purple-100 flex items-center gap-1">
                        <Briefcase size={11} /> {proyekCount} Proyek
                      </span>
                    )}
                    {portofolioList.length === 0 && (
                      <span className="text-gray-400">Belum ada portofolio</span>
                    )}
                  </div>
                </div>

                {/* Bagian Bawah: Aksi (Lihat Detail & Unduh CV) */}
                <div className="bg-gray-50/90 px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedKandidat(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#0D704D] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2 rounded-xl transition"
                  >
                    <FileText size={14} />
                    Detail &amp; Portofolio
                  </button>

                  <CVDownloadButton
                    lulusanId={item.id}
                    label="Lihat CV"
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white bg-[#0D704D] hover:bg-[#0a5c3f] py-2 rounded-xl disabled:opacity-60 transition font-semibold shadow-sm"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── PAGINATION BAR (SANGAT PENTING UNTUK RIBUAN LULUSAN) ── */}
      {filtered.length > pageSize && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} kandidat
            </span>
            <span className="mx-1">•</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-xs text-gray-700 font-medium"
            >
              <option value={10}>10 per halaman</option>
              <option value={20}>20 per halaman</option>
              <option value={50}>50 per halaman</option>
              <option value={100}>100 per halaman</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1 text-xs font-semibold">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl transition ${
                        currentPage === p
                          ? "bg-[#0D704D] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-600"
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL LENGKAP KANDIDAT, PORTOFOLIO & SERTIFIKAT ── */}
      {selectedKandidat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header Modal */}
            <div className="p-6 bg-gradient-to-r from-emerald-800 to-[#0D704D] text-white flex items-start justify-between relative">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium backdrop-blur-md">
                    {selectedKandidat.jurusan?.nama || "Jurusan"}
                  </span>
                  {selectedKandidat.tahunLulus && (
                    <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full font-medium">
                      Angkatan {selectedKandidat.tahunLulus}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{selectedKandidat.nama}</h2>
                <p className="text-emerald-100 text-xs mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  Status Tracer: {getStatusText(selectedKandidat.tracerStudy?.status)}
                </p>
              </div>

              <button
                onClick={() => setSelectedKandidat(null)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body Modal (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Kontak & Aksi Cepat */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-xs">
                  <p className="text-gray-400 font-medium">Email:</p>
                  <p className="font-semibold text-gray-800 truncate">{selectedKandidat.user?.email || "-"}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-400 font-medium">No. Telepon / WhatsApp:</p>
                  <p className="font-semibold text-gray-800">{selectedKandidat.noHp || "-"}</p>
                </div>
                <div className="text-xs">
                  <p className="text-gray-400 font-medium">Alamat Domisili:</p>
                  <p className="font-semibold text-gray-800 truncate">{selectedKandidat.alamat || "-"}</p>
                </div>
              </div>

              {/* Box Status Kesiapan Kerja Khusus (jika BELUM_BEKERJA) */}
              {selectedKandidat.tracerStudy?.status === "BELUM_BEKERJA" && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    Indikator Kesiapan Kerja Lulusan (Data Kuesioner Tracer Study):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
                    <div>
                      <span className="text-gray-500 font-medium">Keaktifan Melamar:</span>{" "}
                      <span className="font-semibold text-emerald-900">
                        {selectedKandidat.tracerStudy.aktifMencariKerja || "Aktif mencari kerja"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium">Status Terakhir:</span>{" "}
                      <span className="font-semibold text-gray-800">
                        {selectedKandidat.tracerStudy.alasanBelumBekerja || "Sedang mencari pekerjaan"}
                      </span>
                    </div>
                    {selectedKandidat.tracerStudy.kegiatanSaatIni && (
                      <div className="sm:col-span-2">
                        <span className="text-gray-500 font-medium">Kegiatan Saat Ini:</span>{" "}
                        <span className="text-gray-800">{selectedKandidat.tracerStudy.kegiatanSaatIni}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hubungi Langsung & Download CV */}
              <div className="flex flex-wrap items-center gap-3">
                {selectedKandidat.noHp && (
                  <a
                    href={`https://wa.me/${selectedKandidat.noHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Phone size={14} /> Hubungi via WhatsApp
                  </a>
                )}
                {selectedKandidat.user?.email && (
                  <a
                    href={`mailto:${selectedKandidat.user.email}`}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                  >
                    <Mail size={14} /> Kirim Email
                  </a>
                )}
                <CVDownloadButton
                  lulusanId={selectedKandidat.id}
                  label="Unduh / Lihat Dokumen CV (PDF)"
                  className="inline-flex items-center gap-1.5 bg-[#0D704D] hover:bg-[#0a5c3f] text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                />
              </div>

              {/* Daftar Keahlian Lengkap */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <Tag className="text-[#0D704D]" size={16} />
                  Keahlian &amp; Kompetensi Terverifikasi
                </h4>
                {getSkillsFromCandidate(selectedKandidat).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getSkillsFromCandidate(selectedKandidat).map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-emerald-50 text-[#0D704D] border border-emerald-200 text-xs px-3 py-1 rounded-lg font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                    Kandidat belum mendokumentasikan daftar keahlian spesifik.
                  </p>
                )}
              </div>

              {/* Daftar Portofolio, Sertifikat & Prestasi */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Award className="text-[#0D704D]" size={18} />
                    Portofolio, Sertifikat Pelatihan &amp; Prestasi ({selectedKandidat.portofolio?.length || 0})
                  </h4>
                </div>

                {selectedKandidat.portofolio && selectedKandidat.portofolio.length > 0 ? (
                  <div className="space-y-3">
                    {selectedKandidat.portofolio.map((p) => {
                      const isSertifikat = p.kategori.toLowerCase().includes("sertifikat");
                      const isPrestasi = p.kategori.toLowerCase().includes("prestasi");

                      return (
                        <div
                          key={p.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                                    isSertifikat
                                      ? "bg-blue-100 text-blue-700"
                                      : isPrestasi
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {p.kategori}
                                </span>
                                {p.tahun && <span className="text-xs text-gray-400">Tahun {p.tahun}</span>}
                              </div>
                              <h5 className="font-bold text-gray-800 text-sm">{p.judul}</h5>
                            </div>

                            {/* Tombol Lihat Berkas / Bukti Sertifikat jika diupload */}
                            {p.fileUrl && (
                              <a
                                href={p.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-semibold transition shrink-0"
                              >
                                <ExternalLink size={13} />
                                Lihat Berkas Sertifikat
                              </a>
                            )}
                          </div>

                          {p.deskripsi && (
                            <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50/60 p-2.5 rounded-lg">
                              {p.deskripsi}
                            </p>
                          )}

                          {p.keahlian && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {p.keahlian.split(",").map((k, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium"
                                >
                                  {k.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                    <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-500 font-medium">Belum ada portofolio atau sertifikat yang diunggah.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedKandidat(null)}
                className="px-5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PENJELASAN INDIKATOR SIAP KERJA ── */}
      {showInfoSiapKerja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0D704D]">
                  <HelpCircle size={20} />
                </div>
                <h3 className="font-bold text-gray-800 text-base">Dari Mana Mengetahui Lulusan Siap Kerja?</h3>
              </div>
              <button
                onClick={() => setShowInfoSiapKerja(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-3 leading-relaxed">
              <p>
                Status <strong>&quot;Siap Kerja (Mencari Kerja)&quot;</strong> diperoleh secara riil langsung dari pengisian kuesioner <strong>Tracer Study</strong> oleh alumni:
              </p>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0D704D]">1.</span>
                  <span><strong>Status Lulusan:</strong> Alumni memilih opsi <code>BELUM BEKERJA</code> pada Tracer Study (bukan sedang kuliah atau berwirausaha).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0D704D]">2.</span>
                  <span><strong>Tingkat Keaktifan:</strong> Di kuesioner, lulusan mengisi parameter <em>&quot;Seberapa aktif mencari kerja&quot;</em> (misal: <em>Sangat Aktif</em> atau <em>Cukup Aktif melamar</em>).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0D704D]">3.</span>
                  <span><strong>Alasan &amp; Kesiapan:</strong> Lulusan menyatakan sedang menunggu panggilan kerja / sedang mencari lowongan yang sesuai.</span>
                </div>
              </div>
              <p className="text-gray-500 italic">
                Dengan parameter ini, perusahaan mitra DUDI dapat langsung menyortir dan menghubungi alumni yang memang siap ditempatkan dan bersedia bekerja.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowInfoSiapKerja(false)}
                className="px-4 py-2 bg-[#0D704D] text-white rounded-xl text-xs font-semibold hover:bg-[#0a5c3f] transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
