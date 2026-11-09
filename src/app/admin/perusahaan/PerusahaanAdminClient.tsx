"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, MapPin, Loader2, Info } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = { nama: "", bidang: "", alamat: "", kota: "", telepon: "", website: "", deskripsi: "", latitude: "", longitude: "", email: "", password: "" };

export default function PerusahaanAdminClient({ role = "ADMIN" }: { role?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [confirm, setConfirm] = useState<{ type: "save" | "delete"; id?: string } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolocation");
      return;
    }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }));
        toast.success("Lokasi berhasil didapatkan!");
        setGettingLocation(false);
      },
      (err) => {
        toast.error("Gagal mendapatkan lokasi: " + err.message);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function load() {
    const data = await fetch("/api/perusahaan").then((r) => r.json());
    setList(data);
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirm({ type: "save" });
  }

  async function doSave() {
    if (editId) {
      await fetch(`/api/perusahaan/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Data diperbarui");
    } else {
      await fetch("/api/perusahaan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      toast.success("Perusahaan ditambahkan");
    }
    setShowModal(false); setForm(emptyForm); setEditId(null); setConfirm(null); load();
  }

  async function doDelete(id: string) {
    await fetch(`/api/perusahaan/${id}`, { method: "DELETE" });
    toast.success("Dihapus"); setConfirm(null); load();
  }

  function openEdit(item: any) {
    setForm({ nama: item.nama, bidang: item.bidang || "", alamat: item.alamat || "", kota: item.kota || "", telepon: item.telepon || "", website: item.website || "", deskripsi: item.deskripsi || "", latitude: item.latitude || "", longitude: item.longitude || "", email: "", password: "" });
    setEditId(item.id);
    setShowModal(true);
  }

  return (
    <div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              {["Nama Perusahaan", "Bidang", "Alamat", "Kota", "Telepon", "Lowongan", "Aksi"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr key={item.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{item.nama}</td>
                <td className="px-4 py-3">{item.bidang || "-"}</td>
                <td className="px-4 py-3 max-w-[160px] truncate" title={item.alamat || ""}>{item.alamat || "-"}</td>
                <td className="px-4 py-3">{item.kota || "-"}</td>
                <td className="px-4 py-3">{item.telepon || "-"}</td>
                <td className="px-4 py-3">{item.lowongan?.length || 0} lowongan</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => { setForm(item); setShowDetail(true); }} className="text-green-600 hover:text-green-800" title="Detail Perusahaan"><Info size={16} /></button>
                  {role === "ADMIN" && (
                    <>
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit Perusahaan"><Pencil size={16} /></button>
                      <button onClick={() => setConfirm({ type: "delete", id: item.id })} className="text-red-500 hover:text-red-700" title="Hapus Perusahaan"><Trash2 size={16} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>}
          </tbody>
        </table>
      </div>

      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="font-bold text-lg">Detail Perusahaan</h2>
              <button onClick={() => setShowDetail(false)}><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                <div><p className="text-xs text-gray-500 mb-1">Nama Perusahaan</p><p className="font-semibold">{form.nama}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Bidang Usaha</p><p className="font-medium">{form.bidang || "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Kota</p><p>{form.kota || "-"}</p></div>
                <div><p className="text-xs text-gray-500 mb-1">Telepon</p><p>{form.telepon || "-"}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Alamat</p><p>{form.alamat || "-"}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Website</p>
                  {form.website ? <a href={form.website} target="_blank" className="text-blue-600 hover:underline">{form.website}</a> : "-"}
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Lokasi (Koordinat)</p>
                  {form.latitude && form.longitude ? (
                    <div className="flex items-center gap-2">
                      <p>{form.latitude}, {form.longitude}</p>
                      <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`} target="_blank" rel="noreferrer"
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1">
                        <MapPin size={12} /> Buka di Maps
                      </a>
                    </div>
                  ) : "-"}
                </div>
                <div className="col-span-2"><p className="text-xs text-gray-500 mb-1">Deskripsi</p><p className="whitespace-pre-wrap">{form.deskripsi || "-"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editId ? "Edit Perusahaan" : "Tambah Perusahaan"}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: "Nama Perusahaan", key: "nama" }, { label: "Bidang Usaha", key: "bidang" },
                { label: "Alamat", key: "alamat" }, { label: "Kota", key: "kota" },
                { label: "Telepon", key: "telepon" }, { label: "Website", key: "website" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}

              {/* Lokasi Section */}
              <div className="border border-blue-100 bg-blue-50 rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                    <MapPin size={15} /> Koordinat Lokasi
                  </span>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="flex items-center gap-1.5 text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {gettingLocation ? (
                      <><Loader2 size={12} className="animate-spin" /> Mengambil Lokasi...</>
                    ) : (
                      <><MapPin size={12} /> Gunakan Lokasi Terkini</>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                    <input
                      value={form.latitude}
                      onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                      placeholder="-6.9147..."
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                    <input
                      value={form.longitude}
                      onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                      placeholder="107.6122..."
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                </div>
                {form.latitude && form.longitude && (
                  <p className="text-xs text-blue-600 flex items-center gap-1">
                    <MapPin size={11} />
                    Koordinat: {form.latitude}, {form.longitude}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {!editId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Login</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-800 font-medium">Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={confirm?.type === "save"} title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Perusahaan"}
        message={editId ? "Apakah Anda yakin ingin menyimpan perubahan data perusahaan ini?" : "Apakah Anda yakin ingin menambahkan perusahaan baru?"}
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Perusahaan?" message="Data perusahaan ini akan dihapus permanen."
        confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />
    </div>
  );
}
