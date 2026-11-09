"use client";
import { SessionProvider } from "next-auth/react";
import SessionGuard from "@/components/SessionGuard";

export default function SessionWrapper({ children }: { children: React.ReactNode }) {
  return (
    /**
     * refetchInterval: 0          → Tidak ada polling session berkala
     * refetchOnWindowFocus: false  → Tidak re-fetch saat user kembali ke tab
     *
     * Kedua opsi ini mengurangi network request yang tidak perlu,
     * terutama saat pertama buka aplikasi atau berpindah tab.
     * Session sudah aman via JWT + middleware, jadi polling tidak dibutuhkan.
     */
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SessionGuard />
      {children}
    </SessionProvider>
  );
}
