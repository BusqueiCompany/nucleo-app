import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, Crown, Check, Sparkles, TrendingDown, Bell, List } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { assinarVIP, PLANOS, PlanosVIP } from "@/services/vipService";
import { toast } from "sonner";
import { useVipStatus } from "@/hooks/useVipStatus";

const VIPPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isActive: isVIPActive, plano: planoAtual } = useVipStatus();
  const [loading, setLoading] = useState(false);

  const beneficios = [
    {
      icon: TrendingDown,
      texto: "Comparação automática de preços entre mercados",
    },
    {
      icon: Sparkles,
      texto: "Sugestão de itens similares mais baratos",
    },
    {
      icon: Bell,
      texto: "Alertas exclusivos de ofertas e rotas",
    },
    {
      icon: List,
      texto: "Lista Inteligente ilimitada",
    },
  ];

  const handleAssinar = async (plano: PlanosVIP) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar");
      navigate("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const result = await assinarVIP(user.id, plano);
      
      if (result.success) {
        toast.success("Assinatura VIP ativada com sucesso! 🎉");
        // Reload to update VIP status
        window.location.reload();
      } else {
        toast.error(result.error || "Erro ao processar assinatura");
      }
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast.error("Erro ao processar assinatura");
    } finally {
      setLoading(false);
    }
  };

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
          <div className="flex items-center gap-2 flex-1">
            <Crown className="h-7 w-7 text-amber-500" />
            <h1 className="text-2xl font-bold text-foreground">
              Clube Busquei VIP
            </h1>
          </div>
        </div>

        {/* Current Status */}
        {isVIPActive && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-[1.5rem] p-6 shadow-md mb-6 border-2 border-green-300">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-bold text-green-800">Você é VIP!</h3>
                <p className="text-sm text-green-700">
                  Plano: {PLANOS[planoAtual as PlanosVIP]?.nome || "Ativo"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Benefícios Exclusivos
          </h2>
          <div className="space-y-3">
            {beneficios.map((beneficio, index) => {
              const Icon = beneficio.icon;
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gradient-start to-gradient-end flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-foreground pt-1">{beneficio.texto}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-xl font-bold text-foreground mb-4">
          Escolha seu Plano
        </h2>
        <div className="space-y-4 mb-6">
          {Object.entries(PLANOS).map(([key, plano]) => {
            const isPopular = key === "trimestral";
            const isCurrent = planoAtual === key;

            return (
              <Card
                key={key}
                className={`bg-white/80 backdrop-blur-md transition-all ${
                  isPopular
                    ? "border-2 border-amber-400 shadow-lg shadow-amber-500/20"
                    : "border-transparent shadow-md"
                }`}
              >
                <CardContent className="p-6">
                  {isPopular && (
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                      MAIS POPULAR
                    </div>
                  )}
                  {isCurrent && (
                    <div className="bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                      PLANO ATUAL
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {plano.nome}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Economize até {plano.economia}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gradient-end">
                        R$ {plano.preco.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        por {plano.dias} dias
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssinar(key as PlanosVIP)}
                    disabled={loading || isCurrent}
                    className={`w-full rounded-xl py-3 font-semibold transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white hover:shadow-lg"
                        : "bg-gradient-to-r from-gradient-start to-gradient-end text-white hover:shadow-lg"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <>Processando...</>
                    ) : isCurrent ? (
                      <>
                        <Check className="h-5 w-5" />
                        Plano Ativo
                      </>
                    ) : (
                      <>
                        <Crown className="h-5 w-5" />
                        Assinar Agora
                      </>
                    )}
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-[1.5rem] p-6 shadow-md mb-4 text-center">
          <p className="text-sm text-blue-800 font-medium">
            🛡️ Garantia de 7 dias - Cancele quando quiser
          </p>
        </div>
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

export default VIPPage;
