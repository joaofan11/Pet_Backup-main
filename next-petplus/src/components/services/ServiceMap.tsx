'use client';

import { useEffect, useRef } from 'react';
import type { ServiceProvider } from '@/types';

interface ServiceMapProps {
  service: ServiceProvider;
}

export default function ServiceMap({ service }: ServiceMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !service.latitude || !service.longitude) return;
    if (mapInstanceRef.current) return; // já iniciado

    // Importa Leaflet dinamicamente (evita erro de SSR)
    import('leaflet').then((L) => {
      // Fix dos ícones padrão do Leaflet no Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!).setView(
        [service.latitude!, service.longitude!],
        16
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      L.marker([service.latitude!, service.longitude!])
        .addTo(map)
        .bindPopup(`<strong>${service.name}</strong><br>${service.professional}`)
        .openPopup();

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [service]);

  return (
    <>
      {/* CSS do Leaflet carregado via link para evitar flash */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhpmDbsnjfDQDfLCLD9XPMC7DGNhILAZSJSs="
        crossOrigin=""
      />
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
        <p className="text-sm text-muted-foreground">{service.address}</p>
      </div>
      <div ref={mapRef} style={{ height: 400, width: '100%', borderRadius: 10 }} />
    </>
  );
}