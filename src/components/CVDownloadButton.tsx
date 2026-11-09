"use client";
import { useState } from "react";
import { Eye, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Tombol reusable: klik → fetch data lulusan → generate PDF → tampilkan di tab baru.
 * User bisa melihat CV terlebih dahulu, lalu mengunduh dari PDF viewer browser.
 */
export default function CVDownloadButton({
    lulusanId,
    label = "Lihat CV",
    className,
}: {
    lulusanId: string;
    label?: string;
    className?: string;
}) {
    const [loading, setLoading] = useState(false);

    async function handleView() {
        setLoading(true);
        const toastId = "cv-toast-" + lulusanId;
        toast.loading("Menyiapkan CV...", { id: toastId });

        try {
            // 1. Ambil data lulusan dari API
            const res = await fetch(`/api/cv/${lulusanId}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData?.error || `HTTP ${res.status}`);
            }
            const data = await res.json();

            toast.loading("Membuat PDF...", { id: toastId });

            // 2. Import utility generate PDF secara dinamis
            const { generateCVPdf } = await import("@/lib/generateCVPdf");

            // 3. Generate → buka di tab baru
            await generateCVPdf(data, (msg) => {
                toast.loading(msg, { id: toastId });
            });

            toast.success("CV berhasil dibuka!", { id: toastId });
        } catch (err: any) {
            console.error("[CVDownloadButton] Error:", err);
            toast.error(`Gagal membuka CV: ${err?.message || "Coba lagi"}`, { id: toastId });
        } finally {
            setLoading(false);
        }
    }

    const defaultClass =
        "inline-flex items-center gap-1.5 bg-[#0D704D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0a5c3f] disabled:opacity-60 transition font-medium";

    return (
        <button
            onClick={handleView}
            disabled={loading}
            className={className || defaultClass}
            title="Lihat CV dalam format PDF"
        >
            {loading ? (
                <>
                    <Loader2 size={15} className="animate-spin" />
                    Membuat PDF...
                </>
            ) : (
                <>
                    <Eye size={15} />
                    {label}
                </>
            )}
        </button>
    );
}
