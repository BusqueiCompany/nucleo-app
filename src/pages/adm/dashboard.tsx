import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmRole } from "@/hooks/useAdmRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Store,
  Truck,
  ShoppingBag,
  DollarSign,
  Crown,
  Bell,
  Percent,
  MapPin,
} from "lucide-react";
import { obterEstatisticasGlobais } from "@/services/admService";

const AdmDashboardPage = () => {
  const navigate = useNavigate();
  const { isAdmUser, loading: roleLoading } = useAdmRole();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    if (!isAdmUser) {
      navigate("/");
      return;
    }

    carregarEstatisticas();
  }, [roleLoading, isAdmUser, navigate]);

  const carregarEstatisticas = async () => {
    setLoading(true);
    const resultado = await obterEstatisticasGlobais();
    if (resultado.success) {
      setStats(resultado.data);
    }
    setLoading(false);
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Painel Administrativo</GradientHeader>

      {/* Estatísticas Globais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.totalUsuarios || 0}
              </p>
            </div>
            <Users className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estabelecimentos</p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.totalEstabelecimentos || 0}
              </p>
            </div>
            <Store className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entregadores</p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.totalEntregadores || 0}
              </p>
            </div>
            <Truck className="w-10 h-10 text-orange-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-foreground">247</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
              <p className="text-3xl font-bold text-foreground">R$ 12.4k</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">VIPs Ativos</p>
              <p className="text-3xl font-bold text-foreground">
                {stats?.vipsAtivos || 0}
              </p>
            </div>
            <Crown className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Ações de Gerenciamento */}
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Gerenciamento
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/estabelecimentos")}
        >
          <div className="flex items-center gap-4">
            <Store className="w-10 h-10 text-primary" />
            <div>
              <h4 className="font-semibold text-foreground">Estabelecimentos</h4>
              <p className="text-sm text-muted-foreground">
                Gerenciar estabelecimentos
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/parceiros")}
        >
          <div className="flex items-center gap-4">
            <Users className="w-10 h-10 text-blue-500" />
            <div>
              <h4 className="font-semibold text-foreground">Parceiros</h4>
              <p className="text-sm text-muted-foreground">
                Gerenciar parceiros
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/entregadores")}
        >
          <div className="flex items-center gap-4">
            <Truck className="w-10 h-10 text-orange-500" />
            <div>
              <h4 className="font-semibold text-foreground">Entregadores</h4>
              <p className="text-sm text-muted-foreground">
                Gerenciar entregadores
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/notificacoes")}
        >
          <div className="flex items-center gap-4">
            <Bell className="w-10 h-10 text-red-500" />
            <div>
              <h4 className="font-semibold text-foreground">Notificações</h4>
              <p className="text-sm text-muted-foreground">
                Notificações globais
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/promocoes")}
        >
          <div className="flex items-center gap-4">
            <Percent className="w-10 h-10 text-green-500" />
            <div>
              <h4 className="font-semibold text-foreground">Promoções</h4>
              <p className="text-sm text-muted-foreground">
                Promoções globais
              </p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/adm/rotas-prioritarias")}
        >
          <div className="flex items-center gap-4">
            <MapPin className="w-10 h-10 text-purple-500" />
            <div>
              <h4 className="font-semibold text-foreground">Rotas Prioritárias</h4>
              <p className="text-sm text-muted-foreground">
                Alertas prioritários
              </p>
            </div>
          </div>
        </Card>
      </div>
    </BusqueiLayout>
  );
};

export default AdmDashboardPage;
