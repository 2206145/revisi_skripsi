"use client";
import { useEffect, useState } from "react";
import { Briefcase, MapPin, DollarSign, Calendar, Phone, Star, Sparkles } from "lucide-react";

export default function LowonganLulusanClient({
  userJurusanId,
  userJurusanNama,
}: {
  userJurusanId?: string;
  userJurusanNama?: string;
}) {
  const [rawLowongan, setRawLowongan] = useState<any[]>([]);
  const [kontakModal, setKontakModal] = useState<any | null>(null);

  async function load() {
    const l = await fetch("/api/lowongan").then((r) => r.json());
    setRawLowongan(Array.isArray(l) ? l : []);
  }

  useEffect(() => { load(); }, []);

  // --- Sorting 4 level berdasarkan kesesuaian jurusan ---
  // Skor 3: jurusanId cocok persis → "Direkomendasikan"
  // Skor 2: judul/deskripsi/bidang mengandung kata kunci dari nama jurusan lulusan
  // Skor 1: lowongan terbuka semua jurusan (jurusanId null/kosong)
  // Skor 0: lowongan untuk jurusan LAIN (tidak relevan)
  function getRelevanceScore(item: any): number {
    // Level 3: cocok jurusanId persis
    if (item.jurusanId && item.jurusanId === userJurusanId) return 3;
    // Level 0: lowongan untuk jurusan lain
    if (item.jurusanId && item.jurusanId !== userJurusanId) return 0;
    // Level 2: keyword matching
    if (userJurusanNama) {
      const keywords = userJurusanNama
        .toLowerCase()
        .split(/[\s\/\-&,()]+/)
        .filter((w) => w.length >= 3 && !["dan", "dan", "untuk", "smk", "dan"].includes(w));
      const haystack = `${item.judul} ${item.deskripsi || ""} ${item.perusahaan?.bidang || ""}`.toLowerCase();
      if (keywords.some((kw) => haystack.includes(kw))) return 2;
    }
    // Level 1: terbuka semua jurusan
    return 1;
  }

  const lowongan = [...rawLowongan].sort((a, b) => {
    const diff = getRelevanceScore(b) - getRelevanceScore(a);
    if (diff !== 0) return diff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-4">
      {lowongan.length === 0 && (
        <div className="text-center py-12 text-gray-400">Belum ada lowongan tersedia</div>
      )}

      {lowongan.map((item) => {
        const score = getRelevanceScore(item);
        let suitLabel = "";
        let suitColor = "";
        let borderColor = "";
        let icon = null;

        if (score === 3) {
          suitLabel = "Sangat Cocok";
          suitColor = "bg-green-100 text-[#0D704D]";
          borderColor = "border-l-[#0D704D]";
          icon = <Star size={10} className="fill-[#0D704D]" />;
        } else if (score === 2) {
          suitLabel = "Cocok";
          suitColor = "bg-blue-100 text-blue-700";
          borderColor = "border-l-blue-400";
          icon = <Star size={10} className="fill-blue-700" />;
        } else if (score === 1) {
          suitLabel = "Umum";
          suitColor = "bg-gray-100 text-gray-700";
          borderColor = "border-l-gray-300";
        } else {
          suitLabel = "Tidak Cocok";
          suitColor = "bg-red-100 text-red-600";
          borderColor = "border-l-red-400";
        }

        return (
          <div
            key={item.id}
            className={`bg-white rounded-xl shadow p-6 border-l-4 transition hover:shadow-md ${borderColor}`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <h2 className="text-lg font-semibold text-gray-800">{item.judul}</h2>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${suitColor}`}>
                    {icon} {suitLabel}
                  </span>
                </div>
                <p className="text-blue-700 font-medium">{item.perusahaan?.nama}</p>

                {/* Info jurusan lowongan */}
                {item.jurusan && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Target Jurusan: <span className="font-medium text-gray-500">{item.jurusan.nama}</span>
                  </p>
                )}

                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  {item.perusahaan?.bidang && (
                    <span className="flex items-center gap-1"><Briefcase size={14} />{item.perusahaan.bidang}</span>
                  )}
                  {item.perusahaan?.kota && (
                    <span className="flex items-center gap-1"><MapPin size={14} />{item.perusahaan.kota}</span>
                  )}
                  {item.gaji && (
                    <span className="flex items-center gap-1"><DollarSign size={14} />{item.gaji}</span>
                  )}
                  {item.deadline && (
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />Deadline: {new Date(item.deadline).toLocaleDateString("id-ID")}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm text-gray-600">{item.deskripsi}</p>
                {item.persyaratan && (
                  <p className="mt-2 text-sm text-gray-500">
                    <span className="font-medium">Persyaratan:</span> {item.persyaratan}
                  </p>
                )}
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setKontakModal(item.perusahaan)}
                  className="flex items-center gap-1 bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800"
                >
                  <Phone size={14} /> Hubungi Perusahaan
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Modal kontak perusahaan */}
      {kontakModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg">Kontak Perusahaan</h2>
              <button onClick={() => setKontakModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm">
              <p className="font-semibold text-gray-800 text-base">{kontakModal.nama}</p>
              {kontakModal.telepon && (
                <div className="flex items-center gap-2">
                  <Phone size={15} className="text-green-700" />
                  <a href={`tel:${kontakModal.telepon}`} className="text-green-700 hover:underline">{kontakModal.telepon}</a>
                  <a href={`https://wa.me/62${kontakModal.telepon.replace(/^0/, "")}`} target="_blank" rel="noopener noreferrer"
                    className="ml-auto bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">WhatsApp</a>
                </div>
              )}
              {kontakModal.website && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Website:</span>
                  <a href={kontakModal.website.startsWith("http") ? kontakModal.website : `https://${kontakModal.website}`}
                    target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{kontakModal.website}</a>
                </div>
              )}
              {kontakModal.alamat && <p className="text-gray-500"><span className="font-medium">Alamat:</span> {kontakModal.alamat}</p>}
              {kontakModal.kota && <p className="text-gray-500"><span className="font-medium">Kota:</span> {kontakModal.kota}</p>}
            </div>
            <div className="px-6 py-4 border-t">
              <button onClick={() => setKontakModal(null)} className="w-full border py-2 rounded-lg hover:bg-gray-50 text-sm">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
