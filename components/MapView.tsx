"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  color: string;
  popupHtml: string;
}

export default function MapView({ markers, center, zoom = 12 }: { markers: MapMarker[]; center: [number, number]; zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [center[1], center[0]],
      zoom,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [center[1], center[0]], zoom });
  }, [center[0], center[1], zoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = markers.map((m) => {
      const el = document.createElement("div");
      el.style.width = "16px";
      el.style.height = "16px";
      el.style.borderRadius = "50%";
      el.style.background = m.color;
      el.style.border = "2px solid rgba(18,21,26,0.9)";
      el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.25)";
      el.style.cursor = "pointer";
      return new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(m.popupHtml))
        .addTo(mapRef.current!);
    });
  }, [markers]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
