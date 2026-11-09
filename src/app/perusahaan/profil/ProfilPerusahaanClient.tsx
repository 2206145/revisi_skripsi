"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pencil, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ProfilPerusahaanClient() {
    const [data, setData] = useState<any>(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<any>({});
    const [confirm, setConfirm] = useState<"save" | "cancel" | null>(null);
    const [loading, setLoading] = useState(false);

    async function load() {
        const d = await fetch("/api/perusahaan/me").then((r) => r.json());
        setData(d);
        setForm({
            nama: d.nama || "", bidang: d.bidang || "", alamat: d.alamat || "",
            kota: d.kota || "", telepon: d.telepon || "", website: d.website || "",
            deskripsi: d.deskripsi || "", latitude: d.latitude || "", longitude: d.longitude || "",
        });
    }

    useEffect(() => { load(); }, []);

    async function doSave() {
        setConfirm(null);
        setLoading(true);
        const res = await fetch("/api/perusahaan/me", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        setLoading(false);
        if (!res.ok) { toast.error("Gagal menyimpan profil"); return; }
        toast.success("Profil perusahaan diperbarui");
        setEditMode(false);
        load();
    }

    if (!data) return <div className="text-gray-500">Memuat data...</div>;

    const fieldCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
    const disabledCls = "w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed";

    const fields = [
        { label: "Nama Perusahaan", key: "nama" },
        { label: "Bidang Usaha", key: "bidang" },
        { label: "Alamat", key: "alamat" },
        { label: "Kota", key: "kota" },
        { label: "Telepon", key: "telepon" },
        { label: "Website", key: "website" },
        { label: "Latitude", key: "latitude" },
        { label: "Longitude", key: "longitude" },
    ];

    return (
        <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-semibold text-gray-700 text-lg">Profil Perusahaan</h2>
                {!editMode ? (
                    <button onClick={() => setEditMode(true)}
                        className="flex items-center gap-1 text-sm text-[#0D704D] hover:text-green-800 font-medium">
                        <Pencil size={14} /> Edit Profil
                    </button>
                ) : (
                    <button onClick={() => setConfirm("cancel")}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                        <X size={14} /> Batal
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {fields.map(({ label, key }) => (
                    <div key={key}>
                        <label className="block text-gray-500 mb-1">{label}</label>
                        {editMode ? (
                            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                className={fieldCls} />
                        ) : (
                            <div className={disabledCls}>{data[key] || "-"}</div>
                        )}
                    </div>
                ))}

                {/* Deskripsi — full width */}
                <div className="sm:col-span-2">
                    <label className="block text-gray-500 mb-1">Deskripsi</label>
                    {editMode ? (
                        <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                            rows={4} className={fieldCls} />
                    ) : (
                        <div className={`${disabledCls} min-h-[80px]`}>{data.deskripsi || "-"}</div>
                    )}
                </div>
            </div>

            {editMode && (
                <div className="flex justify-end mt-6">
                    <button onClick={() => setConfirm("save")} disabled={loading}
                        className="bg-[#0D704D] text-white px-6 py-2 rounded-lg hover:bg-green-800 text-sm font-medium disabled:opacity-60">
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            )}

            <ConfirmDialog open={confirm === "save"} title="Simpan Perubahan?"
                message="Apakah Anda yakin ingin menyimpan perubahan profil perusahaan ini?"
                confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm === "cancel"} title="Batalkan Perubahan?"
                message="Perubahan yang belum disimpan akan hilang."
                confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={() => { setConfirm(null); setEditMode(false); load(); }}
                onCancel={() => setConfirm(null)} />
        </div>
    );
}
