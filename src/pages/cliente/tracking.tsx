import { useNavigate, useSearchParams } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, Phone, Bike, MapPin, Radio, Package } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTrackingData, subscribeTracking, TrackingData } from "@/services/trackingMapService";
import storeIcon from "@/assets/map-icons/store.png";
import homeIcon from "@/assets/map-icons/home.png";
import driverIcon from "@/assets/map-icons/driver.png";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// Corrigir ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Criar ícones customizados
const createCustomIcon = (iconUrl: string, size: [number, number] = [40, 40]) => {
  return L.icon({
    iconUrl,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, -size[1]],
  });
};

const storeMarkerIcon = createCustomIcon(storeIcon);
const homeMarkerIcon = createCustomIcon(homeIcon);
const driverMarkerIcon = createCustomIcon(driverIcon);

const TrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Coordenadas mock (vão ser substituídas por dados reais)
  const [establishmentCoords] = useState<[number, number]>([-23.5505, -46.6333]);
  const [clientCoords] = useState<[number, number]>([-23.5605, -46.6433]);
  const [driverCoords, setDriverCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate("/cliente");
      return;
    }

    loadTrackingData();

    // Configurar listener realtime
    const unsubscribe = subscribeTracking(orderId, (data) => {
      setIsLive(true);
      setHighlight(true);

      if (data.type === "order") {
        const newStatus = data.payload.new.status;
        
        setTrackingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            order: {
              ...prev.order,
              status: newStatus,
              updated_at: data.payload.new.updated_at,
            },
          };
        });

        toast.success(`Status atualizado: ${getStatusLabel(newStatus)}`);
        
        // Verificar se foi entregue
        if (newStatus === "entregue") {
          setShowDeliveredModal(true);
        }
      }

      if (data.type === "delivery") {
        setTrackingData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            delivery: data.payload.new,
          };
        });

        // Simular atualização de posição do entregador
        // Em produção, isso viria do payload
        if (data.payload.new.status === "em_rota") {
          setDriverCoords([-23.5555, -46.6383]);
        }
      }

      setTimeout(() => setHighlight(false), 2000);
      setTimeout(() => setIsLive(false), 3000);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, navigate]);

  const loadTrackingData = async () => {
    if (!orderId) return;

    setLoading(true);
    const data = await getTrackingData(orderId);
    setTrackingData(data);
    
    // Se já tem entregador, mostrar no mapa
    if (data?.delivery?.driver_id) {
      setDriverCoords([-23.5555, -46.6383]); // Mock, em produção viria do banco
    }
    
    setLoading(false);
  };

  const getSteps = (status: string) => {
    const allSteps = [
      { label: "Pedido recebido", status: "completed" },
      { label: "Preparando", status: "pending" },
      { label: "Pronto", status: "pending" },
      { label: "A caminho", status: "pending" },
      { label: "Entregue", status: "pending" },
    ];

    const statusIndex: { [key: string]: number } = {
      pendente: 0,
      preparando: 1,
      pronto: 2,
      "aguardando-entregador": 2,
      retirado: 3,
      a_caminho: 3,
      entregue: 4,
    };

    const currentIndex = statusIndex[status] || 0;

    return allSteps.map((step, index) => ({
      ...step,
      status:
        index < currentIndex
          ? "completed"
          : index === currentIndex
          ? "active"
          : "pending",
    }));
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pendente: "Pendente",
      preparando: "Preparando",
      pronto: "Pronto",
      "aguardando-entregador": "Aguardando entregador",
      retirado: "Retirado",
      a_caminho: "A caminho",
      entregue: "Entregue",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  if (!trackingData) {
    return (
      <BusqueiLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pedido não encontrado</p>
        </div>
      </BusqueiLayout>
    );
  }

  const { order, establishment, delivery, driver } = trackingData;
  const steps = getSteps(order.status);
  const currentStep = steps.findIndex((s) => s.status === "active") + 1;
  const progressValue = (currentStep / steps.length) * 100;

  // Calcular centro do mapa
  const mapCenter: [number, number] = [
    (establishmentCoords[0] + clientCoords[0]) / 2,
    (establishmentCoords[1] + clientCoords[1]) / 2,
  ];

  // Linha da rota
  const routeLine = driverCoords
    ? [establishmentCoords, driverCoords, clientCoords]
    : [establishmentCoords, clientCoords];

  return (
    <>
      <div className="relative min-h-screen bg-gradient-to-b from-gradient-start to-gradient-end pb-20">
        {/* Mapa de tela cheia na parte superior */}
        <div className="relative h-[50vh] w-full">
          <MapContainer
            center={mapCenter}
            zoom={14}
            className="h-full w-full z-0"
            ref={mapRef}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Marcador do estabelecimento */}
            <Marker position={establishmentCoords} icon={storeMarkerIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">{establishment?.nome || "Estabelecimento"}</p>
                  <p className="text-xs text-muted-foreground">Origem do pedido</p>
                </div>
              </Popup>
            </Marker>

            {/* Marcador do cliente */}
            <Marker position={clientCoords} icon={homeMarkerIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">Seu endereço</p>
                  <p className="text-xs text-muted-foreground">{order.endereco_entrega}</p>
                </div>
              </Popup>
            </Marker>

            {/* Marcador do entregador (se existir) */}
            {driverCoords && (
              <Marker position={driverCoords} icon={driverMarkerIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{driver?.nome || "Entregador"}</p>
                    <p className="text-xs text-muted-foreground">A caminho</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Linha da rota */}
            <Polyline
              positions={routeLine}
              color="#14C57C"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          </MapContainer>

          {/* Live Indicator sobre o mapa */}
          {isLive && (
            <div className="absolute top-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur-md border border-green-500/30 rounded-xl p-3 flex items-center gap-2 shadow-lg animate-fade-in">
              <Radio className="h-4 w-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Atualizado em tempo real
              </span>
            </div>
          )}

          {/* Botão voltar */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 z-[1000] w-10 h-10 rounded-full bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
        </div>

        {/* Card inferior com informações */}
        <div className="relative bg-background rounded-t-[2rem] -mt-8 pt-6 px-4 pb-4 shadow-2xl">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-foreground">
              Pedido #{order.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {establishment?.nome || "Estabelecimento"}
            </p>
          </div>

          {/* Progress Steps */}
          <div
            className={`busquei-card mb-4 transition-all ${
              highlight ? "ring-2 ring-primary ring-offset-2 animate-scale-in" : ""
            }`}
          >
            <div className="mb-4">
              <Progress value={progressValue} className="h-2 mb-6" />
            </div>
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors text-xs ${
                      step.status === "completed"
                        ? "busquei-gradient text-white"
                        : step.status === "active"
                        ? "busquei-gradient text-white ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-[10px] text-center font-medium ${
                      step.status === "pending"
                        ? "text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Person Card */}
          {driver ? (
            <div className="busquei-card mb-4">
              <h2 className="busquei-subtitle mb-3">Seu Entregador</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full busquei-gradient flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {driver.nome.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{driver.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Bike className="h-4 w-4" />
                    <span>{driver.veiculo}</span>
                    {driver.placa && (
                      <>
                        <span>•</span>
                        <span>{driver.placa}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="busquei-card mb-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Package className="h-5 w-5" />
                <p className="text-sm">Aguardando entregador aceitar o pedido...</p>
              </div>
            </div>
          )}

          {/* Delivery Estimate */}
          <div className="busquei-card mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Previsão de entrega
              </p>
              <p className="text-2xl font-bold text-primary">
                {establishment?.tempo_entrega_min
                  ? `${establishment.tempo_entrega_min}–${establishment.tempo_entrega_min + 8} min`
                  : "12–18 min"}
              </p>
            </div>
          </div>

          {/* Delivery Person Location */}
          {driverCoords && (
            <div className="busquei-card mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full busquei-gradient flex items-center justify-center flex-shrink-0">
                  <Bike className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Localização do entregador
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    O entregador está em movimento
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{driverCoords[0].toFixed(4)}° S, {Math.abs(driverCoords[1]).toFixed(4)}° W</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Call Button */}
          {driver && (
            <button
              onClick={() => {
                if (driver.telefone) {
                  window.location.href = `tel:${driver.telefone}`;
                } else {
                  toast.info("Telefone do entregador não disponível");
                }
              }}
              className="busquei-button w-full mb-4"
            >
              <Phone className="h-5 w-5" />
              Ligar para o entregador
            </button>
          )}
        </div>
      </div>

      <BottomTabs
        items={[
          { icon: Home, label: "Início", path: "/cliente" },
          { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho" },
          { icon: ClipboardList, label: "Pedidos", path: "/cliente/tracking" },
          { icon: User, label: "Perfil", path: "/cliente/perfil" },
        ]}
      />

      {/* Modal de pedido entregue */}
      <AlertDialog open={showDeliveredModal} onOpenChange={setShowDeliveredModal}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-2xl">
              🎉 Pedido Entregue!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Seu pedido foi entregue com sucesso. Aproveite!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={() => {
                setShowDeliveredModal(false);
                navigate("/cliente");
              }}
              className="busquei-gradient w-full"
            >
              Voltar ao início
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeliveredModal(false)}
              className="w-full"
            >
              Fechar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TrackingPage;
