"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, Briefcase, Building2,
  Mail, Map, ChevronRight, ShieldCheck, BookOpen, Menu, X,
  PanelLeftClose, PanelLeftOpen, Settings
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Kelola Akun", href: "/admin/users", icon: <ShieldCheck size={18} /> },
  { label: "Kelola Jurusan", href: "/admin/jurusan", icon: <BookOpen size={18} /> },
  { label: "Tracer Study", href: "/admin/tracer-study", icon: <FileText size={18} /> },
  { label: "Perusahaan", href: "/admin/perusahaan", icon: <Building2 size={18} /> },
  { label: "Lowongan Kerja", href: "/admin/lowongan", icon: <Briefcase size={18} /> },
  { label: "Kirim Pesan", href: "/admin/notifikasi", icon: <Mail size={18} /> },
  { label: "Pengaturan Sistem", href: "/admin/pengaturan", icon: <Settings size={18} /> },
];

const lulusanNav: NavItem[] = [
  { label: "Dashboard", href: "/lulusan", icon: <LayoutDashboard size={18} /> },
  { label: "Tracer Study", href: "/lulusan/tracer-study", icon: <FileText size={18} /> },
  { label: "Lowongan Kerja", href: "/lulusan/lowongan", icon: <Briefcase size={18} /> },
];

const perusahaanNav: NavItem[] = [
  { label: "Dashboard", href: "/perusahaan", icon: <LayoutDashboard size={18} /> },
  { label: "Lowongan Saya", href: "/perusahaan/lowongan", icon: <Briefcase size={18} /> },
  { label: "Cari Kandidat", href: "/perusahaan/lulusan", icon: <Users size={18} /> },
];

const kepsekNav: NavItem[] = [
  { label: "Dashboard", href: "/kepala-sekolah", icon: <LayoutDashboard size={18} /> },
];

const navMap: Record<string, NavItem[]> = {
  admin: adminNav,
  lulusan: lulusanNav,
  perusahaan: perusahaanNav,
  "kepala-sekolah": kepsekNav,
};

const roleLabel: Record<string, string> = {
  admin: "Admin / BKK",
  lulusan: "Lulusan",
  perusahaan: "Mitra DUDI",
  "kepala-sekolah": "Kepala Sekolah",
};

const theme = {
  default: {
    bg: "bg-green-800",
    header: "bg-emerald-950",
    headerBorder: "border-emerald-900",
    logoRing: "border-emerald-400",
    labelColor: "text-emerald-300",
    activeItem: "bg-green-600 text-white",
    hoverItem: "text-green-200 hover:bg-green-700 hover:text-white",
    textColor: "text-green-200",
    toggleBtn: "bg-green-700 hover:bg-green-600",
  },
};

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);   // untuk mobile overlay
  const [collapsed, setCollapsed] = useState(false);      // untuk desktop collapse
  const [logoUrl, setLogoUrl] = useState("/logo_smk.png");

  const nav = navMap[role] || [];
  const t = theme.default;

  // Fetch logo dynamically
  useEffect(() => {
    fetch("/api/pengaturan")
      .then((res) => res.json())
      .then((data) => {
        if (data?.logoUrl) setLogoUrl(data.logoUrl);
      })
      .catch(() => { });
  }, []);

  // Tutup mobile sidebar saat pindah rute
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ── MOBILE: Tombol Hamburger Floating ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-green-600 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(22,163,74,0.4)] hover:scale-105 active:scale-95 transition-transform"
      >
        <Menu size={24} />
      </button>

      {/* ── MOBILE: Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[70] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[80] h-screen flex flex-col flex-shrink-0
          transition-all duration-300 ease-in-out
          shadow-2xl md:shadow-none overflow-hidden
          ${t.bg} text-white
          ${collapsed ? "md:w-[68px]" : "md:w-64"}
          w-64
          md:sticky md:top-0 md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Tombol Tutup — Mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 p-1.5 rounded-full z-50"
        >
          <X size={20} />
        </button>

        {/* ── Header ── */}
        <div className={`p-5 border-b ${t.headerBorder} flex items-center gap-3 ${t.header} flex-shrink-0 overflow-hidden`}>
          <img
            src={logoUrl}
            alt="Logo SMK"
            className={`w-10 h-10 object-contain rounded-full border-2 ${t.logoRing} flex-shrink-0 bg-white p-0.5`}
          />
          <div className={`transition-all duration-300 overflow-hidden ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
            <h2 className="font-bold text-sm leading-tight text-white whitespace-nowrap">SMK Bina Bhakti</h2>
            <p className={`text-xs mt-0.5 ${t.labelColor} whitespace-nowrap`}>{roleLabel[role]}</p>
          </div>
        </div>

        {/* ── Nav Items ── */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${active ? t.activeItem : t.hoverItem}
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}>
                  {item.label}
                </span>
                {active && !collapsed && <ChevronRight size={14} className="ml-auto flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* ── Tombol Collapse Desktop ── */}
        <div className={`p-3 border-t ${t.headerBorder} flex-shrink-0 hidden md:flex ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
            className={`${t.toggleBtn} text-white p-2 rounded-lg transition-all duration-200`}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
}
