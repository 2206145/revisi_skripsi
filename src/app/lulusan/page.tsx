import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function LulusanDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "LULUSAN") redirect("/login");

  const lulusan = await prisma.lulusan.findUnique({
    where: { userId: (session.user as any).id },
    include: { jurusan: true, tracerStudy: true },
  });

  // Akun LULUSAN ada tapi data lulusan belum dibuat oleh admin
  if (!lulusan) {
    return (
      <div className="flex min-h-screen">
        <Sidebar role="lulusan" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-10 max-w-md text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Data Lulusan Belum Dikonfigurasi</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Akun Anda sudah aktif, namun data lulusan (NIS, jurusan, tahun lulus) belum diisi oleh Admin.
              Silakan hubungi Admin BKK untuk melengkapi data Anda.
            </p>
            <p className="mt-4 text-xs text-gray-400">Login sebagai: <span className="font-medium">{session.user?.email}</span></p>
          </div>
        </main>
      </div>
    );
  }

  // Helper untuk format bulan-tahun
  function formatMonthYear(val?: string | null) {
    if (!val) return "-";
    if (val === "Sampai Sekarang") return val;
    const parts = val.split("-");
    if (parts.length !== 2) return val;
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    if (monthNum >= 1 && monthNum <= 12) return `${months[monthNum - 1]} ${year}`;
    return val;
  }

  const ts = lulusan?.tracerStudy as any;

  return (
    <div className="flex min-h-screen">
      <Sidebar role="lulusan" />
      <main className="flex-1 p-8">
        <Topbar title={`Selamat Datang, ${lulusan?.nama}`} profileHref="/lulusan/profil" />
        <p className="text-gray-500 mb-8 -mt-4">Jurusan: {lulusan?.jurusan?.nama} | Tahun Lulus: {lulusan?.tahunLulus}</p>

        <div className="w-full">
          {/* Status Tracer Study */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-semibold text-gray-700 mb-3">Status Tracer Study</h2>
            {ts ? (
              <div className="space-y-3 text-sm">
                {/* Badge Status */}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold px-3 py-0.5 rounded-full text-xs ${ts.status === "BEKERJA" ? "bg-blue-100 text-blue-700" :
                      ts.status === "KULIAH" ? "bg-green-100 text-green-700" :
                        ts.status === "WIRAUSAHA" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                    }`}>
                    {ts.status === "BEKERJA" ? "Bekerja" : ts.status === "KULIAH" ? "Melanjutkan Kuliah" : ts.status === "WIRAUSAHA" ? "Wirausaha" : "Belum Bekerja"}
                  </span>
                </div>

                {/* ===== BEKERJA ===== */}
                {ts.status === "BEKERJA" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Nama Perusahaan</span><span className="font-medium">{ts.namaPerusahaan || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Alamat Perusahaan</span><span className="font-medium text-right max-w-[60%] truncate" title={ts.alamatInstansi || ""}>{ts.alamatInstansi || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Jabatan</span><span className="font-medium">{ts.jabatan || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Mulai Kerja</span><span className="font-medium">{formatMonthYear(ts.mulaiKerja)}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Selesai Kerja</span><span className="font-medium">{formatMonthYear(ts.masaKerja)}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Jenis Pekerjaan</span><span className="font-medium">{ts.jenisPekerjaan || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Sesuai Keahlian</span><span className="font-medium">{ts.sesuaiKeahlian || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Masa Tunggu</span><span className="font-medium">{ts.masaTunggu || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Besar Gaji</span><span className="font-medium">{ts.gaji || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Lokasi Kerja</span><span className="font-medium">{ts.lokasiKerja || "-"}</span></div>
                  </>
                )}

                {/* ===== KULIAH ===== */}
                {ts.status === "KULIAH" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Nama Universitas</span><span className="font-medium">{ts.namaKampus || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Alamat Universitas</span><span className="font-medium text-right max-w-[60%] truncate" title={ts.alamatUniversitas || ""}>{ts.alamatUniversitas || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Jurusan / Program Studi</span><span className="font-medium">{ts.jurusanStudi || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Bulan & Tahun Awal Studi</span><span className="font-medium">{formatMonthYear(ts.bulanTahunStudi)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Lokasi (Kota)</span><span className="font-medium">{ts.lokasiKerja || "-"}</span></div>
                  </>
                )}

                {/* ===== WIRAUSAHA ===== */}
                {ts.status === "WIRAUSAHA" && (
                  <>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Nama Usaha</span><span className="font-medium">{ts.namaUsaha || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Bidang Usaha</span><span className="font-medium">{ts.bidangUsaha || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Lokasi Usaha</span><span className="font-medium max-w-[60%] truncate text-right" title={ts.lokasiKerja || ""}>{ts.lokasiKerja || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Omset per Bulan</span><span className="font-medium">{ts.omsetUsaha || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Link Media Sosial / E-commerce</span>
                      {ts.linkUsaha ? (
                        <a href={ts.linkUsaha} target="_blank" rel="noopener noreferrer" className="font-medium text-green-700 underline max-w-[55%] truncate text-right">{ts.linkUsaha}</a>
                      ) : (
                        <span className="font-medium">-</span>
                      )}
                    </div>
                    {ts.keterangan && (
                      <div className="flex justify-between"><span className="text-gray-500">Keterangan</span><span className="font-medium max-w-[60%] line-clamp-2">{ts.keterangan}</span></div>
                    )}
                  </>
                )}

                {/* ===== BELUM BEKERJA ===== */}
                {ts.status === "BELUM_BEKERJA" && (
                  <>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Terakhir Bekerja</span>
                      <span className="font-medium">{ts.belumPernahBekerja === "Ya" ? "Belum pernah bekerja sama sekali" : formatMonthYear(ts.terakhirBekerja)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500 shrink-0">Alasan Belum Bekerja</span><span className="font-medium text-right max-w-[60%]">{ts.alasanBelumBekerja || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500 shrink-0">Keaktifan Mencari Kerja</span><span className="font-medium text-right max-w-[60%]">{ts.aktifMencariKerja || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500 shrink-0">Saluran Pencarian Kerja</span><span className="font-medium text-right max-w-[60%]">{ts.saluranPencarianKerja || "-"}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-gray-500 shrink-0">Upaya Peningkatan Diri</span><span className="font-medium text-right max-w-[60%]">{ts.upayaPeningkatan || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500 shrink-0">Kegiatan Saat Ini</span><span className="font-medium text-right max-w-[60%] line-clamp-2">{ts.kegiatanSaatIni || ts.keterangan || "-"}</span></div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-3">Anda belum mengisi tracer study</p>
                <a href="/lulusan/tracer-study" className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-800">Isi Sekarang</a>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
