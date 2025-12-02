import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="min-h-screen busquei-gradient pb-20">
        {/* Header */}
        <div className="container mx-auto px-6 pt-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex items-center gap-2 flex-1">
              <Crown className="h-7 w-7 text-vip" />
              <h1 className="text-2xl font-bold text-white">
                Clube Busquei VIP
              </h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 space-y-6">
          {/* Current Status */}
          {isVIPActive && (
            <div className="busquei-vip-gradient rounded-2xl p-6 shadow-lg border-2 border-vip/30">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-vip-foreground" />
                <div>
                  <h3 className="font-bold text-vip-foreground">Você é VIP!</h3>
                  <p className="text-sm text-vip-foreground/80">
                    Plano: {PLANOS[planoAtual as PlanosVIP]?.nome || "Ativo"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Benefits Section */}
          <div className="busquei-card p-6">
            <h2 className="busquei-title mb-4">Benefícios VIP</h2>
            <div className="space-y-3">
              {beneficios.map((beneficio, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <beneficio.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-foreground font-medium pt-2">{beneficio.texto}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plans */}
          <h2 className="text-xl font-bold text-white mb-4">
            Escolha seu Plano
          </h2>
          <div className="space-y-4 mb-6">
            {Object.entries(PLANOS).map(([key, plano]) => {
              const isPopular = key === "trimestral";
              const isCurrent = planoAtual === key;

              return (
                <Card
                  key={key}
                  className={`busquei-card transition-all ${
                    isPopular
                      ? "border-2 border-vip shadow-xl"
                      : "border-transparent shadow-lg"
                  }`}
                >
                  <CardContent className="p-6">
                    {isPopular && (
                      <div className="busquei-vip-gradient text-vip-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                        MAIS POPULAR
                      </div>
                    )}
                    {isCurrent && (
                      <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
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
                        <p className="text-3xl font-bold text-primary">
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
                          ? "busquei-vip-gradient text-vip-foreground hover:shadow-lg"
                          : "busquei-button"
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
          <div className="busquei-card p-6 text-center bg-secondary/10">
            <p className="text-sm text-foreground font-medium">
              🛡️ Garantia de 7 dias - Cancele quando quiser
            </p>
          </div>
        </div>
      </div>

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
