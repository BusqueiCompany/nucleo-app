import { Home, Package, ShoppingBag, User, Store, Wine, Pill, PawPrint, Droplets, Smartphone, Tag, Crown, AlertTriangle, ChevronRight, Radio, MapPin, Grid3x3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useEffect, useState } from "react";
import { listarAtivas, PriorityRoute } from "@/services/priorityRoutesService";
import { listenPriorityRoutes } from "@/services/realtimeService";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import BottomTabs from "@/components/ui/BottomTabs";

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
    { icon: Store, label: "Mercado", path: "/cliente/mercado" },
    { icon: ShoppingBag, label: "Padaria", path: "/cliente/mercado" },
    { icon: Wine, label: "Bebidas", path: "/cliente/mercado" },
    { icon: Pill, label: "Farmácia", path: "/cliente/mercado" },
    { icon: PawPrint, label: "Petshop", path: "/cliente/mercado" },
    { icon: Smartphone, label: "Celulares", path: "/cliente/mercado" },
    { icon: Tag, label: "Promoções", path: "/cliente/mercado" },
    { icon: Crown, label: "VIP", path: "/cliente/vip" },
    { icon: Grid3x3, label: "Todos", path: "/cliente/mercado" },
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
    { icon: Package, label: "Pedidos", path: "/cliente/tracking" },
    { icon: ShoppingBag, label: "Carrinho", path: "/cliente/carrinho" },
    { icon: User, label: "Perfil", path: "/cliente/perfil" },
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary via-primary to-gradient-end px-6 pt-8 pb-6 rounded-b-[2rem] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border-2 border-white/30">
                <AvatarImage src="" />
                <AvatarFallback className="bg-white/20 text-white font-semibold">
                  CL
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/80 text-sm">Olá,</p>
                <h2 className="text-white text-xl font-bold">Clara</h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-white/90 mb-4">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Rua das Flores, 123 - Centro</span>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos, mercados..."
              className="w-full bg-white rounded-2xl px-4 py-3 pl-12 text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              onClick={() => navigate("/cliente/mercado")}
            />
            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="px-6 space-y-6 mt-6">
          {/* Priority Routes */}
          {!loadingRotas && rotasPrioritarias.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Ofertas Especiais
                </h2>
                {isLive && (
                  <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                    <Radio className="h-3 w-3 mr-1 animate-pulse" />
                    Ao vivo
                  </Badge>
                )}
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-2">
                  {rotasPrioritarias.map((rota) => (
                    <div
                      key={rota.id}
                      onClick={() => navigate("/cliente/mercado")}
                      className={`relative bg-gradient-to-br from-amber-400/20 via-orange-400/20 to-red-400/20 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer min-w-[280px] border border-amber-400/30 ${
                        highlightedRoutes.has(rota.id) ? "ring-2 ring-amber-500 animate-scale-in" : ""
                      }`}
                    >
                      <div className="absolute top-3 right-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-1">{rota.produto}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{rota.establishments?.nome}</p>
                      <p className="text-sm text-foreground mb-4">{rota.mensagem}</p>
                      <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl py-2 px-4 font-semibold text-sm flex items-center justify-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all">
                        Pedir agora
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* VIP Banner */}
          {!isVIP && (
            <div
              onClick={() => navigate("/cliente/vip")}
              className="bg-gradient-to-r from-vip via-amber-400 to-amber-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-6 w-6 text-vip-foreground" />
                  <h3 className="text-lg font-bold text-vip-foreground">Seja VIP e economize!</h3>
                </div>
                <p className="text-vip-foreground/90 text-sm mb-3">
                  Compare preços e encontre as melhores ofertas
                </p>
                <div className="inline-block bg-vip-foreground/20 backdrop-blur-sm text-vip-foreground text-xs font-semibold px-4 py-2 rounded-full">
                  A partir de R$ 19,90/mês
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Categorias</h2>
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category) => (
                <button
                  key={category.label}
                  onClick={() => navigate(category.path)}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                    <category.icon className="h-7 w-7 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ofertas do Dia */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Ofertas do Dia</h2>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    onClick={() => navigate("/cliente/mercado")}
                    className="min-w-[160px] bg-card rounded-2xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-full h-24 bg-gradient-to-br from-primary/20 to-gradient-end/20 rounded-xl mb-3" />
                    <h3 className="font-semibold text-sm text-foreground mb-1">Produto {i}</h3>
                    <p className="text-xs text-muted-foreground mb-2">Mercado Local</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-primary">R$ 9,90</span>
                      <span className="text-xs text-muted-foreground line-through">R$ 15,00</span>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Continuar Comprando */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Continuar Comprando</h2>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  onClick={() => navigate("/cliente/mercado")}
                  className="flex items-center gap-3 bg-card rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-gradient-end/20 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">Produto Recente {i}</h3>
                    <p className="text-xs text-muted-foreground">Mercado São João</p>
                  </div>
                  <span className="text-lg font-bold text-primary">R$ 12,90</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => navigate("/cliente/carrinho")}
          className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        >
          <ShoppingBag className="h-6 w-6" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
            3
          </div>
        </button>
      </div>

      <BottomTabs items={tabs} />
    </>
  );
};

export default ClientePage;
