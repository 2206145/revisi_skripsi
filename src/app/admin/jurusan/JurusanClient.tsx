"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Download } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import * as XLSX from "xlsx";

export default function JurusanClient() {
    const [list, setList] = useState<any[]>([]);
    const [form, setForm] = useState({ kode: "", nama: "" });
    const [editId, setEditId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [confirm, setConfirm] = useState<{ type: "save" | "cancel" | "delete" | "bulkDelete"; id?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    async function load() {
        try {
            const data = await fetch("/api/jurusan").then((r) => r.json());
            if (Array.isArray(data)) {
                setList(data);
                setSelected(new Set());
            }
        } catch (err) {
            console.error("Error load jurusan:", err);
        }
    }

    useEffect(() => { load(); }, []);

    // ── Checkbox ──────────────────────────────────────────────────
    function toggleOne(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }

    function toggleAll() {
        if (selected.size === list.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(list.map((j) => j.id)));
        }
    }

    // ── Download ──────────────────────────────────────────────────
    function downloadExcel() {
        const targets = selected.size > 0 ? list.filter((j) => selected.has(j.id)) : list;
        const rows = targets.map((j, i) => ({
            "No": i + 1,
            "ID Jurusan": j.nomorId,
            "Kode Jurusan": j.kode,
            "Nama Jurusan": j.nama,
            "Jumlah Lulusan": j._count?.lulusan ?? 0,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws["!cols"] = [{ wch: 5 }, { wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Jurusan");
        XLSX.writeFile(wb, "data_jurusan.xlsx");
        toast.success(`${targets.length} data diunduh`);
    }

    // ── Bulk Delete ────────────────────────────────────────────────
    async function doBulkDelete() {
        setLoading(true);
        let sukses = 0, gagal = 0;
        for (const id of Array.from(selected)) {
            const res = await fetch(`/api/jurusan/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (res.ok) { sukses++; } else { gagal++; toast.error(result.error ?? "Gagal menghapus"); }
        }
        if (sukses > 0) toast.success(`${sukses} jurusan berhasil dihapus`);
        if (gagal > 0) toast.error(`${gagal} jurusan gagal dihapus (masih ada lulusan)`);
        setConfirm(null);
        setLoading(false);
        await load();
    }

    // ── Save ───────────────────────────────────────────────────────
    async function doSave() {
        setLoading(true);
        try {
            let res: Response;
            if (editId) {
                res = await fetch(`/api/jurusan/${editId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            } else {
                res = await fetch("/api/jurusan", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                });
            }
            const result = await res.json();
            if (!res.ok) { toast.error(result.error ?? "Terjadi kesalahan."); setConfirm(null); return; }
            toast.success(editId ? "Jurusan diperbarui" : "Jurusan ditambahkan");
            setShowModal(false);
            setForm({ kode: "", nama: "" });
            setEditId(null);
            setConfirm(null);
            await load();
        } catch { toast.error("Gagal menyimpan jurusan."); setConfirm(null); }
        finally { setLoading(false); }
    }

    async function doDelete(id: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/jurusan/${id}`, { method: "DELETE" });
            const result = await res.json();
            if (!res.ok) { toast.error(result.error ?? "Gagal menghapus jurusan."); setConfirm(null); return; }
            toast.success("Jurusan dihapus");
            setConfirm(null);
            await load();
        } catch { toast.error("Gagal menghapus jurusan."); setConfirm(null); }
        finally { setLoading(false); }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.kode.trim() || !form.nama.trim()) { toast.error("Kode dan Nama jurusan wajib diisi."); return; }
        setConfirm({ type: "save" });
    }

    const inp = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
    const allChecked = list.length > 0 && selected.size === list.length;
    const someChecked = selected.size > 0 && selected.size < list.length;

    return (
        <div className="w-full">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <button onClick={() => { setForm({ kode: "", nama: "" }); setEditId(null); setShowModal(true); }}
                    disabled={loading}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm disabled:opacity-50">
                    <Plus size={16} /> Tambah Jurusan
                </button>

                {selected.size > 0 && (
                    <button onClick={() => setConfirm({ type: "bulkDelete" })}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm disabled:opacity-50">
                        <Trash2 size={16} /> Hapus ({selected.size})
                    </button>
                )}
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-4 py-3 w-10">
                                <input type="checkbox" checked={allChecked} ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                    onChange={toggleAll}
                                    className="w-4 h-4 accent-green-700 cursor-pointer" />
                            </th>
                            {["No", "ID Jurusan", "Kode Jurusan", "Nama Jurusan", "Jumlah Lulusan", "Aksi"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, i) => (
                            <tr key={item.id} className={`border-t hover:bg-gray-50 ${selected.has(item.id) ? "bg-green-50" : ""}`}>
                                <td className="px-4 py-3">
                                    <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)}
                                        className="w-4 h-4 accent-green-700 cursor-pointer" />
                                </td>
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3 font-mono font-semibold text-gray-700">{item.nomorId}</td>
                                <td className="px-4 py-3 font-mono text-green-700 font-semibold">{item.kode}</td>
                                <td className="px-4 py-3 font-medium">{item.nama}</td>
                                <td className="px-4 py-3">{item._count?.lulusan ?? "-"}</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => { setForm({ kode: item.kode, nama: item.nama }); setEditId(item.id); setShowModal(true); }}
                                            disabled={loading} className="text-blue-600 hover:text-blue-800 disabled:opacity-50">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => setConfirm({ type: "delete", id: item.id })}
                                            disabled={loading} className="text-red-500 hover:text-red-700 disabled:opacity-50">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="font-bold text-lg">{editId ? "Edit Jurusan" : "Tambah Jurusan"}</h2>
                            <button onClick={() => setShowModal(false)} disabled={loading}><X size={20} /></button>
                        </div>
                        <div className="px-6 py-4">
                            <form id="jurusan-form" onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Jurusan</label>
                                    <input value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                                        required placeholder="Contoh: TKJ, RPL, AK" className={inp} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Jurusan</label>
                                    <input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                        required placeholder="Contoh: Teknik Komputer Jaringan" className={inp} />
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t flex gap-2">
                            <button form="jurusan-form" type="submit" disabled={loading}
                                className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium disabled:opacity-50">
                                {loading ? "Menyimpan..." : "Simpan"}
                            </button>
                            <button onClick={() => setConfirm({ type: "cancel" })} disabled={loading}
                                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50">Batal</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog open={confirm?.type === "save"}
                title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah"}
                message={editId ? "Apakah Anda yakin ingin menyimpan perubahan jurusan ini?" : "Apakah Anda yakin ingin menambahkan jurusan baru?"}
                confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "cancel"} title="Batalkan?" message="Data yang sudah diisi akan hilang."
                confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={() => { setConfirm(null); setShowModal(false); setForm({ kode: "", nama: "" }); setEditId(null); }}
                onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Jurusan?"
                message={(() => {
                    const item = list.find((j: any) => j.id === confirm?.id);
                    const jumlah = item?._count?.lulusan ?? 0;
                    if (jumlah > 0) return `Jurusan "${item?.nama}" masih memiliki ${jumlah} lulusan terdaftar. Pindahkan lulusan terlebih dahulu.`;
                    return `Apakah Anda yakin ingin menghapus jurusan "${item?.nama}"? Tindakan ini tidak dapat dibatalkan.`;
                })()}
                confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "bulkDelete"} title={`Hapus ${selected.size} Jurusan?`}
                message={`Anda akan menghapus ${selected.size} jurusan yang dipilih. Jurusan yang masih memiliki lulusan tidak akan dihapus.`}
                confirmLabel="Ya, Hapus Semua" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={doBulkDelete} onCancel={() => setConfirm(null)} />
        </div>
    );
}
