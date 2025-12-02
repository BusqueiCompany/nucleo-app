import { useNavigate, useSearchParams } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, Phone, Bike, MapPin } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { buscarPedidoPorId, OrderWithItems } from "@/services/orderService";
import { Skeleton } from "@/components/ui/skeleton";

const TrackingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const [pedido, setPedido] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/cliente");
      return;
    }

    carregarPedido();
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
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
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
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
          <div className="bg-gradient-to-br from-gradient-start/10 to-gradient-end/10 rounded-[1rem] h-48 flex items-center justify-center">
            <p className="text-muted-foreground font-medium">Mapa aqui</p>
          </div>
        </div>

        {/* Delivery Estimate */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Previsão de entrega
            </p>
            <p className="text-2xl font-bold text-gradient-end">
              Chega em 12–18 min
            </p>
          </div>
        </div>

        {/* Delivery Person Location */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center flex-shrink-0">
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
                <span>-23.5505° S, -46.6333° W</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Button */}
        <button
          onClick={() => alert("Ligando para o entregador...")}
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
    </>
  );
};

export default TrackingPage;
