"use client";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// divIcon avoids Leaflet's broken default-marker image paths under bundlers.
const pin = L.divIcon({
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  html: `<svg width="26" height="26" viewBox="0 0 24 24" fill="#0B3D8E" stroke="white" stroke-width="1.5">
    <path d="M12 21s7-6.4 7-11a7 7 0 0 0-14 0c0 4.6 7 11 7 11z"/><circle cx="12" cy="10" r="2.6" fill="white"/></svg>`,
});

const JHARKHAND: [number, number] = [23.6102, 85.2799];

function Clicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function LocationPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (v: { lat: number; lng: number }) => void;
}) {
  const center = value ? ([value.lat, value.lng] as [number, number]) : JHARKHAND;
  return (
    <MapContainer center={center} zoom={value ? 14 : 7} scrollWheelZoom={false}
      style={{ height: 220, width: "100%", borderRadius: 12, zIndex: 0 }}>
      <TileLayer attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Clicker onPick={(lat, lng) => onChange({ lat, lng })} />
      {value && <Marker position={[value.lat, value.lng]} icon={pin} />}
    </MapContainer>
  );
}
