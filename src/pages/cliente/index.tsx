import { Home, Package, ShoppingBag, User, Store, Wine, Pill, PawPrint, Droplets, Flame, Brain } from "lucide-react";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import SearchBar from "@/components/ui/SearchBar";
import CategoryButton from "@/components/ui/CategoryButton";
import BottomTabs from "@/components/ui/BottomTabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ClientePage = () => {
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
          <button className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] p-4 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2 font-semibold">
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
