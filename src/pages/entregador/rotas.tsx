import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEntregadorRole } from "@/hooks/useEntregadorRole";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Clock, Package, CheckCircle, Truck, Navigation } from "lucide-react";
import { toast } from "sonner";
import {
  getDriver,
  listarEntregas,
  Delivery,
} from "@/services/entregadorService";
import {
  listarPedidosAguardandoEntregador,
  vincularEntregador,
  OrderWithItems,
} from "@/services/orderService";
import { listenOrders } from "@/services/realtimeService";
import {
  getActiveDelivery,
  updateDeliveryStatus,
  subscribeDelivery,
  unsubscribeAll,
  getStatusLabel,
  getNextStatus,
  DeliveryTrackingData,
} from "@/services/deliveryTrackingService";
import MapRadar from "@/components/map/MapRadar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const EntregadorRotasPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntregadorUser, loading: roleLoading } = useEntregadorRole();
  const [entregas, setEntregas] = useState<Delivery[]>([]);
  const [pedidosDisponiveis, setPedidosDisponiveis] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [activeDelivery, setActiveDelivery] = useState<DeliveryTrackingData | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Stores para o MapRadar
  const [mapStores, setMapStores] = useState<Array<{
    id: string;
    nome: string;
    endereco: string;
    latitude: number;
    longitude: number;
    categoria?: string;
  }>>([]);

  useEffect(() => {
    if (roleLoading) return;

    if (!isEntregadorUser) {
      navigate("/");
      return;
    }

    if (user) {
      inicializar();
    }

    // Listener realtime para pedidos
    const unsubscribe = listenOrders((payload) => {
      if (
        payload.eventType === "UPDATE" &&
        payload.new?.status === "aguardando-entregador"
      ) {
        toast.success("Novo pedido disponível!");
        listarPedidosAguardandoEntregador().then(setPedidosDisponiveis);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeAll();
      stopLocationTracking();
    };
  }, [roleLoading, isEntregadorUser, user, navigate]);

  // Subscribe to delivery updates
  useEffect(() => {
    if (!driverId) return;

    const unsubscribe = subscribeDelivery(driverId, async () => {
      // Recarregar dados quando houver update
      const delivery = await getActiveDelivery(driverId);
      setActiveDelivery(delivery);
      updateMapStores(delivery);
    });

    return unsubscribe;
  }, [driverId]);

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

    // Carregar entrega ativa
    const delivery = await getActiveDelivery(driver.id);
    setActiveDelivery(delivery);
    updateMapStores(delivery);

    // Iniciar tracking de localização se houver entrega ativa
    if (delivery) {
      startLocationTracking();
    }

    // Carregar entregas e pedidos disponíveis
    const [entregasData, pedidosData] = await Promise.all([
      listarEntregas(driver.id),
      listarPedidosAguardandoEntregador(),
    ]);

    setEntregas(entregasData);
    setPedidosDisponiveis(pedidosData);
    setLoading(false);
  };

  const updateMapStores = (delivery: DeliveryTrackingData | null) => {
    if (!delivery) {
      setMapStores([]);
      return;
    }

    const stores = [
      {
        id: "establishment",
        nome: delivery.establishment.nome,
        endereco: "Estabelecimento",
        latitude: delivery.establishment.latitude,
        longitude: delivery.establishment.longitude,
        categoria: "Retirada"
      },
      {
        id: "customer",
        nome: delivery.customer.nome,
        endereco: delivery.order.endereco_entrega,
        latitude: delivery.customer.latitude,
        longitude: delivery.customer.longitude,
        categoria: "Entrega"
      }
    ];

    setMapStores(stores);
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setDriverLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  };

  const stopLocationTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
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

  const handleUpdateStatus = async (newStatus: string) => {
    if (!activeDelivery) return;

    const resultado = await updateDeliveryStatus(activeDelivery.delivery.id, newStatus);

    if (resultado.success) {
      if (newStatus === "entregue") {
        setShowDeliveredModal(true);
        stopLocationTracking();
        setActiveDelivery(null);
        setMapStores([]);
      } else {
        toast.success(`Status atualizado: ${getStatusLabel(newStatus)}`);
      }
      inicializar();
    } else {
      toast.error(resultado.error || "Erro ao atualizar status");
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      aceito: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      retirado: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      a_caminho: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      entregue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const estimatedTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 25);
    return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[50vh] w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="busquei-gradient px-4 py-4 text-white">
        <h1 className="text-xl font-bold">Rotas e Entregas</h1>
        <p className="text-sm opacity-90">
          {activeDelivery ? "Entrega em andamento" : "Aguardando pedidos"}
        </p>
      </div>

      {/* Map Section - 70% */}
      <div className="flex-1 min-h-[50vh] relative">
        {activeDelivery ? (
          <div className="h-full p-4">
            <MapRadar
              stores={mapStores}
              onStoreClick={() => {}}
              onLocationChange={(coords) => setDriverLocation(coords)}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-muted/30">
            <div className="text-center p-8">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Aceite um pedido para ver a rota
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Card - 30% */}
      <div className="bg-card/95 backdrop-blur-md border-t border-border shadow-lg rounded-t-3xl -mt-4 relative z-10">
        {activeDelivery ? (
          <div className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(activeDelivery.delivery.status)}>
                {getStatusLabel(activeDelivery.delivery.status)}
              </Badge>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Previsão: {estimatedTime()}</span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {activeDelivery.customer.nome}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activeDelivery.order.endereco_entrega}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                if (activeDelivery.customer.telefone) {
                  window.open(`tel:${activeDelivery.customer.telefone}`);
                } else {
                  toast.info("Telefone não disponível");
                }
              }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Falar com o Cliente
            </Button>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={activeDelivery.delivery.status === "aceito" ? "default" : "outline"}
                size="sm"
                disabled={activeDelivery.delivery.status !== "aceito"}
                onClick={() => handleUpdateStatus("retirado")}
                className="flex flex-col h-auto py-3"
              >
                <Package className="w-5 h-5 mb-1" />
                <span className="text-xs">Retirei</span>
              </Button>

              <Button
                variant={activeDelivery.delivery.status === "retirado" ? "default" : "outline"}
                size="sm"
                disabled={activeDelivery.delivery.status !== "retirado"}
                onClick={() => handleUpdateStatus("a_caminho")}
                className="flex flex-col h-auto py-3"
              >
                <Truck className="w-5 h-5 mb-1" />
                <span className="text-xs">A Caminho</span>
              </Button>

              <Button
                variant={activeDelivery.delivery.status === "a_caminho" ? "default" : "outline"}
                size="sm"
                disabled={activeDelivery.delivery.status !== "a_caminho"}
                onClick={() => handleUpdateStatus("entregue")}
                className="flex flex-col h-auto py-3 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-5 h-5 mb-1" />
                <span className="text-xs">Entregue</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Pedidos Disponíveis */}
            {pedidosDisponiveis.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Pedidos Disponíveis ({pedidosDisponiveis.length})
                </h3>

                {pedidosDisponiveis.slice(0, 3).map((pedido) => (
                  <Card key={pedido.id} className="p-4 border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          #{pedido.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {pedido.establishments?.nome || "Estabelecimento"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {pedido.order_items?.length || 0} itens
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary">
                        R$ {(pedido.valor_total || 0).toFixed(2)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleAceitarPedido(pedido.id)}
                      >
                        Aceitar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum pedido disponível no momento
                </p>
              </div>
            )}

            {/* Entregas Recentes */}
            {entregas.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Últimas Entregas
                </h3>
                <div className="space-y-2">
                  {entregas.slice(0, 2).map((entrega) => (
                    <div
                      key={entrega.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-foreground">
                        #{entrega.order_id?.slice(0, 8)}
                      </span>
                      <Badge className={getStatusColor(entrega.status)} variant="secondary">
                        {getStatusLabel(entrega.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Entrega Concluída */}
      <Dialog open={showDeliveredModal} onOpenChange={setShowDeliveredModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              Pedido Entregue!
            </DialogTitle>
            <DialogDescription className="text-center">
              A entrega foi concluída com sucesso. Obrigado pelo seu trabalho!
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowDeliveredModal(false)}
            className="w-full mt-4"
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EntregadorRotasPage;
