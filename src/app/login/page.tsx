"use client";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // State forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { ...form, redirect: false });
    if (res?.error) {
      setLoading(false);
      toast.error("Email atau password salah");
    } else {
      sessionStorage.setItem("hasBrowserSession", "true");
      // Dapatkan data session untuk mengetahui role
      const session = await getSession();
      const role = (session?.user as any)?.role;
      const roleDashboard: Record<string, string> = {
        ADMIN: "/admin",
        LULUSAN: "/lulusan",
        PERUSAHAAN: "/perusahaan",
        KEPALA_SEKOLAH: "/kepala-sekolah",
      };
      const targetUrl = (role && roleDashboard[role]) || "/admin";
      window.location.href = targetUrl;
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) { toast.error("Masukkan email Anda"); return; }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotSent(true);
      } else {
        toast.error(data.error || "Gagal mengirim email");
      }
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setForgotLoading(false);
    }
  }

  function closeForgotModal() {
    setShowForgotModal(false);
    setForgotEmail("");
    setForgotSent(false);
    setForgotLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#fafafa]">

      {/* ── BACKGROUND LUXURY DOT & GLOW ── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#0D704D 0.7px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        {/* Ambient Glows */}
        <div className="absolute inset-0 bg-white/70"></div>
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#0D704D]/10 blur-[120px] opacity-80 animate-pulse mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#0D704D]/10 blur-[100px] opacity-70 mix-blend-multiply" />
      </div>

      <div className="w-full max-w-[1040px] md:min-h-[600px] flex flex-col md:flex-row bg-white/80 backdrop-blur-3xl border border-[#0D704D]/10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(13,112,77,0.15)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-700 relative ring-1 ring-black/5">

        {/* ── KIRI: BRANDING (WARNA KUSTOM #0D704D) ── */}
        <div className="relative hidden md:flex flex-col items-center justify-center w-[45%] bg-[#0D704D] p-12 text-center overflow-hidden">
          {/* Inner Glow / Gradient over the solid color */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>

          {/* Ornamen Garis Halus */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.15] transform translate-x-1/3 -translate-y-1/3">
            <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="#FFFFFF" strokeWidth="1" d="M42.7,-68.8C55.4,-61,65.7,-48.5,74.5,-34.5C83.3,-20.5,90.6,-5.1,88.7,9.6C86.7,24.3,75.4,38.1,64.2,50.7C53,63.3,42,74.6,28.2,80C14.4,85.4,-2.2,84.9,-16.9,79.5C-31.6,74.2,-44.4,63.9,-55.8,52C-67.2,40.1,-77.2,26.5,-82,10.6C-86.8,-5.3,-86.3,-23.5,-78.3,-38C-70.3,-52.5,-54.7,-63.3,-40.4,-70.3C-26,-77.3,-13,-80.4,1.2,-82.1C15.4,-83.8,30.8,-76.6,42.7,-68.8Z" transform="translate(100 100)" /></svg>
          </div>
          <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full border border-white/20"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-64 h-64 rounded-full border border-white/10"></div>

          {/* Konten Branding */}
          <div className="relative z-10 w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-10 border border-white/20 shadow-2xl shadow-black/20 transform transition-transform hover:scale-105 duration-500">
            <img src="/logo_smk.png" alt="Logo SMK" className="w-[85px] h-[85px] object-contain drop-shadow-2xl" />
          </div>

          <h1 className="relative z-10 text-[2.5rem] leading-none font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
            SIMTRACER
          </h1>
          <p className="relative z-10 text-white/80 text-[13px] leading-relaxed mb-12 max-w-[260px] font-medium">
            Sistem Informasi Keterserapan Lulusan & Bursa Kerja Khusus
            SMK Bina Bhakti Mekarmukti.
          </p>


        </div>

        {/* ── KANAN: FORM LOGIN ── */}
        <div className="w-full md:w-[55%] p-8 sm:p-14 flex flex-col justify-center bg-white/50 backdrop-blur-sm relative">

          {/* Logo Mobile */}
          <div className="md:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-[#0D704D] rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-[#0D704D]/30 border border-[#0D704D]/20">
              <img src="/logo_smk.png" alt="Logo SMK" className="w-14 h-14 object-contain brightness-0 invert" />
            </div>
            <h1 className="text-3xl font-extrabold text-[#0D704D] tracking-tight">SIMTRACER</h1>
          </div>

          {/* Wrapper Form agar tidak merenggang terlalu lebar */}
          <div className="w-full max-w-[380px] mx-auto">
            <div className="mb-8 text-left">
              <h2 className="text-3xl md:text-[2rem] font-extrabold text-gray-900 tracking-tight mb-2">Selamat Datang</h2>
              <p className="text-gray-500 font-medium text-[14px]">Silakan masuk untuk melanjutkan akses ke sistem.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Input Username */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 ml-1 uppercase tracking-widest">Email / Username</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0D704D] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </span>
                  <input
                    type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-white border border-gray-200/80 rounded-xl pl-11 pr-4 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-[3px] focus:ring-[#0D704D]/15 focus:border-[#0D704D] transition-all shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={() => setShowForgotModal(true)} className="text-[13px] font-bold text-[#0D704D] hover:text-[#0a5238] transition-colors">
                    Lupa Password?
                  </button>
                </div>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0D704D] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </span>
                  <input
                    type={showPass ? "text" : "password"} required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-white border border-gray-200/80 rounded-xl pl-11 pr-11 py-3 text-[14px] font-semibold text-gray-900 focus:outline-none focus:ring-[3px] focus:ring-[#0D704D]/15 focus:border-[#0D704D] transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D704D] transition-colors p-1">
                    {showPass
                      ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#0D704D] hover:bg-[#0a5238] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 text-[14px] shadow-md hover:shadow-lg mt-6 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5 text-white/80" />
                    Login...
                  </>
                ) : "Login"}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* ── MODAL LUPA PASSWORD ── */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-[420px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-white/40 relative">

            {/* Hiasan background atas modal */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0D704D]/5 to-transparent pointer-events-none" />

            <div className="p-8 sm:p-10 relative z-10">
              <div className="w-16 h-16 bg-[#0D704D]/10 text-[#0D704D] rounded-[1.25rem] flex items-center justify-center mb-6 shadow-sm border border-[#0D704D]/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Reset Password</h3>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                    Masukkan email Anda. Kami akan mengirimkan tautan reset yang berlaku selama 1 jam.
                  </p>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></svg>
                    </span>
                    <input
                      type="email" required value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full border border-gray-200 bg-gray-50/80 rounded-[1.25rem] pl-12 pr-4 py-4 placeholder:text-gray-400 text-[15px] font-semibold focus:outline-none focus:ring-[3px] focus:ring-[#0D704D]/15 focus:border-[#0D704D] focus:bg-white transition-all shadow-sm"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button type="submit" disabled={forgotLoading}
                      className="flex-1 bg-[#0D704D] hover:bg-[#0a5238] active:scale-[0.98] text-white font-bold py-4 rounded-[1.25rem] transition disabled:opacity-70 text-[15px] flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(13,112,77,0.25)] order-2 sm:order-1">
                      {forgotLoading ? <><Loader2 className="animate-spin w-4 h-4" /> Memproses...</> : "Kirim Tautan"}
                    </button>
                    <button type="button" onClick={closeForgotModal}
                      className="w-full sm:w-auto sm:min-w-[120px] bg-white hover:bg-gray-50 text-gray-600 font-bold py-4 rounded-[1.25rem] transition text-[15px] border border-gray-200 order-1 sm:order-2">
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-20 h-20 bg-[#0D704D]/10 text-[#0D704D] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#0D704D]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  </div>
                  <h4 className="text-2xl font-extrabold text-gray-900 tracking-tight">Email Terkirim!</h4>
                  <p className="text-[14px] text-gray-500 font-medium leading-relaxed">
                    Instruksi reset telah dikirim ke <strong>{forgotEmail}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                  </p>
                  <button onClick={closeForgotModal}
                    className="w-full bg-[#0D704D] hover:bg-[#0a5238] active:scale-[0.98] text-white font-bold py-4 rounded-[1.25rem] transition mt-6 text-[15px] shadow-[0_4px_15px_rgba(13,112,77,0.25)]">
                    Siap, Kembali Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
