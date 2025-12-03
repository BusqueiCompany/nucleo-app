import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmRole } from "@/hooks/useAdmRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Truck,
  Store,
  Package,
  Flame,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
} from "lucide-react";
import {
  listarTodosEntregadores,
  listarEstabelecimentos,
  listarPedidosAtivos,
  generateHeatmapFromOrders,
  generateHeatmapFromDrivers,
  subscribeDrivers,
  subscribeOrders,
  unsubscribeAll,
  DriverMarker,
  EstablishmentMarker,
  OrderMarker,
  HeatmapPoint,
} from "@/services/adminMapService";
import MapADM from "@/components/map/MapADM";
import { toast } from "sonner";

const AdmMapaPage = () => {
  const navigate = useNavigate();
  const { isAdmUser, loading: roleLoading } = useAdmRole();

  // Data states
  const [drivers, setDrivers] = useState<DriverMarker[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentMarker[]>([]);
  const [orders, setOrders] = useState<OrderMarker[]>([]);
  const [heatmapPoints, setHeatmapPoints] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Visibility toggles
  const [showDrivers, setShowDrivers] = useState(true);
  const [showEstablishments, setShowEstablishments] = useState(true);
  const [showOrders, setShowOrders] = useState(true);
  const [showOrdersHeatmap, setShowOrdersHeatmap] = useState(false);
  const [showDriversHeatmap, setShowDriversHeatmap] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check role and load data
  useEffect(() => {
    if (roleLoading) return;

    if (!isAdmUser) {
      toast.error("Acesso negado");
      navigate("/cliente");
      return;
    }

    loadAllData();
    setupRealtimeSubscriptions();

    return () => {
      unsubscribeAll();
    };
  }, [roleLoading, isAdmUser, navigate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [driversData, establishmentsData, ordersData] = await Promise.all([
        listarTodosEntregadores(),
        listarEstabelecimentos(),
        listarPedidosAtivos(),
      ]);

      setDrivers(driversData);
      setEstablishments(establishmentsData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados do mapa");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    subscribeDrivers(async () => {
      setIsLive(true);
      const driversData = await listarTodosEntregadores();
      setDrivers(driversData);
      setTimeout(() => setIsLive(false), 2000);
    });

    subscribeOrders(async () => {
      setIsLive(true);
      const ordersData = await listarPedidosAtivos();
      setOrders(ordersData);
      setTimeout(() => setIsLive(false), 2000);
    });
  };

  const handleToggleOrdersHeatmap = async (checked: boolean) => {
    setShowOrdersHeatmap(checked);
    if (checked) {
      setShowDriversHeatmap(false);
      const points = await generateHeatmapFromOrders();
      setHeatmapPoints(points);
    } else if (!showDriversHeatmap) {
      setHeatmapPoints([]);
    }
  };

  const handleToggleDriversHeatmap = async (checked: boolean) => {
    setShowDriversHeatmap(checked);
    if (checked) {
      setShowOrdersHeatmap(false);
      const points = await generateHeatmapFromDrivers();
      setHeatmapPoints(points);
    } else if (!showOrdersHeatmap) {
      setHeatmapPoints([]);
    }
  };

  const handleRefresh = () => {
    loadAllData();
    toast.success("Dados atualizados");
  };

  // Stats
  const onlineDrivers = drivers.filter((d) => d.status_online).length;
  const activeOrdersCount = orders.length;

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md p-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-[60vh] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <MapADM
          drivers={drivers}
          establishments={establishments}
          orders={orders}
          heatmapPoints={heatmapPoints}
          showDrivers={showDrivers}
          showEstablishments={showEstablishments}
          showOrders={showOrders}
          showHeatmap={showOrdersHeatmap || showDriversHeatmap}
          heatmapType={showDriversHeatmap ? "drivers" : "orders"}
        />
      </div>

      {/* Live Indicator */}
      {isLive && (
        <div className="absolute top-4 right-4 z-50 bg-green-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
          <Radio className="w-4 h-4" />
          <span className="text-sm font-medium">Atualizando...</span>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-50 bg-card/95 backdrop-blur-md border border-border shadow-lg p-2 rounded-r-xl transition-all duration-300"
        style={{ left: sidebarOpen ? "280px" : "0" }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-5 h-5 text-foreground" />
        ) : (
          <ChevronRight className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* Floating Sidebar */}
      <div
        className={`absolute top-4 bottom-4 left-4 z-40 w-[260px] bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl transition-transform duration-300 overflow-hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+20px)]"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="busquei-gradient p-4">
            <h1 className="text-lg font-bold text-white">Mapa ADM</h1>
            <p className="text-sm text-white/80">Visão em tempo real</p>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-border/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">{onlineDrivers}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-500">
                  {activeOrdersCount}
                </p>
                <p className="text-xs text-muted-foreground">Pedidos</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Store className="w-4 h-4" />
                Camadas do Mapa
              </h3>

              {/* Entregadores Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Truck className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Entregadores
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {drivers.length} total
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showDrivers}
                  onCheckedChange={setShowDrivers}
                />
              </div>

              {/* Estabelecimentos Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Store className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Estabelecimentos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {establishments.length} total
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showEstablishments}
                  onCheckedChange={setShowEstablishments}
                />
              </div>

              {/* Pedidos Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pedidos Ativos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {orders.length} em andamento
                    </p>
                  </div>
                </div>
                <Switch checked={showOrders} onCheckedChange={setShowOrders} />
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4" />
                Heatmap
              </h3>

              {/* Heatmap Pedidos */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Pedidos
                    </p>
                    <p className="text-xs text-muted-foreground">Últimos 30min</p>
                  </div>
                </div>
                <Switch
                  checked={showOrdersHeatmap}
                  onCheckedChange={handleToggleOrdersHeatmap}
                />
              </div>

              {/* Heatmap Entregadores */}
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Entregadores
                    </p>
                    <p className="text-xs text-muted-foreground">Densidade</p>
                  </div>
                </div>
                <Switch
                  checked={showDriversHeatmap}
                  onCheckedChange={handleToggleDriversHeatmap}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-border/50">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Dados
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-40 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-lg">
        <h4 className="text-xs font-semibold text-foreground mb-3">Legenda</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-muted-foreground">Entregador Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-xs text-muted-foreground">Entregador Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Estabelecimento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-muted-foreground">Pedido Ativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmMapaPage;
