"use client";

import { useState, useRef } from "react";
import { Printer, ChevronLeft, Link as LinkIcon, Check, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CVPageClient({ lulusan, backUrl }: { lulusan: any; backUrl: string }) {
    const [copied, setCopied] = useState(false);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const cvRef = useRef<HTMLDivElement>(null);

    const getStatusText = (status: string) => {
        switch (status) {
            case "BEKERJA": return "Bekerja";
            case "KULIAH": return "Melanjutkan Pendidikan (Kuliah)";
            case "WIRAUSAHA": return "Wirausaha";
            case "BELUM_BEKERJA": return "Belum / Tidak Bekerja";
            default: return status;
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link CV berhasil disalin!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadPdf = async () => {
        if (!cvRef.current) return;
        setGeneratingPdf(true);
        toast.loading("Sedang membuat PDF...", { id: "pdf-toast" });

        try {
            // Import dinamis agar tidak memperbesar bundle
            const html2canvas = (await import("html2canvas")).default;
            const jsPDF = (await import("jspdf")).default;

            const canvas = await html2canvas(cvRef.current, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            const imgData = canvas.toDataURL("image/jpeg", 0.95);
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            // Halaman pertama
            pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Tambah halaman baru jika konten panjang melebihi 1 halaman A4
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const namaFile = `CV_${lulusan.nama.replace(/\s+/g, "_")}.pdf`;
            pdf.save(namaFile);

            toast.success("PDF berhasil diunduh!", { id: "pdf-toast" });
        } catch (err) {
            console.error(err);
            toast.error("Gagal membuat PDF. Coba lagi.", { id: "pdf-toast" });
        } finally {
            setGeneratingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">

            {/* Toolbar (disembunyikan saat print) */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between px-4 print:hidden">
                <a
                    href={backUrl}
                    className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-sm transition border border-gray-200"
                >
                    <ChevronLeft size={16} /> Kembali
                </a>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Salin Link */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 bg-white text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition border border-gray-200 font-medium"
                    >
                        {copied ? <Check size={15} className="text-green-600" /> : <LinkIcon size={15} />}
                        {copied ? "Tersalin!" : "Salin Link"}
                    </button>

                    {/* Cetak */}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 bg-white text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition border border-gray-200 font-medium"
                    >
                        <Printer size={15} /> Cetak
                    </button>

                    {/* Download PDF */}
                    <button
                        onClick={handleDownloadPdf}
                        disabled={generatingPdf}
                        className="flex items-center gap-1.5 bg-[#0D704D] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#0a5c3f] disabled:opacity-60 transition font-medium shadow-sm"
                    >
                        {generatingPdf
                            ? <><Loader2 size={15} className="animate-spin" /> Membuat PDF...</>
                            : <><Download size={15} /> Unduh PDF</>
                        }
                    </button>
                </div>
            </div>

            {/* ============================================================
                DOKUMEN CV — bagian inilah yang di-capture untuk PDF
            ============================================================ */}
            <div
                ref={cvRef}
                id="cv-document"
                className="max-w-4xl mx-auto bg-white shadow-xl text-gray-800 print:shadow-none print:max-w-none"
                style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}
            >

                {/* ── HEADER ── */}
                <div style={{ backgroundColor: "#0D704D", color: "#ffffff", padding: "40px" }}>
                    <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "4px" }}>
                        {lulusan.nama}
                    </h1>
                    <p style={{ color: "#a7f3d0", fontSize: "16px", marginBottom: "24px" }}>
                        Lulusan {lulusan.jurusan?.nama || "SMK Bina Bhakti"}{lulusan.tahunLulus ? ` · ${lulusan.tahunLulus}` : ""}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "13px", color: "#d1fae5" }}>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Email</p>
                            <p>{lulusan.user?.email || "-"}</p>
                        </div>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Telepon / WhatsApp</p>
                            <p>{lulusan.noHp || "-"}</p>
                        </div>
                        <div>
                            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Alamat</p>
                            <p>{lulusan.alamat || "-"}</p>
                        </div>
                    </div>
                </div>

                {/* ── KONTEN UTAMA ── */}
                <div style={{ padding: "40px" }}>

                    {/* PROFIL */}
                    <section style={{ marginBottom: "36px" }}>
                        <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0D704D", borderBottom: "2px solid #d1fae5", paddingBottom: "8px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Profil
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", fontSize: "14px" }}>
                            <div>
                                <p style={{ color: "#6b7280", marginBottom: "4px" }}>Jenis Kelamin</p>
                                <p style={{ fontWeight: "600" }}>{lulusan.jenisKelamin || "-"}</p>
                            </div>
                            <div>
                                <p style={{ color: "#6b7280", marginBottom: "4px" }}>Tahun Masuk</p>
                                <p style={{ fontWeight: "600" }}>{lulusan.tahunMasuk || (lulusan.tahunLulus ? lulusan.tahunLulus - 3 : "-")}</p>
                            </div>
                            <div>
                                <p style={{ color: "#6b7280", marginBottom: "4px" }}>Tahun Lulus</p>
                                <p style={{ fontWeight: "600" }}>{lulusan.tahunLulus || "-"}</p>
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <p style={{ color: "#6b7280", marginBottom: "4px" }}>Status Saat Ini</p>
                                <span style={{ display: "inline-block", backgroundColor: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "6px", fontWeight: "600", fontSize: "13px" }}>
                                    {lulusan.tracerStudy ? getStatusText(lulusan.tracerStudy.status) : "Belum mengisi tracer study"}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* PENGALAMAN KERJA / PENDIDIKAN / WIRAUSAHA */}
                    {lulusan.tracerStudy && lulusan.tracerStudy.status !== "BELUM_BEKERJA" && (
                        <section style={{ marginBottom: "36px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0D704D", borderBottom: "2px solid #d1fae5", paddingBottom: "8px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                {lulusan.tracerStudy.status === "BEKERJA" ? "Pengalaman Kerja" :
                                    lulusan.tracerStudy.status === "KULIAH" ? "Pendidikan Lanjut" : "Wirausaha"}
                            </h2>

                            {lulusan.tracerStudy.status === "BEKERJA" && (
                                <div>
                                    <p style={{ fontSize: "17px", fontWeight: "bold", color: "#1f2937" }}>{lulusan.tracerStudy.jabatan || "-"}</p>
                                    <p style={{ color: "#0D704D", fontWeight: "600", marginBottom: "12px" }}>{lulusan.tracerStudy.namaPerusahaan || "-"}</p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px", color: "#4b5563" }}>
                                        {lulusan.tracerStudy.mulaiKerja && <p><strong>Mulai Kerja:</strong> {lulusan.tracerStudy.mulaiKerja}</p>}
                                        {lulusan.tracerStudy.masaKerja && <p><strong>Masa Kerja:</strong> {lulusan.tracerStudy.masaKerja}</p>}
                                        {lulusan.tracerStudy.alamatInstansi && <p style={{ gridColumn: "1 / -1" }}><strong>Lokasi:</strong> {lulusan.tracerStudy.alamatInstansi}</p>}
                                        {lulusan.tracerStudy.gaji && <p><strong>Gaji:</strong> {lulusan.tracerStudy.gaji}</p>}
                                        {lulusan.tracerStudy.sesuaiKeahlian && <p><strong>Sesuai Keahlian:</strong> {lulusan.tracerStudy.sesuaiKeahlian}</p>}
                                    </div>
                                    {lulusan.tracerStudy.deskripsiPekerjaan && (
                                        <p style={{ marginTop: "12px", fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>{lulusan.tracerStudy.deskripsiPekerjaan}</p>
                                    )}
                                </div>
                            )}

                            {lulusan.tracerStudy.status === "KULIAH" && (
                                <div>
                                    <p style={{ fontSize: "17px", fontWeight: "bold", color: "#1f2937" }}>{lulusan.tracerStudy.jurusanStudi || "-"}</p>
                                    <p style={{ color: "#0D704D", fontWeight: "600", marginBottom: "8px" }}>{lulusan.tracerStudy.namaKampus || "-"}</p>
                                    {lulusan.tracerStudy.alamatUniversitas && (
                                        <p style={{ fontSize: "13px", color: "#4b5563" }}><strong>Lokasi Kampus:</strong> {lulusan.tracerStudy.alamatUniversitas}</p>
                                    )}
                                    {lulusan.tracerStudy.bulanTahunStudi && (
                                        <p style={{ fontSize: "13px", color: "#4b5563" }}><strong>Mulai Studi:</strong> {lulusan.tracerStudy.bulanTahunStudi}</p>
                                    )}
                                </div>
                            )}

                            {lulusan.tracerStudy.status === "WIRAUSAHA" && (
                                <div>
                                    <p style={{ fontSize: "17px", fontWeight: "bold", color: "#1f2937" }}>{lulusan.tracerStudy.namaUsaha || "-"}</p>
                                    {lulusan.tracerStudy.keterangan && (
                                        <p style={{ marginTop: "8px", fontSize: "13px", color: "#374151", lineHeight: "1.7" }}>{lulusan.tracerStudy.keterangan}</p>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* PORTOFOLIO */}
                    {lulusan.portofolio && lulusan.portofolio.length > 0 && (
                        <section style={{ marginBottom: "36px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0D704D", borderBottom: "2px solid #d1fae5", paddingBottom: "8px", marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px" }}>
                                Portofolio & Pengalaman
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                {lulusan.portofolio.map((item: any, idx: number) => (
                                    <div key={idx} style={{ paddingLeft: "20px", borderLeft: "3px solid #0D704D", position: "relative" }}>
                                        {/* Bullet dot */}
                                        <div style={{ position: "absolute", left: "-7px", top: "5px", width: "11px", height: "11px", backgroundColor: "#0D704D", borderRadius: "50%" }} />

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                                            <p style={{ fontSize: "16px", fontWeight: "bold", color: "#1f2937" }}>{item.judul}</p>
                                            {item.tahun && (
                                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#0D704D", backgroundColor: "#d1fae5", padding: "2px 10px", borderRadius: "4px", whiteSpace: "nowrap", marginLeft: "8px" }}>
                                                    {item.tahun}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: "13px", fontWeight: "600", color: "#0D704D", marginBottom: "8px" }}>{item.kategori}</p>

                                        {item.deskripsi && (
                                            <p style={{ fontSize: "13px", color: "#374151", lineHeight: "1.7", marginBottom: "8px" }}>{item.deskripsi}</p>
                                        )}

                                        {item.keahlian && (
                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                                                {item.keahlian.split(",").map((k: string) => k.trim()).filter(Boolean).map((k: string, i: number) => (
                                                    <span
                                                        key={i}
                                                        style={{ fontSize: "11px", backgroundColor: "#f3f4f6", color: "#374151", padding: "3px 10px", borderRadius: "4px" }}
                                                    >
                                                        {k}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Footer CV */}
                    <div style={{ marginTop: "40px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", textAlign: "center", fontSize: "11px", color: "#9ca3af" }}>
                        CV ini digenerate otomatis oleh Sistem Informasi BKK SMK Bina Bhakti Mekarmukti
                    </div>
                </div>
            </div>

            {/* Print style khusus */}
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
        </div>
    );
}
