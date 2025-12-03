import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  DriverMarker,
  EstablishmentMarker,
  OrderMarker,
  HeatmapPoint,
  getStatusLabel,
  getStatusColor,
} from "@/services/adminMapService";

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom icons
const driverIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverOfflineIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const establishmentIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const orderIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapADMProps {
  drivers?: DriverMarker[];
  establishments?: EstablishmentMarker[];
  orders?: OrderMarker[];
  heatmapPoints?: HeatmapPoint[];
  showDrivers?: boolean;
  showEstablishments?: boolean;
  showOrders?: boolean;
  showHeatmap?: boolean;
  heatmapType?: "orders" | "drivers";
}

// Component to set initial view
function SetViewOnMount({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
    (window as any)._leaflet_admin_map = map;
  }, [coords, map]);
  return null;
}

export default function MapADM({
  drivers = [],
  establishments = [],
  orders = [],
  heatmapPoints = [],
  showDrivers = true,
  showEstablishments = true,
  showOrders = true,
  showHeatmap = false,
  heatmapType = "orders",
}: MapADMProps) {
  const zonaOesteCenter: [number, number] = [-22.9064, -43.5507];

  // Memoize heatmap rendering for performance
  const heatmapCircles = useMemo(() => {
    if (!showHeatmap || heatmapPoints.length === 0) return null;

    const baseColor = heatmapType === "orders" ? "59, 130, 246" : "249, 115, 22"; // blue or orange

    return heatmapPoints.map((point, index) => (
      <CircleMarker
        key={`heatmap-${index}`}
        center={[point.latitude, point.longitude]}
        radius={20 + point.intensity * 30}
        pathOptions={{
          color: "transparent",
          fillColor: `rgba(${baseColor}, ${point.intensity * 0.6})`,
          fillOpacity: point.intensity * 0.5,
        }}
      />
    ));
  }, [showHeatmap, heatmapPoints, heatmapType]);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={zonaOesteCenter}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <SetViewOnMount coords={zonaOesteCenter} />

        {/* Heatmap Layer */}
        {heatmapCircles}

        {/* Establishments Layer */}
        {showEstablishments &&
          establishments.map((est) => (
            <Marker
              key={`est-${est.id}`}
              position={[est.latitude, est.longitude]}
              icon={establishmentIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏪</span>
                    <h3 className="font-bold text-foreground">{est.nome}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Tipo: {est.tipo}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Drivers Layer */}
        {showDrivers &&
          drivers.map((driver) => (
            <Marker
              key={`driver-${driver.id}`}
              position={[driver.latitude, driver.longitude]}
              icon={driver.status_online ? driverIcon : driverOfflineIcon}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏍️</span>
                    <h3 className="font-bold text-foreground">{driver.nome}</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          driver.status_online ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      {driver.status_online ? "Online" : "Offline"}
                    </p>
                    <p className="text-muted-foreground">📞 {driver.telefone}</p>
                    <p className="text-muted-foreground">🚗 {driver.veiculo}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Orders Layer */}
        {showOrders &&
          orders.map((order) => (
            <Marker
              key={`order-${order.id}`}
              position={[order.latitude, order.longitude]}
              icon={orderIcon}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">📦</span>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">
                      R$ {order.valor_total.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">
                      🏪 {order.establishment_nome}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      📍 {order.endereco_entrega}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
