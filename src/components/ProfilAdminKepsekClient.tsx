"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Pencil, X, KeyRound, User, Mail, Shield } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
    userId: string;
    nomorId?: number | null;
    userEmail: string;
    userRole: string;
}

const roleLabel: Record<string, string> = {
    ADMIN: "Admin / BKK",
    KEPALA_SEKOLAH: "Kepala Sekolah",
};
const roleColor: Record<string, string> = {
    ADMIN: "bg-green-100 text-green-700",
    KEPALA_SEKOLAH: "bg-indigo-100 text-indigo-700",
};

function FieldRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
            <div className="w-5 mt-0.5 text-gray-400 shrink-0">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-800">{value || <span className="text-gray-400 italic">—</span>}</p>
            </div>
        </div>
    );
}

export default function ProfilAdminKepsekClient({ userId, nomorId, userEmail, userRole }: Props) {
    const { update } = useSession();

    // Profil form state
    const [isEdit, setIsEdit] = useState(false);
    const [profile, setProfile] = useState({
        nama: "",
        noHp: "",
        alamat: "",
        email: userEmail
    });
    const [loading, setLoading] = useState(false);
    const [confirmSave, setConfirmSave] = useState(false);

    // Initial load for extra info

    useEffect(() => {
        fetch('/api/users').then(r => r.json()).then(data => {
            const me = data.find((u: any) => u.id === userId);
            if (me) {
                setProfile({
                    nama: me.nama || "",
                    noHp: me.noHp || "",
                    alamat: me.alamat || "",
                    email: me.email || userEmail
                });
            }
        });
    }, [userId]);

    // ── Simpan Profil ────────────────────────────────────────────────
    async function doSaveProfile() {
        setConfirmSave(false);
        setLoading(true);
        const res = await fetch(`/api/users/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...profile, role: userRole }),
        });
        setLoading(false);
        if (!res.ok) { toast.error("Gagal memperbarui profil"); return; }
        toast.success("Profil berhasil diperbarui");
        if (profile.email !== userEmail) await update({ email: profile.email });
        setIsEdit(false);
    }

    const fieldCls = "w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

    return (
        <div className="max-w-2xl space-y-6">

            {/* ── KARTU IDENTITAS ── */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                            <User size={32} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">{profile.nama || userEmail}</h2>
                            <span className={`text-xs font-medium px-2.5 py-1 flex w-[fit-content] rounded-full ${roleColor[userRole] || "bg-gray-100 text-gray-600"}`}>
                                {roleLabel[userRole] || userRole}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <FieldRow label="ID Pengguna" value={nomorId ? String(nomorId).padStart(5, "0") : String(0).padStart(5, "0")} icon={<Shield size={14} />} />
                    <FieldRow label="Jabatan" value={roleLabel[userRole] || userRole} icon={<User size={14} />} />
                    <FieldRow label="Email Aktif" value={profile.email} icon={<Mail size={14} />} />
                </div>
            </div>

            {/* ── UBAH PROFIL ── */}
            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <User size={16} className="text-green-700" /> Profil Pengguna
                    </h3>
                    {!isEdit ? (
                        <button onClick={() => setIsEdit(true)}
                            className="flex items-center gap-1 text-sm text-green-700 hover:text-green-900 font-medium">
                            <Pencil size={14} /> Edit
                        </button>
                    ) : (
                        <button onClick={() => setIsEdit(false)}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                            <X size={14} /> Batal
                        </button>
                    )}
                </div>

                {!isEdit ? (
                    <div className="space-y-4">
                        <DetailRow label="Nama Lengkap" value={profile.nama} />
                        <DetailRow label="No HP" value={profile.noHp} />
                        <DetailRow label="Alamat Lengkap" value={profile.alamat} />
                        <DetailRow label="Email" value={profile.email} />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Nama Lengkap</label>
                            <input type="text" value={profile.nama} onChange={(e) => setProfile({ ...profile, nama: e.target.value })} className={fieldCls} placeholder="Contoh: Budi Santoso" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">No HP</label>
                            <input type="text" value={profile.noHp} onChange={(e) => setProfile({ ...profile, noHp: e.target.value })} className={fieldCls} placeholder="08xx-xxxx-xxxx" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Alamat Lengkap</label>
                            <input type="text" value={profile.alamat} onChange={(e) => setProfile({ ...profile, alamat: e.target.value })} className={fieldCls} placeholder="Alamat lengkap Anda" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className={fieldCls} />
                        </div>
                        <div className="flex justify-end pt-2">
                            <button onClick={() => setConfirmSave(true)} disabled={loading || !profile.email}
                                className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-60 font-medium">
                                {loading ? "Menyimpan..." : "Simpan Profil"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog open={confirmSave} title="Simpan Perubahan?"
                message="Apakah Anda yakin ingin menyimpan perubahan pada profil ini?"
                confirmLabel="Ya, Simpan" onConfirm={doSaveProfile} onCancel={() => setConfirmSave(false)} />
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500 w-36 shrink-0">{label}</span>
            <span className="text-xs font-medium text-gray-800 break-all">{value || <span className="text-gray-400 italic">—</span>}</span>
        </div>
    );
}
