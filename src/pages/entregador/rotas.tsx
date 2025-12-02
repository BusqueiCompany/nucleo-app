import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntregadorRole } from "@/hooks/useEntregadorRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Navigation, Package } from "lucide-react";
import { toast } from "sonner";
import {
  getDriver,
  listarEntregas,
  atualizarStatusEntrega,
  Delivery,
} from "@/services/entregadorService";
import {
  listarPedidosAguardandoEntregador,
  vincularEntregador,
  OrderWithItems,
} from "@/services/orderService";

const EntregadorRotasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntregadorUser, loading: roleLoading } = useEntregadorRole();
  const [entregas, setEntregas] = useState<Delivery[]>([]);
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState<OrderWithItems[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (roleLoading) return;

    if (!isEntregadorUser) {
      navigate("/");
      return;
    }

    if (user) {
      inicializar();
    }
  }, [roleLoading, isEntregadorUser, user, navigate]);

  const inicializar = async () => {
    if (!user) return;

    setLoading(true);
    const driver = await getDriver(user.id);

    if (!driver) {
      toast.error("Perfil de entregador não encontrado");
      navigate("/entregador");
      return;
    }

    setDriverId(driver.id);

    // Carregar entregas do driver
    const entregasData = await listarEntregas(driver.id);
    setEntregas(entregasData);

    // Carregar pedidos disponíveis
    const pedidosData = await listarPedidosAguardandoEntregador();
    setPedidosDisponiveis(pedidosData);

    setLoading(false);
  };

  const handleAceitarPedido = async (orderId: string) => {
    if (!driverId) {
      toast.error("Driver ID não encontrado");
      return;
    }

    const resultado = await vincularEntregador(orderId, driverId, 2500, 4.99);

    if (resultado.success) {
      toast.success("Pedido aceito!");
      inicializar();
    } else {
      toast.error(resultado.error || "Erro ao aceitar pedido");
    }
  };

  const handleAtualizarStatus = async (deliveryId: string, novoStatus: string) => {
    const resultado = await atualizarStatusEntrega(deliveryId, novoStatus);

    if (resultado.success) {
      toast.success("Status atualizado!");
      if (user) inicializar();
    } else {
      toast.error(resultado.error || "Erro ao atualizar status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "aceito":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "retirado":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "a_caminho":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "entregue":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "aceito":
        return "Aceito";
      case "retirado":
        return "Retirado";
      case "a_caminho":
        return "A Caminho";
      case "entregue":
        return "Entregue";
      default:
        return status;
    }
  };

  const getProximoStatus = (statusAtual: string): string | null => {
    switch (statusAtual) {
      case "pendente":
        return "aceito";
      case "aceito":
        return "retirado";
      case "retirado":
        return "a_caminho";
      case "a_caminho":
        return "entregue";
      default:
        return null;
    }
  };

  if (roleLoading || loading) {
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

  return (
    <BusqueiLayout>
      <GradientHeader>Rotas e Entregas</GradientHeader>

      {/* Mapa Placeholder */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Mapa de entregas (em breve)</p>
          </div>
        </div>
      </Card>

      {/* Pedidos Disponíveis */}
      {pedidosDisponiveis.length > 0 && (
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Pedidos Disponíveis ({pedidosDisponiveis.length})
          </h3>

          {pedidosDisponiveis.map((pedido) => (
            <Card
              key={pedido.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Pedido #{pedido.id.slice(0, 8)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {pedido.establishments?.nome || "Estabelecimento"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pedido.order_items?.length || 0} itens
                  </p>
                </div>
                <Badge className="bg-orange-100 text-orange-800">
                  Aguardando
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {pedido.valor_total.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Taxa entrega: R$ 4,99
                  </p>
                </div>

                <Button onClick={() => handleAceitarPedido(pedido.id)}>
                  Aceitar Pedido
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de Entregas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Minhas Entregas ({entregas.length})
        </h3>

        {entregas.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma entrega no momento.
              </p>
            </div>
          </Card>
        ) : (
          entregas.map((entrega) => (
            <Card
              key={entrega.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-primary" />
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Pedido #{entrega.order_id?.slice(0, 8) || "---"}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {entrega.distancia_metros
                        ? `${(entrega.distancia_metros / 1000).toFixed(1)} km`
                        : "Distância não informada"}
                    </p>
                  </div>
                </div>

                <Badge className={getStatusColor(entrega.status)}>
                  {getStatusLabel(entrega.status)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    R$ {entrega.valor?.toFixed(2) || "0.00"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entrega.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {getProximoStatus(entrega.status) && (
                  <Button
                    onClick={() =>
                      handleAtualizarStatus(
                        entrega.id,
                        getProximoStatus(entrega.status)!
                      )
                    }
                  >
                    {entrega.status === "pendente" && "Aceitar"}
                    {entrega.status === "aceito" && "Marcar Retirado"}
                    {entrega.status === "retirado" && "A Caminho"}
                    {entrega.status === "a_caminho" && "Finalizar Entrega"}
                  </Button>
                )}

                {entrega.status === "entregue" && (
                  <Badge variant="outline" className="text-green-600">
                    Concluída
                  </Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </BusqueiLayout>
  );
};

export default EntregadorRotasPage;
