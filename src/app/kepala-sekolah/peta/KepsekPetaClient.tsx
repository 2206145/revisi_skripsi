"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function KepsekPetaClient() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/dashboard").then((r) => r.json()).then(setData);
    }, []);

    if (!data) return <div className="text-gray-500">Memuat data...</div>;

    return (
        <div className="space-y-8">
            {/* Peta Persebaran */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-semibold text-gray-700 mb-1">
                    Peta Persebaran Lulusan
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    {data.markers?.length || 0} lulusan dengan data lokasi terdeteksi
                </p>
                <div style={{ height: "450px" }}>
                    <MapView markers={data.markers || []} />
                </div>
            </div>

            {/* Ringkasan per Jurusan */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="font-semibold text-gray-700 mb-4">Ringkasan per Jurusan</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {["Jurusan", "Total Lulusan", "Bekerja", "Kuliah", "Wirausaha", "Keterserapan"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.perJurusan.map((j: any) => (
                                <tr key={j.jurusan} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{j.jurusan}</td>
                                    <td className="px-4 py-3">{j.total}</td>
                                    <td className="px-4 py-3 text-green-700 font-medium">{j.bekerja}</td>
                                    <td className="px-4 py-3 text-teal-600 font-medium">{j.kuliah}</td>
                                    <td className="px-4 py-3 text-yellow-600 font-medium">{j.wirausaha}</td>
                                    <td className="px-4 py-3">
                                        <span className="font-semibold text-green-700">
                                            {j.total > 0 ? `${Math.round((j.bekerja / j.total) * 100)}%` : "-"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
