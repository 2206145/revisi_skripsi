"use client";
import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * SessionGuard
 *
 * - sessionStorage TERHAPUS saat semua jendela browser ditutup
 * - Cookie bisa bertahan meskipun browser ditutup (perilaku Chrome)
 *
 * Logika:
 * - Session cookie ADA tapi sessionStorage TIDAK ada
 *   → browser baru dibuka ulang dengan cookie lama → paksa logout → landing page "/"
 * - Session cookie ADA dan sessionStorage ADA → sesi aktif normal
 */
export default function SessionGuard() {
    const { data: session, status } = useSession();
    const handled = useRef(false);

    useEffect(() => {
        // Cek sessionStorage secara synchronous (instant, tanpa network)
        const hasBrowserSession = sessionStorage.getItem("hasBrowserSession");

        // Sesi valid → tidak perlu cek lagi
        if (hasBrowserSession) return;

        // Tunggu status session selesai
        if (status === "loading") return;

        // Hanya proses sekali
        if (handled.current) return;
        handled.current = true;

        if (session && !hasBrowserSession) {
            // Cookie lama ada, browser baru dibuka → paksa logout ke landing page
            signOut({ redirect: false }).then(() => {
                window.location.href = "/"; // → landing page, bukan /login
            });
        }
    }, [status, session]);

    return null;
}
