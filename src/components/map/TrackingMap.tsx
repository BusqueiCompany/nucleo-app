import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Limites aproximados Estado do RJ
const RJ_BOUNDS = L.latLngBounds(
  L.latLng(-23.400, -43.800),
  L.latLng(-22.700, -43.200)
);

interface Position {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  establishmentPosition?: Position;
  customerPosition?: Position;
  driverPosition?: Position;
  showDriverRoute?: boolean;
  establishmentName?: string;
  driverName?: string;
}

// Ícones customizados
const establishmentIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const customerIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function TrackingMap({
  establishmentPosition,
  customerPosition,
  driverPosition,
  showDriverRoute = false,
  establishmentName = "Estabelecimento",
  driverName = "Entregador"
}: TrackingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const establishmentMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const driverRouteLineRef = useRef<L.Polyline | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      maxBounds: RJ_BOUNDS,
      maxBoundsViscosity: 1.0,
      zoomControl: true,
    }).setView([-22.91, -43.56], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
    };
  }, []);

  // Função para buscar rota real do OSRM
  const fetchRoute = async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<[number, number][]> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes?.[0]?.geometry?.coordinates) {
        return data.routes[0].geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]]
        );
      }
      return [[startLat, startLng], [endLat, endLng]];
    } catch (error) {
      console.error('Erro ao buscar rota:', error);
      return [[startLat, startLng], [endLat, endLng]];
    }
  };

  // Atualizar marcador do estabelecimento
  useEffect(() => {
    if (!mapRef.current || !establishmentPosition) return;

    if (establishmentMarkerRef.current) {
      establishmentMarkerRef.current.setLatLng([establishmentPosition.lat, establishmentPosition.lng]);
    } else {
      establishmentMarkerRef.current = L.marker(
        [establishmentPosition.lat, establishmentPosition.lng],
        { icon: establishmentIcon }
      ).addTo(mapRef.current);
      establishmentMarkerRef.current.bindPopup(`<b>${establishmentName}</b><br/>Local de coleta`);
    }
  }, [establishmentPosition, establishmentName]);

  // Atualizar marcador do cliente
  useEffect(() => {
    if (!mapRef.current || !customerPosition) return;

    if (customerMarkerRef.current) {
      customerMarkerRef.current.setLatLng([customerPosition.lat, customerPosition.lng]);
    } else {
      customerMarkerRef.current = L.marker(
        [customerPosition.lat, customerPosition.lng],
        { icon: customerIcon }
      ).addTo(mapRef.current);
      customerMarkerRef.current.bindPopup("<b>Seu endereço</b><br/>Local de entrega");
    }
  }, [customerPosition]);

  // Atualizar marcador do entregador (com animação suave)
  useEffect(() => {
    if (!mapRef.current || !driverPosition) return;

    if (driverMarkerRef.current) {
      // Animação suave para mover o marcador
      const currentPos = driverMarkerRef.current.getLatLng();
      const targetPos = L.latLng(driverPosition.lat, driverPosition.lng);
      
      const frames = 30;
      const latStep = (targetPos.lat - currentPos.lat) / frames;
      const lngStep = (targetPos.lng - currentPos.lng) / frames;
      
      let frame = 0;
      const animate = () => {
        if (frame < frames && driverMarkerRef.current) {
          const newLat = currentPos.lat + latStep * frame;
          const newLng = currentPos.lng + lngStep * frame;
          driverMarkerRef.current.setLatLng([newLat, newLng]);
          frame++;
          requestAnimationFrame(animate);
        }
      };
      animate();
    } else {
      driverMarkerRef.current = L.marker(
        [driverPosition.lat, driverPosition.lng],
        { icon: driverIcon }
      ).addTo(mapRef.current);
      driverMarkerRef.current.bindPopup(`<b>${driverName}</b><br/>Entregador`);
    }
  }, [driverPosition, driverName]);

  // Desenhar rota estabelecimento → cliente
  useEffect(() => {
    if (!mapRef.current || !establishmentPosition || !customerPosition) return;

    const drawMainRoute = async () => {
      const routeCoords = await fetchRoute(
        establishmentPosition.lat,
        establishmentPosition.lng,
        customerPosition.lat,
        customerPosition.lng
      );

      if (routeLineRef.current) {
        routeLineRef.current.remove();
      }

      routeLineRef.current = L.polyline(routeCoords, {
        color: '#14C57C',
        weight: 4,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(mapRef.current!);

      // Ajustar zoom para mostrar toda a rota
      const bounds = L.latLngBounds([
        [establishmentPosition.lat, establishmentPosition.lng],
        [customerPosition.lat, customerPosition.lng]
      ]);
      
      if (driverPosition) {
        bounds.extend([driverPosition.lat, driverPosition.lng]);
      }
      
      mapRef.current!.fitBounds(bounds, { padding: [50, 50] });
    };

    drawMainRoute();
  }, [establishmentPosition, customerPosition]);

  // Desenhar rota entregador → cliente (quando em rota)
  useEffect(() => {
    if (!mapRef.current || !driverPosition || !customerPosition || !showDriverRoute) {
      if (driverRouteLineRef.current) {
        driverRouteLineRef.current.remove();
        driverRouteLineRef.current = null;
      }
      return;
    }

    const drawDriverRoute = async () => {
      const routeCoords = await fetchRoute(
        driverPosition.lat,
        driverPosition.lng,
        customerPosition.lat,
        customerPosition.lng
      );

      if (driverRouteLineRef.current) {
        driverRouteLineRef.current.remove();
      }

      driverRouteLineRef.current = L.polyline(routeCoords, {
        color: '#2D91F2',
        weight: 5,
        opacity: 0.9
      }).addTo(mapRef.current!);
    };

    drawDriverRoute();
  }, [driverPosition, customerPosition, showDriverRoute]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-none"
      style={{ minHeight: "100%" }}
    />
  );
}
