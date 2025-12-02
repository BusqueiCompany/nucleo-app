import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParceiroRole } from "@/hooks/useParceiroRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Star,
  BarChart3,
  Percent,
  ClipboardList,
} from "lucide-react";
import { getEstablishmentByPartner, Establishment } from "@/services/parceiroService";

const ParceiroDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isParceiroUser, loading: roleLoading } = useParceiroRole();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    if (!isParceiroUser) {
      navigate("/");
      return;
    }

    if (user) {
      carregarEstabelecimento();
    }
  }, [roleLoading, isParceiroUser, user, navigate]);

  const carregarEstabelecimento = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getEstablishmentByPartner(user.id);
    setEstablishment(data);
    setLoading(false);
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </BusqueiLayout>
    );
  }

  if (!establishment) {
    return (
      <BusqueiLayout>
        <GradientHeader>Painel do Parceiro</GradientHeader>
        <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
          <p className="text-center text-muted-foreground">
            Nenhum estabelecimento vinculado a esta conta.
          </p>
        </Card>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Painel do Parceiro</GradientHeader>

      {/* Informações do Estabelecimento */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-start gap-6">
          {establishment.foto_url && (
            <img
              src={establishment.foto_url}
              alt={establishment.nome}
              className="w-24 h-24 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {establishment.nome}
            </h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="capitalize">Tipo: {establishment.tipo}</span>
              {establishment.preco_nivel && (
                <span>Preço: {establishment.preco_nivel}</span>
              )}
              {establishment.funcionamento_abre && establishment.funcionamento_fecha && (
                <span>
                  Horário: {establishment.funcionamento_abre} - {establishment.funcionamento_fecha}
                </span>
              )}
            </div>
            {establishment.descricao && (
              <p className="mt-2 text-muted-foreground">{establishment.descricao}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pedidos Hoje</p>
              <p className="text-3xl font-bold text-foreground">24</p>
            </div>
            <ShoppingBag className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faturamento</p>
              <p className="text-3xl font-bold text-foreground">R$ 1.234</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Produtos</p>
              <p className="text-3xl font-bold text-foreground">156</p>
            </div>
            <Package className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avaliação</p>
              <p className="text-3xl font-bold text-foreground">4.8</p>
            </div>
            <Star className="w-10 h-10 text-yellow-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate("/parceiro/produtos")}
          >
            <Package className="w-8 h-8" />
            <span>Gerenciar Produtos</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate("/parceiro/pedidos")}
          >
            <ClipboardList className="w-8 h-8" />
            <span>Ver Pedidos</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate("/parceiro/promocoes")}
          >
            <Percent className="w-8 h-8" />
            <span>Criar Promoção</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate("/parceiro/analytics")}
          >
            <BarChart3 className="w-8 h-8" />
            <span>Analytics</span>
          </Button>
        </div>
      </Card>
    </BusqueiLayout>
  );
};

export default ParceiroDashboardPage;
