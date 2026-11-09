"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, X } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ProfileLulusanClient({ lulusan, userEmail }: { lulusan: any; userEmail: string }) {
  const [form, setForm] = useState({ email: userEmail, noHp: lulusan?.noHp || "", alamat: lulusan?.alamat || "" });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [confirm, setConfirm] = useState<"save" | "cancel" | null>(null);

  async function doSave() {
    setConfirm(null);
    setLoading(true);
    const res = await fetch(`/api/lulusan/${lulusan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nis: lulusan.nis, nama: lulusan.nama,
        jurusanId: lulusan.jurusanId, tahunLulus: lulusan.tahunLulus,
        noHp: form.noHp, alamat: form.alamat, email: form.email,
      }),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Gagal menyimpan profil"); return; }
    toast.success("Profil berhasil diperbarui");
    setIsEdit(false);
  }

  const fieldCls = "w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500";
  const disabledCls = "w-full border rounded-lg px-3 py-1.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700">Informasi Akun</h2>
        {!isEdit ? (
          <button onClick={() => setIsEdit(true)}
            className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium">
            <Pencil size={14} /> Edit Profil
          </button>
        ) : (
          <button onClick={() => setConfirm("cancel")}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
            <X size={14} /> Batal
          </button>
        )}
      </div>


      <div className="space-y-3 text-sm">
        {/* Email — editable saat edit mode */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 w-1/4">Email</span>
          {isEdit ? (
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`${fieldCls} w-3/4`} />
          ) : (
            <span className="w-3/4 text-gray-700">{userEmail}</span>
          )}
        </div>

        {/* No HP */}
        <div className="flex justify-between items-center">
          <span className="text-gray-500 w-1/4">No HP</span>
          {isEdit ? (
            <input value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })}
              className={`${fieldCls} w-3/4`} />
          ) : (
            <span className="w-3/4 text-gray-700">{lulusan.noHp || "-"}</span>
          )}
        </div>

        {/* Alamat */}
        <div className="flex justify-between items-start">
          <span className="text-gray-500 w-1/4 pt-1">Alamat</span>
          {isEdit ? (
            <textarea rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              className={`${fieldCls} w-3/4`} />
          ) : (
            <span className="w-3/4 text-gray-700">{lulusan.alamat || "-"}</span>
          )}
        </div>

        {isEdit && (
          <div className="flex justify-end pt-2">
            <button onClick={() => setConfirm("save")} disabled={loading}
              className="bg-green-700 text-white px-5 py-2 rounded-lg text-sm hover:bg-green-800 disabled:opacity-60 font-medium">
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog open={confirm === "save"} title="Simpan Perubahan?"
        message="Apakah Anda yakin ingin menyimpan perubahan profil ini?"
        confirmLabel="Ya, Simpan" onConfirm={doSave} onCancel={() => setConfirm(null)} />
      <ConfirmDialog open={confirm === "cancel"} title="Batalkan Perubahan?"
        message="Perubahan yang belum disimpan akan hilang."
        confirmLabel="Ya, Batalkan" confirmColor="bg-red-600 hover:bg-red-700"
        onConfirm={() => { setConfirm(null); setIsEdit(false); setForm({ email: userEmail, noHp: lulusan.noHp || "", alamat: lulusan.alamat || "" }); }}
        onCancel={() => setConfirm(null)} />
    </div>
  );
}
