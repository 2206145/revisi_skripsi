"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Globe, Phone, Building2 } from "lucide-react";

export default function PerusahaanDashboardClient() {
  const [data, setData] = useState<any>(null);

  async function load() {
    const d = await fetch("/api/perusahaan/me").then((r) => r.json());
    setData(d);
  }

  useEffect(() => { load(); }, []);

  if (!data) return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-gray-200 rounded-xl h-24" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="bg-gray-200 rounded-xl h-20" />)}
      </div>
    </div>
  );

  const totalLowongan = data.lowongan?.length || 0;
  const lowonganAktif = data.lowongan?.filter((l: any) => l.isActive)?.length || 0;
  const lowonganTutup = data.lowongan?.filter((l: any) => !l.isActive)?.length || 0;

  return (
    <div className="space-y-6">
      {/* Info singkat perusahaan */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#0D704D]/10 flex items-center justify-center">
          <Building2 size={28} className="text-[#0D704D]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{data.nama || "Nama Perusahaan"}</h2>
          <p className="text-sm text-gray-500">{data.bidang || "-"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {data.kota && <span className="flex items-center gap-1"><MapPin size={11} />{data.kota}</span>}
            {data.telepon && <span className="flex items-center gap-1"><Phone size={11} />{data.telepon}</span>}
            {data.website && <span className="flex items-center gap-1"><Globe size={11} />{data.website}</span>}
          </div>
        </div>
      </div>

      {/* Statistik lowongan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Lowongan", value: totalLowongan, color: "text-gray-800", bg: "bg-white" },
          { label: "Lowongan Aktif", value: lowonganAktif, color: "text-green-700", bg: "bg-green-50" },
          { label: "Lowongan Tutup", value: lowonganTutup, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl shadow p-5 flex items-center gap-4`}>
            <Briefcase size={22} className={color} />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
