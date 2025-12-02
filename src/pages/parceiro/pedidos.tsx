import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParceiroRole } from "@/hooks/useParceiroRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Clock, Package, CheckCircle, Radio } from "lucide-react";
import {
  listarPedidosDoEstabelecimento,
  atualizarStatusPedido,
  OrderWithItems,
} from "@/services/orderService";
import { toast } from "sonner";
import { listenOrders } from "@/services/realtimeService";

const ParceiroPedidosPage = () => {
  const navigate = useNavigate();
  const { isParceiroUser, loading: roleLoading } = useParceiroRole();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [pedidos, setPedidos] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedOrders, setHighlightedOrders] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);

  // TODO: Pegar o establishment_id do parceiro logado
  const establishmentId = "seu-establishment-id-aqui";

  useEffect(() => {
    if (roleLoading) return;

    if (!isParceiroUser) {
      navigate("/");
      return;
    }

    carregarPedidos();

    // Configurar listener realtime
    const unsubscribe = listenOrders((payload) => {
      const isMyEstablishment =
        payload.new?.establishment_id === establishmentId ||
        payload.old?.establishment_id === establishmentId;

      if (!isMyEstablishment) return;

      setIsLive(true);

      if (payload.eventType === "INSERT") {
        // Novo pedido
        toast.success("Novo pedido recebido!", {
          description: `Pedido #${payload.new.id.slice(0, 8)}`,
        });
        carregarPedidos();
        
        // Highlight no novo pedido
        setHighlightedOrders((prev) => new Set(prev).add(payload.new.id));
        setTimeout(() => {
          setHighlightedOrders((prev) => {
            const newSet = new Set(prev);
            newSet.delete(payload.new.id);
            return newSet;
          });
        }, 3000);
      } else if (payload.eventType === "UPDATE") {
        // Status atualizado
        setPedidos((prev) =>
          prev.map((p) =>
            p.id === payload.new.id
              ? { ...p, status: payload.new.status, updated_at: payload.new.updated_at }
              : p
          )
        );
        
        setHighlightedOrders((prev) => new Set(prev).add(payload.new.id));
        setTimeout(() => {
          setHighlightedOrders((prev) => {
            const newSet = new Set(prev);
            newSet.delete(payload.new.id);
            return newSet;
          });
        }, 2000);
      }

      setTimeout(() => setIsLive(false), 3000);
    });

    return () => {
      unsubscribe();
    };
  }, [roleLoading, isParceiroUser, navigate, establishmentId]);

  const carregarPedidos = async () => {
    setLoading(true);
    const data = await listarPedidosDoEstabelecimento(establishmentId);
    setPedidos(data);
    setLoading(false);
  };

  const handleAtualizarStatus = async (orderId: string, novoStatus: string) => {
    const resultado = await atualizarStatusPedido(orderId, novoStatus);

    if (resultado.success) {
      toast.success("Status atualizado!");
      carregarPedidos();
    } else {
      toast.error(resultado.error || "Erro ao atualizar status");
    }
  };

  const pedidosFiltrados =
    filtroStatus === "todos"
      ? pedidos
      : pedidos.filter((p) => p.status === filtroStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <ClipboardList className="w-5 h-5 text-yellow-500" />;
      case "preparando":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "pronto":
        return <Package className="w-5 h-5 text-orange-500" />;
      case "entregue":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "preparando":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pronto":
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
      case "preparando":
        return "Preparando";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      default:
        return status;
    }
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Pedidos</GradientHeader>

      {/* Live Indicator */}
      {isLive && (
        <div className="mb-4 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-xl p-3 flex items-center gap-2 animate-fade-in">
          <Radio className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            Atualizando ao vivo
          </span>
        </div>
      )}

      {/* Filtros */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Filtrar por status:</label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="preparando">Preparando</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="aguardando-entregador">Aguardando Entregador</SelectItem>
              <SelectItem value="retirado">Retirado</SelectItem>
              <SelectItem value="a_caminho">A Caminho</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {pedidosFiltrados.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <p className="text-center text-muted-foreground">
              Nenhum pedido encontrado com este filtro.
            </p>
          </Card>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <Card
              key={pedido.id}
              className={`p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all ${
                highlightedOrders.has(pedido.id)
                  ? "ring-2 ring-primary ring-offset-2 animate-scale-in"
                  : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(pedido.status)}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        #{pedido.id.slice(0, 8)}
                      </h3>
                      <Badge className={getStatusColor(pedido.status)}>
                        {getStatusLabel(pedido.status)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Pedido #{pedido.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.order_items?.length || 0} itens •{" "}
                      {new Date(pedido.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    R$ {pedido.valor_total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Ações baseadas no status */}
              <div className="flex gap-2">
                {pedido.status === "pendente" && (
                  <Button
                    onClick={() => handleAtualizarStatus(pedido.id, "preparando")}
                    className="flex-1"
                  >
                    Aceitar Pedido
                  </Button>
                )}
                {pedido.status === "preparando" && (
                  <Button
                    onClick={() => handleAtualizarStatus(pedido.id, "pronto")}
                    className="flex-1"
                  >
                    Marcar como Pronto
                  </Button>
                )}
                {pedido.status === "pronto" && (
                  <Button
                    onClick={() =>
                      handleAtualizarStatus(pedido.id, "aguardando-entregador")
                    }
                    className="flex-1"
                  >
                    Aguardando Entregador
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </BusqueiLayout>
  );
};

export default ParceiroPedidosPage;
