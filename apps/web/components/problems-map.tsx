"use client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { categoryColor } from "@repo/ui";

export type MapPoint = { id: string; lat: number; lng: number; title: string; category: string; priorityScore: number };

const JHARKHAND: [number, number] = [23.6102, 85.2799];

export default function ProblemsMap({ points }: { points: MapPoint[] }) {
  return (
    <MapContainer center={JHARKHAND} zoom={7} scrollWheelZoom={false}
      style={{ height: 320, width: "100%", borderRadius: 12, zIndex: 0 }}>
      <TileLayer attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((p) => (
        <CircleMarker key={p.id} center={[p.lat, p.lng]}
          radius={6 + Math.min(p.priorityScore, 10)}
          pathOptions={{ color: categoryColor(p.category), fillColor: categoryColor(p.category), fillOpacity: 0.6, weight: 1.5 }}>
          <Tooltip>{p.title} · {p.category.replace(/_/g, " ")}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
