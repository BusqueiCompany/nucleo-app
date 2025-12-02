import { useNavigate, useSearchParams } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, Phone, Bike, MapPin, Radio, MessageCircle, Clock } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { buscarPedidoPorId, OrderWithItems } from "@/services/orderService";
import { Skeleton } from "@/components/ui/skeleton";
import { listenToOrder } from "@/services/realtimeService";
import { toast } from "sonner";
import TrackingMap from "@/components/map/TrackingMap";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

// Posições mock para demonstração (Zona Oeste RJ)
const MOCK_POSITIONS = {
  establishment: { lat: -22.9064, lng: -43.5607 },
  customer: { lat: -22.9150, lng: -43.5500 },
  driver: { lat: -22.9100, lng: -43.5550 }
};

const TrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [pedido, setPedido] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [driverPosition, setDriverPosition] = useState(MOCK_POSITIONS.driver);

  // Simular movimento do entregador
  useEffect(() => {
    if (pedido?.status === "a_caminho" || pedido?.status === "retirado") {
      const interval = setInterval(() => {
        setDriverPosition(prev => ({
          lat: prev.lat + (Math.random() - 0.3) * 0.0008,
          lng: prev.lng + (Math.random() - 0.3) * 0.0008
        }));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [pedido?.status]);

  useEffect(() => {
    if (!orderId) {
      navigate("/cliente");
      return;
    }

    carregarPedido();

    // Configurar listener realtime
    const unsubscribe = listenToOrder(orderId, (payload) => {
      if (payload.eventType === "UPDATE") {
        setIsLive(true);
        setHighlight(true);
        
        // Atualizar pedido com novo status
        setPedido((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: payload.new.status,
            updated_at: payload.new.updated_at,
          };
        });

        // Mostrar toast com mudança de status
        toast.success(`Status atualizado: ${getStatusLabel(payload.new.status)}`);

        // Mostrar modal quando entregue
        if (payload.new.status === "entregue") {
          setShowDeliveredModal(true);
        }

        // Remover highlight após animação
        setTimeout(() => setHighlight(false), 2000);
        setTimeout(() => setIsLive(false), 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [orderId, navigate]);

  const carregarPedido = async () => {
    if (!orderId) return;

    setLoading(true);
    const data = await buscarPedidoPorId(orderId);
    setPedido(data);
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

  const isDriverOnRoute = pedido?.status === "a_caminho" || pedido?.status === "retirado";

  const steps = pedido ? getSteps(pedido.status) : [];
  const currentStep = steps.findIndex((s) => s.status === "active") + 1;
  const progressValue = (currentStep / steps.length) * 100;

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

  if (!pedido) {
    return (
      <BusqueiLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Pedido não encontrado</p>
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <>
      <BusqueiLayout>
        {/* Live Indicator */}
        {isLive && (
          <div className="mb-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
            <Radio className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Atualizado em tempo real
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Pedido #{pedido.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {pedido.establishments?.nome || "Estabelecimento"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div
          className={`bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4 transition-all ${
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
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    step.status === "completed"
                      ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white"
                      : step.status === "active"
                      ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white ring-4 ring-gradient-start/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <p
                  className={`text-xs text-center font-medium ${
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

        {/* Mapa com Tracking Real */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] shadow-md mb-4 overflow-hidden">
          <div className="h-64 relative">
            <TrackingMap
              establishmentPosition={MOCK_POSITIONS.establishment}
              customerPosition={MOCK_POSITIONS.customer}
              driverPosition={isDriverOnRoute ? driverPosition : undefined}
              showDriverRoute={isDriverOnRoute}
              establishmentName={pedido.establishments?.nome || "Estabelecimento"}
              driverName="Carlos Matos"
            />
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="bg-primary/10 backdrop-blur-md rounded-[1.5rem] p-4 shadow-md mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previsão de entrega</p>
              <p className="text-xl font-bold text-foreground">12–18 min</p>
            </div>
          </div>
        </div>

        {/* Delivery Person Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Seu Entregador
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              CM
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Carlos Matos</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Bike className="h-4 w-4" />
                <span>Moto</span>
                <span className="ml-2">•</span>
                <span className="ml-2">RST-4E22</span>
              </div>
              {isDriverOnRoute && (
                <p className="text-xs text-primary mt-1 font-medium">
                  A caminho do seu endereço
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-11 w-11 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => window.open("tel:+5521999998888", "_self")}
              >
                <Phone className="h-5 w-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">
                Endereço de entrega
              </h3>
              <p className="text-sm text-muted-foreground">
                {pedido.endereco_entrega}
              </p>
            </div>
          </div>
        </div>

        {/* Call Button */}
        <button
          onClick={() => window.open("tel:+5521999998888", "_self")}
          className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold flex items-center justify-center gap-2 mb-4"
        >
          <Phone className="h-5 w-5" />
          Ligar para o entregador
        </button>
      </BusqueiLayout>

      <BottomTabs
        items={[
          { icon: Home, label: "Início", path: "/cliente" },
          { icon: ShoppingCart, label: "Carrinho", path: "/cliente/carrinho" },
          { icon: ClipboardList, label: "Pedidos", path: "/cliente/tracking" },
          { icon: User, label: "Perfil", path: "/cliente/perfil" },
        ]}
      />

      {/* Modal de pedido entregue */}
      <Dialog open={showDeliveredModal} onOpenChange={setShowDeliveredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <span className="text-2xl">Pedido Entregue!</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Seu pedido foi entregue com sucesso. Esperamos que você aproveite!
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => {
                setShowDeliveredModal(false);
                navigate("/cliente");
              }}
            >
              Voltar para Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrackingPage;
