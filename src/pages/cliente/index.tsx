import { Home, Package, ShoppingBag, User, UtensilsCrossed } from "lucide-react";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import SearchBar from "@/components/ui/SearchBar";
import CategoryButton from "@/components/ui/CategoryButton";
import BottomTabs from "@/components/ui/BottomTabs";

const ClientePage = () => {
  const categories = [
    { icon: UtensilsCrossed, label: "Restaurantes" },
    { icon: ShoppingBag, label: "Mercado" },
    { icon: Package, label: "Farmácia" },
    { icon: Home, label: "Pet Shop" },
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
        <GradientHeader>Bom dia, Clara!</GradientHeader>

        <div className="space-y-6">
          <SearchBar placeholder="Buscar estabelecimentos, produtos..." />

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Categorias</h2>
            <div className="grid grid-cols-4 gap-4">
              {categories.map((category) => (
                <CategoryButton
                  key={category.label}
                  icon={category.icon}
                  label={category.label}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Estabelecimentos próximos
            </h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-gradient-start to-gradient-end rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        Estabelecimento {i}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Categoria • 2.5 km
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </BusqueiLayout>

      <BottomTabs items={tabs} />
    </>
  );
};

export default ClientePage;
