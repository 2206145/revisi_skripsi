"use client";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, X, Upload, Eye, EyeOff, Info, MapPin, Loader2, FileText } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import * as XLSX from "xlsx";

const ALL_ROLES = ["ADMIN", "KEPALA_SEKOLAH", "PERUSAHAAN", "LULUSAN"];
const roleLabel: Record<string, string> = {
    ADMIN: "Admin / BKK",
    KEPALA_SEKOLAH: "Kepala Sekolah",
    LULUSAN: "Lulusan",
    PERUSAHAAN: "Mitra DUDI",
};
const roleColor: Record<string, string> = {
    ADMIN: "bg-green-100 text-green-700",
    KEPALA_SEKOLAH: "bg-indigo-100 text-indigo-700",
    LULUSAN: "bg-blue-100 text-blue-700",
    PERUSAHAAN: "bg-yellow-100 text-yellow-700",
};

const emptyForm = {
    email: "", password: "", role: "ADMIN",
    nama: "", jenisKelamin: "", noHp: "", alamat: "",
    jurusanId: "", tahunLulus: "", tahunMasuk: "",
    bidang: "", kota: "", website: "", deskripsi: "", latitude: "", longitude: ""
};

export default function UsersClient() {
    const [list, setList] = useState<any[]>([]);
    const [jurusans, setJurusans] = useState<any[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirm, setConfirm] = useState<{ type: "save" | "cancel" | "delete" | "upload"; id?: string } | null>(null);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [showImport, setShowImport] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

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
        const [data, jData] = await Promise.all([
            fetch("/api/users").then((r) => r.json()),
            fetch("/api/jurusan").then(r => r.json())
        ]);
        setList(Array.isArray(data) ? data : []);
        setJurusans(Array.isArray(jData) ? jData : []);
    }

    useEffect(() => { load(); }, []);

    async function doImport() {
        if (!selectedFile) return;
        setConfirm(null);
        setImporting(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = new Uint8Array(ev.target?.result as ArrayBuffer);
                const wb = XLSX.read(data, { type: "array" });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const rows: any[] = XLSX.utils.sheet_to_json(ws);
                let sukses = 0, gagal = 0;
                for (const row of rows) {
                    const email = row["Email"];
                    const password = row["Password"];
                    if (!email || !password) { gagal++; continue; }

                    let matchJurusanId = "";
                    if (row["Jurusan"]) {
                        const q = String(row["Jurusan"]).toLowerCase();
                        const found = jurusans.find(j => j.nama.toLowerCase() === q || j.kode?.toLowerCase() === q);
                        if (found) matchJurusanId = found.id;
                    }

                    let jk = "";
                    if (row["Jenis Kelamin"]) {
                        jk = String(row["Jenis Kelamin"]).toLowerCase() === "perempuan" ? "PEREMPUAN" : "LAKI_LAKI";
                    }

                    const res = await fetch("/api/users", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: String(email),
                            password: String(password),
                            role: "LULUSAN", // Import ini khusus lulusan sesuai request
                            nama: String(row["Nama Lengkap"] || ""),
                            jenisKelamin: jk,
                            noHp: String(row["No HP"] || ""),
                            alamat: String(row["Alamat"] || ""),
                            jurusanId: matchJurusanId || undefined,
                            tahunLulus: row["Tahun Lulus"] ? Number(row["Tahun Lulus"]) : undefined,
                            tahunMasuk: row["Tahun Masuk"] ? Number(row["Tahun Masuk"]) : undefined,
                        }),
                    });
                    if (res.ok) sukses++; else gagal++;
                }
                toast.success(`Import selesai: ${sukses} berhasil, ${gagal} gagal`);
                setShowImport(false);
                setSelectedFile(null);
                if (fileRef.current) fileRef.current.value = "";
                load();
            } catch { toast.error("File tidak valid"); }
            finally { setImporting(false); }
        };
        reader.readAsArrayBuffer(selectedFile);
    }

    function downloadTemplate() {
        const ws = XLSX.utils.aoa_to_sheet([
            ["Nama Lengkap", "Jenis Kelamin", "Jurusan", "Tahun Masuk", "Tahun Lulus", "Alamat", "No HP", "Email", "Password"],
            ["Ahmad Ginanjar", "Laki-laki", (jurusans[0]?.kode || "RPL"), "2021", "2024", "Jl Lintas Selatan No 81", "0812345678", "ahmad@lulusan.com", "rahasia123"],
            ["Siti Aisyah", "Perempuan", (jurusans[1]?.kode || "TKJ"), "2020", "2023", "Kp Garut", "0853123456", "siti@lulusan.com", "rahasia123"],
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Akun Lulusan");
        XLSX.writeFile(wb, "template_import_lulusan.xlsx");
    }

    async function doSave() {
        // Prepare payload containing all form fields
        const payload: any = { ...form };
        if (payload.role !== "LULUSAN") {
            delete payload.jurusanId;
            delete payload.tahunLulus;
            delete payload.tahunMasuk;
            delete payload.jenisKelamin;
        } else {
            if (payload.tahunLulus) payload.tahunLulus = parseInt(payload.tahunLulus);
            if (payload.tahunMasuk) payload.tahunMasuk = parseInt(payload.tahunMasuk);
        }

        if (editId) {
            const res = await fetch(`/api/users/${editId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) { toast.error("Gagal memperbarui akun"); setConfirm(null); return; }
            toast.success("Akun diperbarui");
        } else {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error || "Gagal membuat akun");
                setConfirm(null);
                return;
            }
            toast.success("Akun ditambahkan");
        }
        setShowModal(false); setForm(emptyForm); setEditId(null); setConfirm(null); setShowPassword(false); load();
    }

    async function doDelete(id: string) {
        await fetch(`/api/users/${id}`, { method: "DELETE" });
        toast.success("Akun dihapus"); setConfirm(null); load();
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editId) {
            if (form.role === "LULUSAN" && !form.nama.trim()) { toast.error("Nama lengkap wajib diisi"); return; }
        }
        setConfirm({ type: "save" });
    }

    function openEdit(item: any) {
        setForm({
            ...emptyForm,
            email: item.email,
            password: "",
            role: item.role,
            nama: item.role === "LULUSAN" ? item.lulusan?.nama : item.role === "PERUSAHAAN" ? item.perusahaan?.nama : item.nama,
            jenisKelamin: item.lulusan?.jenisKelamin || "",
            noHp: item.role === "LULUSAN" ? item.lulusan?.noHp : item.role === "PERUSAHAAN" ? item.perusahaan?.telepon : item.noHp,
            alamat: item.role === "LULUSAN" ? item.lulusan?.alamat : item.role === "PERUSAHAAN" ? item.perusahaan?.alamat : item.alamat,
            jurusanId: item.lulusan?.jurusanId || "",
            tahunLulus: item.lulusan?.tahunLulus ? String(item.lulusan.tahunLulus) : "",
            tahunMasuk: item.lulusan?.tahunMasuk ? String(item.lulusan.tahunMasuk) : "",
            bidang: item.perusahaan?.bidang || "",
            kota: item.perusahaan?.kota || "",
            website: item.perusahaan?.website || "",
            deskripsi: item.perusahaan?.deskripsi || "",
            latitude: item.perusahaan?.latitude || "",
            longitude: item.perusahaan?.longitude || "",
        });
        setEditId(item.id);
        setShowPassword(false);
        setShowModal(true);
    }

    const filtered = list.filter((u) => {
        const matchRole = filterRole ? u.role === filterRole : true;
        const matchSearch = !search ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            roleLabel[u.role]?.toLowerCase().includes(search.toLowerCase()) ||
            (u.lulusan?.nama || u.perusahaan?.nama || u.nama || "").toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    const isLulusan = form.role === "LULUSAN";

    return (
        <div>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => { setForm(emptyForm); setEditId(null); setShowPassword(false); setShowModal(true); }}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 text-sm">
                    <Plus size={16} /> Tambah Akun
                </button>
                <button onClick={() => setShowImport(true)}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm">
                    <Upload size={16} /> Import Akun Lulusan
                </button>
                <div className="ml-auto flex items-center gap-2">
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Semua Jabatan</option>
                        {ALL_ROLES.map((r) => <option key={r} value={r}>{roleLabel[r]}</option>)}
                    </select>
                    <input type="text" placeholder="Cari email, nama..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-56" />
                </div>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-xl shadow overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            {["No", "ID", "Email", "Jabatan", "Nama", "No HP", "Alamat", "Tanggal Dibuat", "Aksi"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((item, i) => (
                            <tr key={item.id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {String(item.nomorId ?? 0).padStart(5, "0")}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{item.email}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColor[item.role]}`}>
                                        {roleLabel[item.role] || item.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{item.role === "LULUSAN" ? item.lulusan?.nama : item.role === "PERUSAHAAN" ? item.perusahaan?.nama : item.nama || "—"}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{item.role === "LULUSAN" ? item.lulusan?.noHp : item.role === "PERUSAHAAN" ? item.perusahaan?.telepon : item.noHp || "—"}</td>
                                <td className="px-4 py-3 max-w-[150px] truncate" title={item.role === "LULUSAN" ? item.lulusan?.alamat : item.role === "PERUSAHAAN" ? item.perusahaan?.alamat : item.alamat || ""}>{item.role === "LULUSAN" ? item.lulusan?.alamat : item.role === "PERUSAHAAN" ? item.perusahaan?.alamat : item.alamat || "—"}</td>
                                <td className="px-4 py-3 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString("id-ID")}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">

                                        <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit"><Pencil size={16} /></button>
                                        <button onClick={() => setConfirm({ type: "delete", id: item.id })} className="text-red-500 hover:text-red-700" title="Hapus"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Tambah/Edit */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="font-bold text-lg">{editId ? "Edit Akun" : "Tambah Akun"}</h2>
                            <button onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <div className="overflow-y-auto flex-1 px-6 py-4">
                            <form id="user-form" onSubmit={handleSubmit} className="space-y-3">

                                {/* Pilih Jabatan dulu (hanya saat tambah baru) */}
                                {!editId && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Jabatan / Status Pengguna</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ALL_ROLES.map((r) => (
                                                <button key={r} type="button"
                                                    onClick={() => setForm({ ...emptyForm, role: r })}
                                                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition ${form.role === r
                                                        ? "border-green-600 bg-green-50 text-green-700"
                                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                                        }`}>
                                                    {roleLabel[r]}
                                                </button>
                                            ))}
                                        </div>
                                        <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${roleColor[form.role] ?? ""}`}>
                                            {isLulusan
                                                ? "Isi identitas lulusan: nama, jenis kelamin, alamat, no HP, dan data akun."
                                                : form.role === "PERUSAHAAN"
                                                    ? "Isi nama perusahaan dan data akun (email & password)."
                                                    : "Isi nama lengkap, no HP, alamat, dan data akun (email & password)."}
                                        </div>
                                    </div>
                                )}

                                <hr />

                                {/* Identitas — semua role */}
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {isLulusan ? "Data Identitas Lulusan" : form.role === "PERUSAHAAN" ? "Data Perusahaan" : "Data Identitas"}
                                </p>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {form.role === "PERUSAHAAN" ? "Nama Perusahaan" : "Nama Lengkap"} {!editId && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        value={form.nama}
                                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                        required={!editId}
                                        placeholder={form.role === "PERUSAHAAN" ? "PT. Contoh Perusahaan" : "Nama lengkap..."}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                {/* Jenis Kelamin — khusus Lulusan */}
                                {isLulusan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                        <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="">Pilih jenis kelamin</option>
                                            <option value="Laki-laki">Laki-laki</option>
                                            <option value="Perempuan">Perempuan</option>
                                        </select>
                                    </div>
                                )}

                                {isLulusan && (
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jurusan</label>
                                            <select value={form.jurusanId} onChange={(e) => setForm({ ...form, jurusanId: e.target.value })}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                                                <option value="">Pilih jurusan</option>
                                                {jurusans.map(j => (
                                                    <option value={j.id} key={j.id}>{j.nama}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus</label>
                                            <input type="number" value={form.tahunLulus}
                                                onChange={(e) => setForm({ ...form, tahunLulus: e.target.value })}
                                                placeholder="Contoh: 2024"
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Masuk</label>
                                            <input type="number" value={form.tahunMasuk}
                                                onChange={(e) => setForm({ ...form, tahunMasuk: e.target.value })}
                                                placeholder="Contoh: 2021"
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                        </div>
                                    </div>
                                )}

                                {/* Bidang Usaha - khusus Perusahaan */}
                                {form.role === "PERUSAHAAN" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Usaha</label>
                                        <input value={form.bidang} onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                                            placeholder="Contoh: Teknologi, Pertanian, dll"
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                    <input value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                                        placeholder="Alamat lengkap..."
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>

                                {form.role === "PERUSAHAAN" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                                        <input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })}
                                            placeholder="Kota..."
                                            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{form.role === "PERUSAHAAN" ? "Telepon" : "No HP"}</label>
                                    <input value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                                        placeholder="08xx-xxxx-xxxx"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>

                                {form.role === "PERUSAHAAN" && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                        </div>
                                        <div className="border border-green-100 bg-green-50 rounded-xl p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-semibold text-green-800 flex items-center gap-1">
                                                    <MapPin size={15} /> Koordinat Lokasi
                                                </span>
                                                <button type="button" onClick={handleGetLocation} disabled={gettingLocation}
                                                    className="flex items-center gap-1.5 text-xs bg-green-700 text-white px-3 py-1.5 rounded-lg hover:bg-green-800 disabled:opacity-60 transition-colors">
                                                    {gettingLocation ? <><Loader2 size={12} className="animate-spin" /> Mengambil Lokasi...</> : <><MapPin size={12} /> Gunakan Lokasi Terkini</>}
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                                                    <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.9147..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                                                    <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="107.6122..." className="w-full border rounded-lg px-3 py-2 text-sm bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                            <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} rows={3}
                                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                        </div>
                                    </>
                                )}

                                <hr />
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Data Akun</p>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password {editId && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                                        {!editId && <span className="text-red-500"> *</span>}
                                    </label>
                                    <div className="relative">
                                        <input type={showPassword ? "text" : "password"} value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required={!editId}
                                            className="w-full border rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="px-6 py-4 border-t flex gap-2">
                            <button form="user-form" type="submit" className="flex-1 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 font-medium">Simpan</button>
                            <button type="button" onClick={() => setConfirm({ type: "cancel" })} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Batal</button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog open={confirm?.type === "upload"} title="Konfirmasi Import Excel"
                message={`Apakah Anda yakin ingin mengimport akun dari file "${selectedFile?.name}"?`}
                confirmLabel="Ya, Import" onConfirm={doImport} onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "save"} title={editId ? "Konfirmasi Perubahan" : "Konfirmasi Tambah Akun"}
                message={editId ? "Apakah Anda yakin ingin menyimpan perubahan akun ini?" : "Apakah Anda yakin ingin menambahkan akun baru ini?"}
                confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "cancel"} title="Batalkan?" message="Data yang sudah diisi akan hilang."
                confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={() => { setConfirm(null); setShowModal(false); setForm(emptyForm); setEditId(null); }}
                onCancel={() => setConfirm(null)} />
            <ConfirmDialog open={confirm?.type === "delete"} title="Hapus Akun?" message="Akun ini akan dihapus permanen beserta semua data terkait."
                confirmLabel="Ya, Hapus" confirmColor="bg-red-600 hover:bg-red-700"
                onConfirm={() => doDelete(confirm!.id!)} onCancel={() => setConfirm(null)} />

            {/* Modal Import */}
            {showImport && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center px-6 py-4 border-b">
                            <h2 className="font-bold text-lg">Import Data Akun</h2>
                            <button onClick={() => setShowImport(false)}><X size={20} /></button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                                <p className="font-medium mb-1">Format kolom Excel:</p>
                                <p>email | password | role | nama | jenisKelamin | noHp | alamat</p>
                                <p className="mt-1 text-xs">Role valid: ADMIN, KEPALA_SEKOLAH, LULUSAN, PERUSAHAAN</p>
                            </div>
                            <button onClick={downloadTemplate} className="text-sm text-purple-700 hover:underline">📥 Download Template Excel</button>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File Excel (.xlsx)</label>
                                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={importing}
                                    className="w-full border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-700 file:text-white file:text-sm cursor-pointer" />
                            </div>
                            {selectedFile && <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">File: <span className="font-medium">{selectedFile.name}</span></div>}
                            {importing && <p className="text-sm text-gray-500 text-center">Sedang mengimport...</p>}
                        </div>
                        <div className="px-6 py-4 border-t flex gap-2">
                            <button onClick={() => { if (selectedFile) setConfirm({ type: "upload" }); else toast.error("Pilih file terlebih dahulu"); }}
                                disabled={importing || !selectedFile}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 text-sm font-medium disabled:opacity-50">
                                <Upload size={15} /> Upload & Import
                            </button>
                            <button onClick={() => { setShowImport(false); setSelectedFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                                className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
