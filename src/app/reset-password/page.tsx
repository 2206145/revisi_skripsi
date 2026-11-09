"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, CheckCircle, XCircle, Loader2 } from "lucide-react";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("invalid");
            return;
        }
        fetch(`/api/reset-password?token=${token}`)
            .then((r) => r.json())
            .then((d) => {
                if (d.valid) {
                    setEmail(d.email);
                    setStatus("valid");
                } else {
                    setStatus("invalid");
                }
            })
            .catch(() => setStatus("invalid"));
    }, [token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Konfirmasi password tidak cocok");
            return;
        }
        setSubmitting(true);
        const res = await fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });
        const data = await res.json();
        setSubmitting(false);
        if (res.ok) {
            setSuccess(true);
            toast.success("Password berhasil direset!");
            setTimeout(() => router.push("/login"), 2500);
        } else {
            toast.error(data.error || "Gagal mereset password");
        }
    }

    return (
        <div className="min-h-screen flex bg-green-700 overflow-hidden">
            {/* Kiri: Branding */}
            <div className="hidden md:flex flex-col items-center justify-center flex-1 relative px-16 select-none">
                <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />
                <div className="absolute bottom-[-60px] left-[60px] w-48 h-48 rounded-full bg-white/5" />
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-36 h-36 rounded-full bg-white/10 flex items-center justify-center mb-6 ring-4 ring-white/20 shadow-2xl">
                        <img src="/logo_smk.png" alt="Logo SMK" className="w-28 h-28 object-contain drop-shadow-lg" />
                    </div>
                    <h1 className="text-5xl font-black italic text-white tracking-widest drop-shadow-lg">SIMTRACER</h1>
                    <div className="w-16 h-1 bg-white/40 rounded-full my-4" />
                    <p className="text-white/80 font-medium text-base leading-relaxed">Sistem Tracer Study &amp; Bursa Kerja</p>
                    <p className="text-white font-bold text-base mt-1">SMK Bina Bhakti Mekarmukti</p>
                </div>
            </div>

            {/* Kanan: Card */}
            <div className="flex items-center justify-center flex-1 p-6 md:p-12">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <div className="bg-green-600 px-10 py-8 text-center">
                        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                        <p className="text-green-100 text-sm mt-1">Buat password baru untuk akun Anda</p>
                    </div>

                    <div className="px-10 py-8">
                        {status === "loading" && (
                            <div className="flex flex-col items-center py-8 gap-3 text-gray-500">
                                <Loader2 className="animate-spin w-8 h-8 text-green-600" />
                                <p className="text-sm">Memvalidasi link...</p>
                            </div>
                        )}

                        {status === "invalid" && (
                            <div className="flex flex-col items-center py-8 gap-4 text-center">
                                <XCircle className="w-16 h-16 text-red-400" />
                                <h3 className="text-lg font-bold text-gray-800">Link Tidak Valid</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Link reset password tidak valid atau sudah kadaluarsa.<br />
                                    Silakan minta link reset baru dari halaman login.
                                </p>
                                <a href="/login" className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
                                    Kembali ke Login
                                </a>
                            </div>
                        )}

                        {status === "valid" && !success && (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {email && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                                        <Lock size={14} className="shrink-0" />
                                        <span>Reset untuk: <strong>{email}</strong></span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Password Baru
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPass ? "text" : "password"}
                                            required
                                            minLength={6}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full border border-gray-200 bg-gray-50 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white focus:border-green-400 transition"
                                            placeholder="Minimal 6 karakter"
                                        />
                                        <button type="button" onClick={() => setShowPass(!showPass)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Konfirmasi Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showConfirm ? "text" : "password"}
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`w-full border rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 transition
                                                ${confirmPassword && confirmPassword !== password
                                                    ? "border-red-300 bg-red-50 focus:ring-red-400"
                                                    : "border-gray-200 bg-gray-50 focus:ring-green-500 focus:bg-white focus:border-green-400"}`}
                                            placeholder="Ulangi password baru"
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== password && (
                                        <p className="text-xs text-red-500 mt-1">Password tidak cocok</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-green-600 hover:bg-green-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 text-sm shadow-lg shadow-green-200 mt-2 flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <><Loader2 className="animate-spin w-4 h-4" /> Mereset...</>
                                    ) : "Simpan Password Baru"}
                                </button>
                            </form>
                        )}

                        {success && (
                            <div className="flex flex-col items-center py-8 gap-4 text-center">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                                <h3 className="text-lg font-bold text-gray-800">Password Berhasil Direset!</h3>
                                <p className="text-sm text-gray-500">Anda akan diarahkan ke halaman login...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    );
}
