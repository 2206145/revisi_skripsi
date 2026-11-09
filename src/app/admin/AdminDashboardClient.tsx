"use client";
import { useEffect, useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";
import StatCard from "@/components/StatCard";
import { Users, Building2, Briefcase, FileText, Filter } from "lucide-react";

const COLORS = ["#16a34a", "#3b82f6", "#f59e0b", "#ef4444"];
const STATUS_LABEL: Record<string, string> = {
  BEKERJA: "Bekerja",
  KULIAH: "Kuliah",
  WIRAUSAHA: "Wirausaha",
  BELUM_BEKERJA: "Belum Bekerja",
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<any>(null);
  const [tracerList, setTracerList] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [filterTahun, setFilterTahun] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");

  useEffect(() => {
    fetch("/api/dashboard")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        if (!text) throw new Error("Response kosong dari server");
        return JSON.parse(text);
      })
      .then(setData)
      .catch((err) => setError(err.message));

    fetch("/api/tracer-study")
      .then((r) => r.json())
      .then(setTracerList)
      .catch(() => { });
  }, []);

  // Daftar tahun & jurusan unik dari tracerList
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

  // Data terfilter
  const filtered = useMemo(() => {
    return tracerList.filter((t) => {
      const tahunOk = filterTahun === "semua" || String(t.lulusan?.tahunLulus) === filterTahun;
      const jurusanOk = filterJurusan === "semua" || t.lulusan?.jurusan?.nama === filterJurusan;
      return tahunOk && jurusanOk;
    });
  }, [tracerList, filterTahun, filterJurusan]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      BEKERJA: 0, KULIAH: 0, WIRAUSAHA: 0, BELUM_BEKERJA: 0,
    };
    let totalCount = 0;
    filtered.forEach((t) => { if (counts[t.status] !== undefined) { counts[t.status]++; totalCount++; } });
    return Object.entries(counts).map(([key, value], i) => ({
      name: STATUS_LABEL[key] || key,
      value,
      percentage: totalCount > 0 ? Number(((value / totalCount) * 100).toFixed(1)) : 0,
      fill: COLORS[i],
    }));
  }, [filtered]);

  if (error) return (
    <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">
      ⚠️ Gagal memuat data dashboard: <strong>{error}</strong>
      <br /><span className="text-sm text-gray-500">Pastikan server database berjalan dan Prisma Client sudah di-generate.</span>
    </div>
  );

  if (!data) return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-24" />
        ))}
      </div>
      <div className="bg-gray-200 rounded-xl h-96" />
    </div>
  );

  const total = filtered.length;
  const bekerjaCount = filtered.filter((t) => t.status === "BEKERJA").length;
  const persen = total > 0 ? Math.round((bekerjaCount / total) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Lulusan" value={data.totalLulusan} color="bg-green-700" icon={<Users size={22} />} />
        <StatCard label="Tracer Study" value={data.totalTracerStudy} color="bg-emerald-600" icon={<FileText size={22} />} />
        <StatCard label="Perusahaan" value={data.totalPerusahaan} color="bg-yellow-500" icon={<Building2 size={22} />} />
        <StatCard label="Lowongan Aktif" value={data.totalLowongan} color="bg-teal-600" icon={<Briefcase size={22} />} />
      </div>

      {/* ── GRAFIK KETERSERAPAN + FILTER ── */}
      <div className="bg-white rounded-xl shadow p-6 space-y-5">
        {/* Header + Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Grafik Status Lulusan</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {total} data tracer study
              {filterTahun !== "semua" ? ` · Tahun ${filterTahun}` : ""}
              {filterJurusan !== "semua" ? ` · ${filterJurusan}` : ""}
            </p>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-400" />

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

        {/* Chart */}
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Tidak ada data untuk filter yang dipilih</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
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

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
                <XAxis type="number" domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value: any, name: string, props: any) => [`${props.payload.value} lulusan (${value}%)`, "Persentase"]} />
                <Bar dataKey="percentage" name="Persentase" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                  <LabelList dataKey="percentage" position="right" formatter={(val: any) => `${val}%`} style={{ fontSize: 12, fill: "#374151" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
