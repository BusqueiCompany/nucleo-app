import { Home, Package, ShoppingBag, User, Store, Wine, Pill, PawPrint, Droplets, Flame, Brain, Crown, AlertTriangle, ChevronRight, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import SearchBar from "@/components/ui/SearchBar";
import CategoryButton from "@/components/ui/CategoryButton";
import BottomTabs from "@/components/ui/BottomTabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useEffect, useState } from "react";
import { listarAtivas, PriorityRoute } from "@/services/priorityRoutesService";
import { Skeleton } from "@/components/ui/skeleton";
import { listenPriorityRoutes } from "@/services/realtimeService";
import { toast } from "sonner";

const ClientePage = () => {
  const navigate = useNavigate();
  const { isActive: isVIP } = useVipStatus();
  const [rotasPrioritarias, setRotasPrioritarias] = useState<PriorityRoute[]>([]);
  const [loadingRotas, setLoadingRotas] = useState(true);
  const [highlightedRoutes, setHighlightedRoutes] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    carregarRotas();

    // Configurar listener realtime para rotas prioritárias
    const unsubscribe = listenPriorityRoutes((payload) => {
      if (payload.eventType === "INSERT" && payload.new?.ativo) {
        // Nova rota ativa
        setIsLive(true);
        toast.success("Nova oferta especial disponível!", {
          description: payload.new.produto,
        });

        carregarRotas();

        // Highlight na nova rota
        setHighlightedRoutes((prev) => new Set(prev).add(payload.new.id));
        setTimeout(() => {
          setHighlightedRoutes((prev) => {
            const newSet = new Set(prev);
            newSet.delete(payload.new.id);
            return newSet;
          });
        }, 3000);

        setTimeout(() => setIsLive(false), 3000);
      } else if (payload.eventType === "UPDATE") {
        // Rota atualizada (ativada/desativada)
        if (payload.new?.ativo && !payload.old?.ativo) {
          // Rota foi ativada
          toast.success("Nova oferta ativada!");
        }
        carregarRotas();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const carregarRotas = async () => {
    setLoadingRotas(true);
    const rotas = await listarAtivas();
    setRotasPrioritarias(rotas);
    setLoadingRotas(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const categories = [
    { icon: Store, label: "Mercado" },
    { icon: Wine, label: "Bebidas" },
    { icon: Pill, label: "Farmácia" },
    { icon: PawPrint, label: "Petshop" },
    { icon: Droplets, label: "Água & Gás" },
  ];

  const liveFeed = [
    { name: "Padaria Artesanal", orders: 5 },
    { name: "Açougue Prime", orders: 8 },
    { name: "Mercado Próximo", orders: 12 },
  ];

  const nearbyMarkets = [
    { name: "Mercado São João", distance: "300m" },
    { name: "Supermercado Econômico", distance: "850m" },
    { name: "Mercado Central", distance: "1.2km" },
  ];

  const tabs = [
    { icon: Home, label: "Início", path: "/cliente" },
    { icon: Package, label: "Pedidos", path: "/cliente/pedidos" },
    { icon: ShoppingBag, label: "Carrinho", path: "/cliente/carrinho" },
    { icon: User, label: "Perfil", path: "/cliente/perfil" },
  ];

  return (
    <>
      <BusqueiLayout>
        <GradientHeader>{getGreeting()}, Clara!</GradientHeader>

        <div className="space-y-6">
          <SearchBar placeholder="Buscar estabelecimentos, produtos..." />

          {/* Rotas Prioritárias */}
          {!loadingRotas && rotasPrioritarias.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Ofertas Especiais
                </h2>
                {isLive && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1 animate-fade-in">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>Ao vivo</span>
                  </div>
                )}
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-2">
                  {rotasPrioritarias.map((rota) => (
                    <div
                      key={rota.id}
                      onClick={() => {
                        // TODO: implementar navegação para produto
                        navigate("/cliente/mercado");
                      }}
                      className={`relative bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-red-400/20 backdrop-blur-md rounded-[1.5rem] p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer min-w-[280px] border-2 border-amber-400/30 ${
                        highlightedRoutes.has(rota.id)
                          ? "ring-2 ring-primary ring-offset-2 animate-scale-in"
                          : ""
                      }`}
                    >
                      <div className="absolute top-3 right-3">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                      </div>
                      
                      <div className="mb-3">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {rota.produto}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {rota.establishments?.nome || "Estabelecimento"}
                        </p>
                      </div>
                      
                      <p className="text-sm text-foreground font-medium mb-4">
                        {rota.mensagem}
                      </p>
                      
                      <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-2.5 px-4 font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all">
                        <span>Pedir agora</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {loadingRotas && (
            <div>
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {/* VIP Banner */}
          {!isVIP && (
            <div
              onClick={() => navigate("/cliente/vip")}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-[1.5rem] p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-7 w-7 text-white" />
                  <h3 className="text-xl font-bold text-white">
                    Seja VIP e economize!
                  </h3>
                </div>
                <p className="text-white/90 text-sm mb-3">
                  Compare preços automaticamente e encontre as melhores ofertas
                </p>
                <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full">
                  A partir de R$ 19,90/mês
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12" />
            </div>
          )}

          {/* Categorias */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Categorias</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-2">
                {categories.map((category) => (
                  <CategoryButton
                    key={category.label}
                    icon={category.icon}
                    label={category.label}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Live Local Feed */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Live Local Feed
            </h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-2">
                {liveFeed.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer min-w-[200px]"
                  >
                    <div className="w-full h-32 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gradient-end font-medium">
                      <Flame className="h-4 w-4" />
                      <span>{item.orders} pedidos agora</span>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Mercados próximos */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Mercados próximos
            </h2>
            <div className="space-y-3">
              {nearbyMarkets.map((market, i) => (
                <div
                  key={i}
                  onClick={() => navigate("/cliente/mercado")}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl flex items-center justify-center">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {market.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {market.distance} de você
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Criar Lista Inteligente */}
          <button
            onClick={() => navigate("/cliente/lista-inteligente")}
            className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] p-4 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 font-semibold"
          >
            <Brain className="h-5 w-5" />
            <span>Criar Lista Inteligente</span>
          </button>
        </div>
      </BusqueiLayout>

      <BottomTabs items={tabs} />
    </>
  );
};

export default ClientePage;
