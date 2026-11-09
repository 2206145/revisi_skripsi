"use client";
import { signOut, useSession } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface TopbarProps {
  title: string;
  profileHref?: string; // jika diisi, icon user bisa diklik → ke halaman profil
}

export default function Topbar({ title, profileHref }: TopbarProps) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-2 md:pt-0">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight pr-12 md:pr-0">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">

        {/* User info — bisa diklik jika ada profileHref */}
        {profileHref ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-xs md:text-sm text-gray-600 shadow-sm hover:bg-gray-50 hover:border-[#0D704D] transition max-w-[200px] md:max-w-none"
            >
              <User size={15} className="text-[#0D704D] flex-shrink-0" />
              <span className="truncate max-w-[120px]">{session?.user?.name || session?.user?.email}</span>
              <ChevronDown size={13} className={`flex-shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700 truncate">{session?.user?.email}</p>
                </div>
                <Link
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-[#0D704D] transition"
                >
                  <User size={14} />
                  Lihat &amp; Edit Profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={14} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Tampilan biasa tanpa dropdown */
          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 text-xs md:text-sm text-gray-600 shadow-sm max-w-[200px] md:max-w-none overflow-hidden text-ellipsis whitespace-nowrap">
            <User size={15} className="text-[#0D704D] flex-shrink-0" />
            <span className="truncate">{session?.user?.name || session?.user?.email}</span>
          </div>
        )}

        {/* Tombol Keluar — hanya tampil jika TIDAK pakai dropdown (tidak ada profileHref) */}
        {!profileHref && (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        )}
      </div>
    </div>
  );
}
