"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    Plus, Pencil, Trash2, X, Upload, FileText, Image as ImageIcon,
    FolderOpen, Award, Trophy, Briefcase, Layers, Download,
    ChevronDown, Eye,
} from "lucide-react";

const KATEGORI_LIST = [
    { value: "Proyek", icon: FolderOpen, color: "bg-blue-100 text-blue-700" },
    { value: "Sertifikat", icon: Award, color: "bg-yellow-100 text-yellow-700" },
    { value: "Prestasi", icon: Trophy, color: "bg-orange-100 text-orange-700" },
    { value: "Pengalaman", icon: Briefcase, color: "bg-purple-100 text-purple-700" },
    { value: "Karya Tulis", icon: FileText, color: "bg-teal-100 text-teal-700" },
    { value: "Lainnya", icon: Layers, color: "bg-gray-100 text-gray-700" },
];

function getKategoriStyle(kategori: string) {
    return KATEGORI_LIST.find((k) => k.value === kategori) ?? KATEGORI_LIST[5];
}

const emptyForm = {
    judul: "", kategori: "Proyek", deskripsi: "",
    keahlian: "", tahun: "",
};

function FilePreviewIcon({ tipeFile }: { tipeFile?: string }) {
    if (!tipeFile) return <FileText size={14} className="text-gray-400" />;
    if (tipeFile === "application/pdf") return <FileText size={14} className="text-red-500" />;
    return <ImageIcon size={14} className="text-blue-500" />;
}

