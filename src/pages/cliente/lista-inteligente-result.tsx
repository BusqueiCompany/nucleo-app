import { useNavigate, useLocation } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, TrendingDown, MapPin, Crown, ShoppingBag } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ListItem {
  id: string;
  nome: string;
  quantidade: number;
}

const ListaInteligenteResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = (location.state?.items as ListItem[]) || [];

  const mercados = [
    {
      id: "1",
      nome: "Mercado Econômico",
      precoTotal: 87.45,
      distancia: "1.2 km",
      economia: 15.3,
      isCheapest: true,
    },
    {
      id: "2",
      nome: "Supermercado Bom Preço",
      precoTotal: 94.20,
      distancia: "850 m",
      economia: 8.55,
      isCheapest: false,
    },
    {
      id: "3",
      nome: "Mercado do Bairro",
      precoTotal: 102.75,
      distancia: "2.1 km",
      economia: 0,
      isCheapest: false,
    },
  ];

  if (items.length === 0) {
    navigate("/cliente/lista-inteligente");
    return null;
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
          <h1 className="text-2xl font-bold text-foreground">
            Comparação de Preços
          </h1>
        </div>

        {/* Items Summary */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Sua Lista ({items.length} {items.length === 1 ? "item" : "itens"})
          </h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span>{item.nome}</span>
                <span className="font-medium">x{item.quantidade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Results Title */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-5 w-5 text-gradient-end" />
          <h2 className="text-xl font-bold text-foreground">
            Melhores Opções
          </h2>
        </div>

        {/* Markets Comparison */}
        <div className="space-y-4 mb-6">
          {mercados.map((mercado) => (
            <Card
              key={mercado.id}
              className={`bg-white/80 backdrop-blur-md border-2 transition-all ${
                mercado.isCheapest
                  ? "border-green-500 shadow-lg shadow-green-500/20"
                  : "border-transparent shadow-md"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {mercado.nome}
                      </h3>
                      {mercado.isCheapest && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Mais Barato
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{mercado.distancia}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      R$ {mercado.precoTotal.toFixed(2)}
                    </p>
                    {mercado.economia > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        Economize R$ {mercado.economia.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {mercado.isCheapest && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                    <p className="text-sm text-green-700 font-medium text-center">
                      🎉 Você economiza R$ {mercado.economia.toFixed(2)} comprando aqui!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* VIP Features */}
        <button
          onClick={() =>
            alert("Recurso exclusivo VIP! Assine para desbloquear.")
          }
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold mb-3 flex items-center justify-center gap-2"
        >
          <Crown className="h-5 w-5" />
          Ver itens similares mais baratos (VIP)
        </button>

        {/* Choose Market Button */}
        <button
          onClick={() => alert("Escolher mercado e adicionar ao carrinho")}
          className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold mb-4 flex items-center justify-center gap-2"
        >
          <ShoppingBag className="h-5 w-5" />
          Escolher Mercado
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

export default ListaInteligenteResultPage;
