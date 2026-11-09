"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * NavigationProgress
 * Progress bar tipis di atas layar yang muncul saat navigasi antar halaman.
 * Menghilangkan efek "blank screen" / "layar putih" saat perpindahan route.
 *
 * Cara kerja:
 * - Deteksi perubahan pathname → mulai animasi bar
 * - Bar bergerak cepat ke ~80%, lalu selesai ke 100% saat halaman siap
 * - Fade out setelah selesai
 */
export default function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const prevPathRef = useRef(pathname);

    useEffect(() => {
        const currentPath = pathname + searchParams.toString();
        const prevPath = prevPathRef.current;

        // Hanya jalankan jika path benar-benar berubah
        if (currentPath === prevPath) return;
        prevPathRef.current = currentPath;

        // Clear timer sebelumnya
        if (timerRef.current) clearInterval(timerRef.current);

        // Mulai progress bar
        setProgress(0);
        setVisible(true);

        // Animasikan ke ~85% dengan cepat
        let current = 0;
        timerRef.current = setInterval(() => {
            current += Math.random() * 15 + 5;
            if (current >= 85) {
                current = 85;
                if (timerRef.current) clearInterval(timerRef.current);
            }
            setProgress(current);
        }, 120);

        // Selesaikan ke 100% setelah mounting
        const completeTimer = setTimeout(() => {
            if (timerRef.current) clearInterval(timerRef.current);
            setProgress(100);
            // Sembunyikan setelah animasi selesai
            setTimeout(() => {
                setVisible(false);
                setProgress(0);
            }, 400);
        }, 600);

        return () => {
            clearTimeout(completeTimer);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [pathname, searchParams]);

    if (!visible) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
            style={{ background: "rgba(13,112,77,0.08)" }}
        >
            <div
                className="h-full bg-[#0D704D] rounded-full shadow-[0_0_8px_rgba(13,112,77,0.6)]"
                style={{
                    width: `${progress}%`,
                    transition:
                        progress === 100
                            ? "width 0.3s ease-out, opacity 0.3s ease-out"
                            : "width 0.12s ease-out",
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    );
}
