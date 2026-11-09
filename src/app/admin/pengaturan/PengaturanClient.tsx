"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Save, AlertTriangle } from "lucide-react";

export default function PengaturanClient() {
    const [form, setForm] = useState({ alamat: "", email: "", whatsapp: "", telepon: "", logoUrl: "", heroTitle: "", heroDesc: "" });
    const [originalForm, setOriginalForm] = useState({ alamat: "", email: "", whatsapp: "", telepon: "", logoUrl: "", heroTitle: "", heroDesc: "" });
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [logoPreview, setLogoPreview] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        fetch("/api/pengaturan").then((r) => r.json()).then((d) => {
            const data = {
                alamat: d.alamat || "", email: d.email || "", whatsapp: d.whatsapp || "", telepon: d.telepon || "",
                logoUrl: d.logoUrl || "", heroTitle: d.heroTitle || "", heroDesc: d.heroDesc || ""
            };
            setForm(data);
            setOriginalForm(data);
            setLogoPreview(data.logoUrl || "/logo_smk.png");
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            setForm(prev => ({ ...prev, logoUrl: base64 }));
        };
        reader.readAsDataURL(file);
    };

    function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setShowConfirm(true);
    }

    async function doSave() {
        setShowConfirm(false);
        setLoading(true);
        const res = await fetch("/api/pengaturan", {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        setLoading(false);
        if (res.ok) {
            toast.success("Pengaturan sistem berhasil diperbarui, muat ulang halaman jika logo belum berubah.");
            setOriginalForm(form);
            setIsEditing(false);
        } else {
            toast.error("Gagal menyimpan pengaturan");
        }
    }

    return (
        <div className="bg-white rounded-xl shadow p-6 max-w-2xl bg-white border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Pengaturan Sistem &amp; Landing Page</h2>
                    <p className="text-sm text-gray-500 mt-1">Konfigurasi tampilan global dan informasi kontak pada sistem.</p>
                </div>
                {!isEditing && (
                    <button type="button" onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center gap-2">
                        Edit Pengaturan
                    </button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* ── BAGIAN LANDING PAGE & TAMPILAN ── */}
                <div className="p-4 border border-gray-100 bg-gray-50 rounded-xl space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">Tampilan Global &amp; Landing Page</h3>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#0D704D] rounded-xl flex items-center justify-center p-2 flex-shrink-0 shadow-sm border border-[#0D704D]/20">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain filter brightness-0 invert" />
                            ) : (
                                <span className="text-xs text-white">Logo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo Sekolah / BKK</label>
                            <input type="file" accept="image/*" onChange={handleFileChange} disabled={!isEditing}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
                            />
                            <p className="text-xs text-gray-400 mt-1">Disarankan berupa format PNG dengan background transparan.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Judul Landing Page (Hero Title)</label>
                        <input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="Sistem Informasi Tracer Study & Bursa Kerja" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Landing Page (Hero Description)</label>
                        <textarea rows={3} value={form.heroDesc} onChange={(e) => setForm({ ...form, heroDesc: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="Deskripsi singkat..." />
                    </div>
                </div>

                {/* ── BAGIAN KONTAK ── */}
                <div className="p-4 border border-gray-100 rounded-xl space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informasi Kontak BKK</h3>
                    <p className="text-xs text-gray-500">Informasi ini akan ditampilkan di menu Footer (menu paling bawah) Landing page.</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Resmi BKK</label>
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="bkk@smkbinabhakti.sch.id" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No WhatsApp (Gunakan 62, cth: 62812...)</label>
                        <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="628123456789" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telepon Kantor</label>
                        <input value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="022-1234567" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Kantor BKK</label>
                        <textarea rows={3} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                            disabled={!isEditing}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500" placeholder="Jl. Contoh..." />
                    </div>
                </div>

                {isEditing && (
                    <div className="flex items-center gap-3 pt-2">
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 font-medium disabled:opacity-60 text-sm shadow-md">
                            <Save size={16} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                        <button type="button" disabled={loading} onClick={() => { setForm(originalForm); setIsEditing(false); setLogoPreview(originalForm.logoUrl || "/logo_smk.png"); }}
                            className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300 font-medium text-sm transition">
                            Batal
                        </button>
                    </div>
                )}
            </form>

            {/* Popup Konfirmasi Simpan */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                <AlertTriangle size={20} className="text-yellow-500" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Konfirmasi Simpan Pengaturan</p>
                                <p className="text-xs text-gray-400 mt-0.5">Perubahan akan langsung diterapkan ke sistem</p>
                            </div>
                        </div>
                        <div className="px-6 py-4 text-sm text-gray-600">
                            Apakah Anda yakin ingin menyimpan perubahan pengaturan sistem ini?
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-100 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={doSave}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-700 text-white text-sm font-bold hover:bg-green-800 transition disabled:opacity-70"
                            >
                                <Save size={15} /> Ya, Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
