import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

// Fetch data publik dari DB untuk ditampilkan di landing page
async function getPublicData() {
  try {
    const [totalLulusan, totalPerusahaan, totalLowongan, pengaturan] =
      await Promise.all([
        prisma.lulusan.count(),
        prisma.perusahaan.count(),
        prisma.lowongan.count({ where: { isActive: true } }),
        prisma.pengaturan.findUnique({ where: { id: "1" } }),
      ]);
    return { totalLulusan, totalPerusahaan, totalLowongan, pengaturan };
  } catch {
    return {
      totalLulusan: 0,
      totalPerusahaan: 0,
      totalLowongan: 0,
      pengaturan: null,
    };
  }
}

export default async function LandingPage() {
  const { totalLulusan, totalPerusahaan, totalLowongan, pengaturan } =
    await getPublicData();

  const stats = [
    { label: "Data Lulusan", value: totalLulusan, icon: Users, suffix: "+" },
    { label: "Mitra Perusahaan", value: totalPerusahaan, icon: Building2, suffix: "+" },
    { label: "Lowongan Aktif", value: totalLowongan, icon: Briefcase, suffix: "" },
  ];

  const features = [
    {
      icon: GraduationCap,
      title: "Tracer Study",
      desc: "Pantau status karir lulusan secara real-time. Lulusan dapat mengisi data pekerjaan, kuliah, atau wirausaha.",
      color: "from-[#0D704D] to-emerald-600",
    },
    {
      icon: Briefcase,
      title: "Bursa Kerja (BKK)",
      desc: "Hubungkan lulusan dengan perusahaan mitra. Cari lowongan dan hubungi langsung perusahaan melalui kontak yang tersedia di sistem.",
      color: "from-teal-600 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Analitik & Laporan",
      desc: "Dashboard visual dengan grafik karir lulusan. Unduh laporan untuk keperluan sekolah.",
      color: "from-green-600 to-[#0D704D]",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white border-2 border-[#0D704D] rounded-xl flex items-center justify-center flex-shrink-0 shadow overflow-hidden">
              <img src={pengaturan?.logoUrl || "/logo_smk.png"} alt="SMK" className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-[#0D704D] tracking-tight">SIMTRACER</p>
              <p className="text-[10px] text-gray-400 hidden sm:block">SMK Bina Bhakti Mekarmukti</p>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#0D704D] hover:bg-[#0a5a3e] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-[#0D704D]/20 active:scale-95"
          >
            Login
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.035]"
            style={{ backgroundImage: "radial-gradient(#0D704D 0.8px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-[#0D704D]/8 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#0D704D]/8 text-[#0D704D] border border-[#0D704D]/20 px-4 py-1.5 rounded-full text-xs font-bold mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D704D] animate-pulse" />
            Sistem Informasi Resmi BKK
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
            {pengaturan?.heroTitle || (
              <>
                Sistem Informasi{" "}
                <span className="text-[#0D704D]">Tracer Study</span>
                {" "}&amp; Bursa Kerja
              </>
            )}
          </h1>

          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10 whitespace-pre-line">
            {pengaturan?.heroDesc || "Platform digital resmi SMK Bina Bhakti Mekarmukti untuk tracer study lulusan, pengelolaan lowongan kerja, dan analitik karir lulusan."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-[#0D704D] hover:bg-[#0a5a3e] text-white font-bold px-8 py-4 rounded-2xl text-base transition-all shadow-xl shadow-[#0D704D]/20 active:scale-95"
            >
              Masuk ke Sistem
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-14 bg-[#0D704D]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {stats.map(({ label, value, icon: Icon, suffix }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-white">
                  {value}{suffix}
                </p>
                <p className="text-white/70 text-xs sm:text-sm mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Layanan
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-[#0D704D] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(white 0.8px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
            <TrendingUp size={28} className="text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Siap menggunakan sistem?
          </h2>
          <p className="text-white/75 mb-8 text-base leading-relaxed">
            Login menggunakan akun yang telah diberikan oleh Admin BKK SMK Bina Bhakti Mekarmukti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-white text-[#0D704D] font-extrabold px-8 py-4 rounded-2xl text-base hover:bg-gray-50 transition-all shadow-xl active:scale-95"
            >
              Login Sekarang
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-white/60 text-xs">
            {[
              "Admin BKK",
              "Lulusan",
              "Perusahaan Mitra",
              "Kepala Sekolah",
            ].map((role) => (
              <span key={role} className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-white/50" />
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-white border-2 border-[#0D704D] rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={pengaturan?.logoUrl || "/logo_smk.png"} alt="SMK" className="w-8 h-8 object-contain" />
                </div>
                <p className="text-white font-extrabold text-sm">SIMTRACER</p>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                Sistem Informasi Tracer Study dan Bursa Kerja Khusus<br />
                SMK Bina Bhakti Mekarmukti
              </p>
            </div>
            {/* Kontak */}
            <div>
              <p className="text-white font-bold text-sm mb-3">Kontak BKK</p>
              <div className="space-y-2 text-xs">
                {pengaturan?.alamat && (
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-[#0D704D] mt-0.5 flex-shrink-0" />
                    <span>{pengaturan.alamat}</span>
                  </div>
                )}
                {pengaturan?.telepon && (
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#0D704D] flex-shrink-0" />
                    <span>{pengaturan.telepon}</span>
                  </div>
                )}
                {pengaturan?.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-[#0D704D] flex-shrink-0" />
                    <span>{pengaturan.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} SMK Bina Bhakti Mekarmukti — BKK. Hak cipta dilindungi.
          </div>
        </div>
      </footer>

    </div>
  );
}