export default function PortofolioClient() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // State untuk file upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string; tipe: string } | null>(null);
    const [uploading, setUploading] = useState(false);
    const [removeFile, setRemoveFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function load() {
        setLoading(true);
        const res = await fetch("/api/portofolio");
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    function resetFileState() {
        setSelectedFile(null);
        setUploadedFile(null);
        setRemoveFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function openAdd() {
        setEditId(null);
        setForm({ ...emptyForm });
        resetFileState();
        setShowForm(true);
    }

    function openEdit(item: any) {
        setEditId(item.id);
        setForm({
            judul: item.judul || "",
            kategori: item.kategori || "Proyek",
            deskripsi: item.deskripsi || "",
            keahlian: item.keahlian || "",
            tahun: item.tahun ? String(item.tahun) : "",
        });
        // Set file info yang sudah ada
        if (item.fileUrl) {
            setUploadedFile({ url: item.fileUrl, name: item.namaFile || "File", tipe: item.tipeFile || "" });
        } else {
            setUploadedFile(null);
        }
        setSelectedFile(null);
        setRemoveFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowForm(true);
    }

    async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi di client
        const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!ALLOWED.includes(file.type)) {
            toast.error("Hanya PDF, JPG, atau PNG yang diizinkan");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setSelectedFile(file);
        setRemoveFile(false);
    }

    async function uploadFile(file: File): Promise<{ url: string; name: string; tipe: string } | null> {
        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        setUploading(false);
        if (!res.ok) {
            const err = await res.json();
            toast.error(err.error || "Gagal mengupload file");
            return null;
        }
        const data = await res.json();
        return { url: data.url, name: data.name, tipe: data.type };
    }

    async function handleSave() {
        if (!form.judul.trim()) { toast.error("Judul wajib diisi"); return; }
        setSaving(true);

        let fileUrl: string | null = null;
        let namaFile: string | null = null;
        let tipeFile: string | null = null;

        if (removeFile) {
            // User memilih hapus file
            fileUrl = null; namaFile = null; tipeFile = null;
        } else if (selectedFile) {
            // Upload file baru
            const result = await uploadFile(selectedFile);
            if (!result) { setSaving(false); return; }
            fileUrl = result.url; namaFile = result.name; tipeFile = result.tipe;
        } else if (uploadedFile) {
            // Pertahankan file yang sudah ada
            fileUrl = uploadedFile.url; namaFile = uploadedFile.name; tipeFile = uploadedFile.tipe;
        }

        const method = editId ? "PUT" : "POST";
        const url = editId ? `/api/portofolio/${editId}` : "/api/portofolio";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                tahun: form.tahun ? Number(form.tahun) : null,
                fileUrl, namaFile, tipeFile,
            }),
        });
        setSaving(false);
        if (!res.ok) { toast.error("Gagal menyimpan"); return; }
        toast.success(editId ? "Portofolio diperbarui" : "Portofolio ditambahkan");
        setShowForm(false);
        resetFileState();
        load();
    }

    async function handleDelete(id: string) {
        const res = await fetch(`/api/portofolio/${id}`, { method: "DELETE" });
        if (!res.ok) { toast.error("Gagal menghapus"); return; }
        toast.success("Portofolio dihapus");
        setDeleteId(null);
        load();
    }

    const currentYear = new Date().getFullYear();

    // Tentukan label file yang ditampilkan di form
    const displayFileName = selectedFile
        ? selectedFile.name
        : uploadedFile
            ? uploadedFile.name
            : null;

    return (
        <div className="bg-white rounded-xl shadow p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h2 className="font-semibold text-gray-700 text-base">Portofolio</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Tambahkan karya, sertifikat, atau pengalaman Anda</p>
                </div>
                <button
                    onClick={openAdd}
                    className="flex items-center gap-1.5 bg-[#0D704D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0a5c3f] transition font-medium"
                >
                    <Plus size={15} /> Tambah
                </button>
            </div>

            {/* Kategori pills */}
            <div className="flex flex-wrap gap-2 mb-5">
                {KATEGORI_LIST.map((k) => {
                    const count = items.filter((i) => i.kategori === k.value).length;
                    if (count === 0) return null;
                    const Icon = k.icon;
                    return (
                        <span key={k.value} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${k.color}`}>
                            <Icon size={11} /> {k.value} ({count})
                        </span>
                    );
                })}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">Memuat...</div>
            ) : items.length === 0 ? (
                <div className="text-center py-10">
                    <Layers size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Belum ada portofolio.</p>
                    <p className="text-gray-400 text-xs mt-1">Klik "Tambah" untuk menambahkan karya pertama Anda.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => {
                        const style = getKategoriStyle(item.kategori);
                        const Icon = style.icon;
                        return (
                            <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={`p-2 rounded-lg shrink-0 ${style.color}`}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                                <h3 className="font-semibold text-gray-800 text-sm">{item.judul}</h3>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style.color}`}>{item.kategori}</span>
                                                {item.tahun && <span className="text-xs text-gray-400">{item.tahun}</span>}
                                            </div>
                                            {item.deskripsi && (
                                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.deskripsi}</p>
                                            )}
                                            {item.keahlian && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {item.keahlian.split(",").map((k: string) => k.trim()).filter(Boolean).map((k: string) => (
                                                        <span key={k} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-md">{k}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {/* File attachment */}
                                            {item.fileUrl && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                                                        <FilePreviewIcon tipeFile={item.tipeFile} />
                                                        <span className="text-xs text-gray-600 max-w-[160px] truncate">{item.namaFile || "File"}</span>
                                                    </div>
                                                    <a
                                                        href={item.fileUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-xs text-[#0D704D] hover:underline"
                                                    >
                                                        <Eye size={12} /> Lihat
                                                    </a>
                                                    <a
                                                        href={item.fileUrl}
                                                        download={item.namaFile || true}
                                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        <Download size={12} /> Unduh
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEdit(item)}
                                            className="p-1.5 text-gray-400 hover:text-[#0D704D] hover:bg-green-50 rounded-lg transition">
                                            <Pencil size={14} />
                                        </button>
                                        <button onClick={() => setDeleteId(item.id)}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Form Tambah / Edit */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="px-6 py-4 border-b flex justify-between items-center">
                            <h2 className="font-bold text-gray-800">{editId ? "Edit Portofolio" : "Tambah Portofolio"}</h2>
                            <button onClick={() => { setShowForm(false); resetFileState(); }} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

                            {/* Judul */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Judul Karya <span className="text-red-500">*</span></label>
                                <input
                                    value={form.judul}
                                    onChange={(e) => setForm({ ...form, judul: e.target.value })}
                                    placeholder="cth: Laporan PKL, Sertifikat K3, Juara LKS, dll"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D]"
                                />
                            </div>

                            {/* Kategori */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Kategori <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <select
                                        value={form.kategori}
                                        onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D] appearance-none bg-white pr-8"
                                    >
                                        {KATEGORI_LIST.map((k) => (
                                            <option key={k.value} value={k.value}>{k.value}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Pilih jenis: Proyek (PKL/tugas), Sertifikat (pelatihan), Prestasi (juara), Pengalaman (kerja/magang), Karya Tulis, atau Lainnya
                                </p>
                            </div>

                            {/* Deskripsi */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                                <textarea
                                    rows={3}
                                    value={form.deskripsi}
                                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                                    placeholder="Jelaskan singkat tentang karya atau pencapaian ini..."
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D] resize-none"
                                />
                            </div>

                            {/* Keahlian */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Keahlian / Kompetensi</label>
                                <input
                                    value={form.keahlian}
                                    onChange={(e) => setForm({ ...form, keahlian: e.target.value })}
                                    placeholder="cth: Microsoft Excel, Desain Grafis, Pengelasan, Memasak"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D]"
                                />
                                <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma jika lebih dari satu</p>
                            </div>

                            {/* Tahun */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Tahun</label>
                                <input
                                    type="number"
                                    value={form.tahun}
                                    onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                                    placeholder={String(currentYear)}
                                    min="2000" max={currentYear}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0D704D]"
                                />
                            </div>

                            {/* Upload File Sertifikat / Dokumen */}
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Upload File Sertifikat / Dokumen
                                </label>

                                {/* Tampilkan file yang sudah ada / baru dipilih */}
                                {(displayFileName && !removeFile) ? (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="p-2 bg-white border border-green-200 rounded-lg shrink-0">
                                            {selectedFile?.type === "application/pdf" || uploadedFile?.tipe === "application/pdf"
                                                ? <FileText size={18} className="text-red-500" />
                                                : <ImageIcon size={18} className="text-blue-500" />
                                            }
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700 truncate">{displayFileName}</p>
                                            {selectedFile && (
                                                <p className="text-xs text-gray-400">
                                                    {(selectedFile.size / 1024).toFixed(0)} KB
                                                    {selectedFile.type === "application/pdf" ? " · PDF" : " · Gambar"}
                                                </p>
                                            )}
                                            {uploadedFile && !selectedFile && (
                                                <p className="text-xs text-green-600">File sudah diunggah sebelumnya</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-xs text-[#0D704D] hover:underline shrink-0"
                                            >
                                                Ganti
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setRemoveFile(true); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                className="text-xs text-red-400 hover:text-red-600 shrink-0"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex flex-col items-center gap-2 p-5 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#0D704D] hover:bg-green-50 transition group"
                                    >
                                        <div className="p-2.5 bg-gray-100 group-hover:bg-green-100 rounded-full transition">
                                            <Upload size={20} className="text-gray-400 group-hover:text-[#0D704D] transition" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium group-hover:text-[#0D704D] transition">
                                                Klik untuk upload file
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">PDF, JPG, atau PNG · Maksimal 5MB</p>
                                        </div>
                                    </button>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t flex justify-end gap-2">
                            <button onClick={() => { setShowForm(false); resetFileState(); }}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded-lg hover:bg-gray-50 transition">
                                Batal
                            </button>
                            <button onClick={handleSave} disabled={saving || uploading}
                                className="px-5 py-2 bg-[#0D704D] text-white text-sm rounded-lg hover:bg-[#0a5c3f] disabled:opacity-60 font-medium transition flex items-center gap-2">
                                {(saving || uploading) && (
                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                )}
                                {uploading ? "Mengupload..." : saving ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Portofolio"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-red-100 rounded-full">
                                <Trash2 size={18} className="text-red-600" />
                            </div>
                            <h3 className="font-bold text-gray-800">Hapus Portofolio?</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-5">Item dan file yang terlampir akan dihapus permanen dan tidak dapat dikembalikan.</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition">
                                Batal
                            </button>
                            <button onClick={() => handleDelete(deleteId)}
                                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
