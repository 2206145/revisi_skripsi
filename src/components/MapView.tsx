"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;

const statusConfig: Record<string, { color: string; label: string }> = {
  BEKERJA:       { color: "#16a34a", label: "Bekerja" },
  KULIAH:        { color: "#2563eb", label: "Melanjutkan Kuliah" },
  WIRAUSAHA:     { color: "#d97706", label: "Wirausaha" },
  BELUM_BEKERJA: { color: "#dc2626", label: "Belum Bekerja" },
};

function createIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -10],
  });
}

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  tahunLulus?: number;
  jurusan?: string;
  status?: string;
  subtitle?: string;
};

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, map]);
  return null;
}

export default function MapView({ markers }: { markers: MapMarker[] }) {
  return (
    <MapContainer center={[-6.5, 107.0]} zoom={9} className="w-full h-full rounded-xl" style={{ minHeight: "400px" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((m) => {
        const cfg = statusConfig[m.status || ""] || { color: "#6b7280", label: m.status || "" };
        return (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={createIcon(cfg.color)}>
            <Popup>
              <div style={{ minWidth: "160px", fontFamily: "sans-serif" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px" }}>{m.title}</p>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "2px" }}>
                  Jurusan: <span style={{ color: "#111" }}>{m.jurusan || "-"}</span>
                </p>
                <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "6px" }}>
                  Tahun Lulus: <span style={{ color: "#111" }}>{m.tahunLulus || "-"}</span>
                </p>
                <span style={{
                  display: "inline-block",
                  padding: "2px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "white",
                  background: cfg.color,
                }}>
                  {cfg.label}
                </span>
              </div>
            </Popup>
          </Marker>
        );
      })}
      {markers.length > 0 && <FitBounds markers={markers} />}
    </MapContainer>
  );
}
