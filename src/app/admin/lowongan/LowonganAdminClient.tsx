"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Info } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  judul: "",
  deskripsi: "",
  persyaratan: "",
  gaji: "",
  deadline: "",
  perusahaanId: "",
  perusahaanRaw: "",
  bidangUsaha: "",
  jurusanId: "",
};

export default function LowonganAdminClient({ role = "ADMIN" }: { role?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [perusahaan, setPerusahaan] = useState<any[]>([]);
  const [jurusan, setJurusan] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<any | null>(null);
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: string } | null>(null);

  async function load() {
    const [l, p, j] = await Promise.all([
      fetch("/api/lowongan?all=1").then((r) => r.json()),
      fetch("/api/perusahaan").then((r) => r.json()),
      fetch("/api/jurusan").then((r) => r.json()),
    ]);
    setList(Array.isArray(l) ? l : []);
    setPerusahaan(Array.isArray(p) ? p : []);
    setJurusan(Array.isArray(j) ? j : []);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirm({ type: "save" });
  }

  async function doSave() {
    const payload = {
      judul: form.judul,
      deskripsi: form.deskripsi,
      persyaratan: form.persyaratan,
      gaji: form.gaji,
      deadline: form.deadline,
      perusahaanId: form.perusahaanId,
      perusahaanRaw: form.perusahaanRaw,
      jurusanId: form.jurusanId || null,
    };

    if (editId) {
      const res = await fetch(`/api/lowongan/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast.error("Gagal memperbarui lowongan"); setConfirm(null); return; }
      toast.success("Lowongan diperbarui");
    } else {
      const res = await fetch("/api/lowongan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) { toast.error("Gagal menambah lowongan"); setConfirm(null); return; }
      toast.success("Lowongan ditambahkan");
    }
    setShowModal(false);
    setForm(emptyForm);
    setEditId(null);
    setConfirm(null);
    load();
  }

  async function doDelete(id: string) {
    await fetch(`/api/lowongan/${id}`, { method: "DELETE" });
    toast.success("Lowongan dihapus");
    setConfirm(null);
    load();
  }

  function openEdit(item: any) {
    setForm({
      judul: item.judul,
      deskripsi: item.deskripsi || "",
      persyaratan: item.persyaratan || "",
      gaji: item.gaji || "",
      deadline: item.deadline ? item.deadline.split("T")[0] : "",
      perusahaanId: item.perusahaanId,
      perusahaanRaw: item.perusahaan?.nama || "",
      bidangUsaha: item.perusahaan?.bidang || "",
      jurusanId: item.jurusanId || "",
    });
    setEditId(item.id);
    setShowModal(true);
  }

  const isExpired = (item: any) => item.deadline && new Date(item.deadline) < new Date();

  return (
    <div>
      {role === "ADMIN" && (
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowModal(true); }}
          className="mb-4 flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
        >
          <Plus size={16} /> Tambah Lowongan
        </button>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["No", "Nama Perusahaan", "Bidang Pekerjaan", "Judul Lowongan", "Target Jurusan", "Gaji", "Deadline", "Status", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{item.perusahaan?.nama || "-"}</td>
                <td className="px-4 py-3">{item.perusahaan?.bidang || "-"}</td>
                <td className="px-4 py-3">{item.judul}</td>
                <td className="px-4 py-3">
                  {item.jurusan
                    ? <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">{item.jurusan.nama}</span>
                    : <span className="text-gray-400 text-xs">Semua Jurusan</span>}
                </td>
                <td className="px-4 py-3">{item.gaji || "-"}</td>
                <td className="px-4 py-3">
                  {item.deadline ? (
                    <span className={isExpired(item) ? "text-red-500 font-medium" : ""}>
                      {new Date(item.deadline).toLocaleDateString("id-ID")}
                    </span>
                  ) : "-"}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDetail(item)}
                      className="text-green-600 hover:text-green-800"
                      title="Detail"
                    >
                      <Info size={16} />
                    </button>
                    {role === "ADMIN" && (
                      <>
                        <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => setConfirm({ type: "delete", id: item.id })}
                          className="text-red-500 hover:text-red-700"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Belum ada data lowongan</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editId ? "Edit Lowongan" : "Tambah Lowongan"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nama Perusahaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan <span className="text-red-500">*</span></label>
                <input
                  list="companies-list"
                  value={form.perusahaanRaw}
                  onChange={(e) => {
                    const val = e.target.value;
                    const found = perusahaan.find((p) => p.nama === val);
                    setForm({
                      ...form,
                      perusahaanRaw: val,
                      perusahaanId: found ? found.id : "",
                      bidangUsaha: found ? found.bidang || "" : "",
                    });
                  }}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pilih atau ketik nama perusahaan..."
                  required
                />
                <datalist id="companies-list">
                  {perusahaan.map((p: any) => <option key={p.id} value={p.nama} />)}
                </datalist>
              </div>

              {/* Bidang Pekerjaan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Pekerjaan</label>
                <input
                  value={form.bidangUsaha}
                  onChange={(e) => setForm({ ...form, bidangUsaha: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600"
                  placeholder="Otomatis dari data perusahaan (opsional)"
                  readOnly={!!form.perusahaanId}
                />
                {form.perusahaanId && (
                  <p className="text-xs text-gray-400 mt-1">Bidang pekerjaan diambil dari data perusahaan.</p>
                )}
              </div>

              {/* Judul */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Lowongan <span className="text-red-500">*</span></label>
                <input
                  value={form.judul}
                  onChange={(e) => setForm({ ...form, judul: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Teknisi Komputer"
                  required
                />
              </div>

              {/* Gaji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gaji</label>
                <input
                  value={form.gaji}
                  onChange={(e) => setForm({ ...form, gaji: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Rp 3.000.000 / bulan"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Lowongan otomatis nonaktif setelah tanggal deadline.</p>
              </div>

              {/* Target Jurusan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Jurusan</label>
                <select
                  value={form.jurusanId}
                  onChange={(e) => setForm({ ...form, jurusanId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jurusan (tidak spesifik)</option>
                  {jurusan.map((j: any) => (
                    <option key={j.id} value={j.id}>{j.nama}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Pilih jurusan agar lowongan tampil lebih awal bagi lulusan jurusan tersebut.
                </p>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi pekerjaan..."
                  required
                />
              </div>

              {/* Persyaratan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persyaratan</label>
                <textarea
                  value={form.persyaratan}
                  onChange={(e) => setForm({ ...form, persyaratan: e.target.value })}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Persyaratan pelamar..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Detail Lowongan</h2>
              <button onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div><p className="text-xs text-gray-500 mb-1">Nama Perusahaan</p><p className="font-semibold text-blue-700">{showDetail.perusahaan?.nama || "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Bidang Pekerjaan</p><p>{showDetail.perusahaan?.bidang || "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Judul Lowongan</p><p className="font-semibold">{showDetail.judul}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Gaji</p><p>{showDetail.gaji || "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Deadline</p><p className={showDetail.deadline && new Date(showDetail.deadline) < new Date() ? "text-red-500 font-medium" : ""}>{showDetail.deadline ? new Date(showDetail.deadline).toLocaleDateString("id-ID") : "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${showDetail.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {showDetail.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Deskripsi</p><p className="whitespace-pre-wrap">{showDetail.deskripsi || "-"}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Persyaratan</p><p className="whitespace-pre-wrap">{showDetail.persyaratan || "-"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm?.type === "save"}
        title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Lowongan"}
        message={editId ? "Apakah Anda yakin ingin menyimpan perubahan lowongan ini?" : "Apakah Anda yakin ingin menambahkan lowongan baru?"}
        confirmLabel="Ya, Simpan"
        onConfirm={doSave}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "delete"}
        title="Hapus Lowongan?"
        message="Lowongan ini akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => doDelete(confirm!.id!)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
