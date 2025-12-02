import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, TrendingDown, MapPin, Crown, ShoppingBag, Loader2 } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { compararPrecos, ResultadoComparacao } from "@/services/comparadorService";
import { toast } from "sonner";

interface ListItem {
  id: string;
  nome: string;
  quantidade: number;
}

const ListaInteligenteResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const items = (location.state?.items as ListItem[]) || [];
  const [resultados, setResultados] = useState<ResultadoComparacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cliente/lista-inteligente");
      return;
    }

    async function buscarComparacao() {
      try {
        setLoading(true);
        const listaParaComparar = items.map((item) => ({
          nome: item.nome,
          quantidade: item.quantidade,
        }));
        
        const resultadosComparacao = await compararPrecos(listaParaComparar);
        setResultados(resultadosComparacao);
      } catch (error) {
        console.error("Erro ao comparar preços:", error);
        toast.error("Erro ao buscar preços dos mercados");
      } finally {
        setLoading(false);
      }
    }

    buscarComparacao();
  }, [items, navigate]);

  if (items.length === 0) {
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

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-gradient-end animate-spin mb-4" />
            <p className="text-muted-foreground">Comparando preços...</p>
          </div>
        ) : resultados.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-8 shadow-md text-center">
            <p className="text-muted-foreground">
              Nenhum mercado encontrado com todos os produtos da sua lista.
            </p>
          </div>
        ) : (
          <>
            {/* Markets Comparison */}
            <div className="space-y-4 mb-6">
              {resultados.map((resultado, index) => {
                const isCheapest = index === 0;
                const economia =
                  resultados.length > 1
                    ? resultados[resultados.length - 1].total - resultado.total
                    : 0;
                const distanciaKm = (resultado.distancia / 1000).toFixed(1);

                return (
                  <Card
                    key={resultado.marketId}
                    className={`bg-white/80 backdrop-blur-md border-2 transition-all ${
                      isCheapest
                        ? "border-green-500 shadow-lg shadow-green-500/20"
                        : "border-transparent shadow-md"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">
                              {resultado.nome}
                            </h3>
                            {isCheapest && (
                              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                Mais Barato
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {distanciaKm} km • {resultado.tempoEntrega} min
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            R$ {resultado.total.toFixed(2)}
                          </p>
                          {economia > 0 && isCheapest && (
                            <p className="text-sm text-green-600 font-medium">
                              Economize R$ {economia.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      {isCheapest && economia > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mt-3">
                          <p className="text-sm text-green-700 font-medium text-center">
                            🎉 Você economiza R$ {economia.toFixed(2)} comprando
                            aqui!
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

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
