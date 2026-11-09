"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Mail, Send, CheckSquare, Square, Loader2,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";

type ResultItem = {
  nama: string;
  email: string;
  status: "berhasil" | "gagal";
  error?: string;
};

export default function NotifikasiClient({ role = "ADMIN" }: { role?: string }) {
  const [lulusan, setLulusan] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [summary, setSummary] = useState<{ berhasil: number; gagal: number } | null>(null);

  useEffect(() => {
    fetch("/api/lulusan")
      .then((r) => r.json())
      .then((data) => {
        setLulusan(data.filter((l: any) => !l.tracerStudy));
      });
  }, []);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelected(selected.length === lulusan.length ? [] : lulusan.map((l) => l.id));
  }

  async function handleKirim() {
    if (selected.length === 0) {
      toast.error("Pilih minimal satu lulusan");
      return;
    }
    setLoading(true);
    setResults([]);
    setSummary(null);

    const res = await fetch("/api/notifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lulusanIds: selected }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      toast.error(data.error || "Gagal memproses");
      return;
    }

    setResults(data.results);
    setSummary({ berhasil: data.berhasil, gagal: data.gagal });

    if (data.berhasil > 0) {
      toast.success(`${data.berhasil} email berhasil dikirim!`);
    }
    if (data.gagal > 0) {
      toast.error(`${data.gagal} email gagal dikirim`);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1 flex items-center gap-2">
          <Mail size={16} />
          Kirim Pesan Email
        </p>
        <p>
          Halaman ini menampilkan lulusan yang <strong>belum mengisi Tracer Study</strong>.
          Pilih lulusan lalu klik kirim — sistem akan mengirim email pengingat secara otomatis
          ke alamat email masing-masing.
        </p>
      </div>

      {/* Tabel Lulusan */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-700">
            Lulusan Belum Isi Tracer Study
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({lulusan.length} lulusan)
            </span>
          </h2>
          {role === "ADMIN" && (
            <button
              onClick={toggleAll}
              className="flex items-center gap-1 text-sm text-green-700 hover:underline"
            >
              {selected.length === lulusan.length && lulusan.length > 0 ? (
                <CheckSquare size={16} />
              ) : (
                <Square size={16} />
              )}
              {selected.length === lulusan.length && lulusan.length > 0
                ? "Batal Pilih Semua"
                : "Pilih Semua"}
            </button>
          )}
        </div>

        {lulusan.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CheckCircle2 size={40} className="mx-auto mb-2 text-green-400" />
            <p>🎉 Semua lulusan sudah mengisi Tracer Study!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  {["Nama", "NIS", "Jurusan", "Tahun Lulus", "Email"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lulusan.map((item) => (
                  <tr
                    key={item.id}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${selected.includes(item.id) ? "bg-green-50" : ""
                      }`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <td className="px-4 py-3">
                      {selected.includes(item.id) ? (
                        <CheckSquare size={16} className="text-green-700" />
                      ) : (
                        <Square size={16} className="text-gray-400" />
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{item.nama}</td>
                    <td className="px-4 py-3">{item.nis}</td>
                    <td className="px-4 py-3">{item.jurusan?.nama}</td>
                    <td className="px-4 py-3">{item.tahunLulus}</td>
                    <td className="px-4 py-3 text-blue-600">
                      {item.user?.email || (
                        <span className="text-red-400 text-xs">Tidak ada email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {lulusan.length > 0 && role === "ADMIN" && (
          <div className="mt-5 flex items-center gap-3 border-t pt-4">
            <span className="text-sm text-gray-500">{selected.length} lulusan dipilih</span>
            <button
              onClick={handleKirim}
              disabled={loading || selected.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Mengirim Email...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Kirim Email Sekarang
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hasil Pengiriman */}
      {results.length > 0 && summary && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
            <Mail size={18} className="text-green-600" />
            Hasil Pengiriman Email
          </h2>

          {/* Ringkasan */}
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
              <CheckCircle2 size={16} className="text-green-600" />
              <span className="text-green-800 font-medium">{summary.berhasil} Berhasil</span>
            </div>
            {summary.gagal > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
                <XCircle size={16} className="text-red-500" />
                <span className="text-red-700 font-medium">{summary.gagal} Gagal</span>
              </div>
            )}
          </div>

          {/* Detail per lulusan */}
          <div className="space-y-2">
            {results.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between border rounded-lg px-4 py-3 ${item.status === "berhasil"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.status === "berhasil" ? (
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-red-500 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-800">{item.nama}</p>
                    <p className="text-xs text-gray-500">{item.email}</p>
                    {item.error && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle size={11} />
                        {item.error}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === "berhasil"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                    }`}
                >
                  {item.status === "berhasil" ? "Terkirim" : "Gagal"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
