import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntregadorRole } from "@/hooks/useEntregadorRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDriver,
  atualizarStatusOnline,
  DeliveryDriver,
} from "@/services/entregadorService";

const EntregadorDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntregadorUser, loading: roleLoading } = useEntregadorRole();
  const [driver, setDriver] = useState<DeliveryDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (roleLoading) return;

    if (!isEntregadorUser) {
      navigate("/");
      return;
    }

    if (user) {
      carregarMotorista();
    }
  }, [roleLoading, isEntregadorUser, user, navigate]);

  const carregarMotorista = async () => {
    if (!user) return;

    setLoading(true);
    const data = await getDriver(user.id);
    setDriver(data);
    setLoading(false);
  };

  const handleToggleOnline = async () => {
    if (!driver) return;

    setToggling(true);
    const novoStatus = !driver.status_online;
    const resultado = await atualizarStatusOnline(driver.id, novoStatus);

    if (resultado.success) {
      setDriver({ ...driver, status_online: novoStatus });
      toast.success(novoStatus ? "Você está online!" : "Você está offline");
    } else {
      toast.error(resultado.error || "Erro ao atualizar status");
    }

    setToggling(false);
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </BusqueiLayout>
    );
  }

  if (!driver) {
    return (
      <BusqueiLayout>
        <GradientHeader>Painel do Entregador</GradientHeader>
        <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
          <p className="text-center text-muted-foreground mb-4">
            Perfil de entregador não encontrado.
          </p>
          <Button onClick={() => navigate("/entregador/perfil")} className="w-full">
            Criar Perfil
          </Button>
        </Card>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Painel do Entregador</GradientHeader>

      {/* Perfil do Motorista */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              {driver.foto_url && <AvatarImage src={driver.foto_url} />}
              <AvatarFallback className="text-2xl">
                {driver.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">{driver.nome}</h2>
                <Badge
                  variant={driver.status_online ? "default" : "secondary"}
                  className={
                    driver.status_online
                      ? "bg-green-500 hover:bg-green-600"
                      : ""
                  }
                >
                  {driver.status_online ? "Online" : "Offline"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground capitalize">
                {driver.veiculo} {driver.placa && `• ${driver.placa}`}
              </p>
              <p className="text-sm text-muted-foreground">{driver.telefone}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant={driver.status_online ? "destructive" : "default"}
              onClick={handleToggleOnline}
              disabled={toggling}
            >
              {toggling
                ? "Aguarde..."
                : driver.status_online
                ? "Ficar Offline"
                : "Ficar Online"}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/entregador/perfil")}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Entregas Hoje</p>
              <p className="text-3xl font-bold text-foreground">8</p>
            </div>
            <Package className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ganhos Hoje</p>
              <p className="text-3xl font-bold text-foreground">R$ 156</p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tempo Online</p>
              <p className="text-3xl font-bold text-foreground">4h 32m</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/entregador/rotas")}
        >
          <div className="flex items-center gap-4">
            <MapPin className="w-10 h-10 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Rotas Atuais</h3>
              <p className="text-sm text-muted-foreground">2 entregas pendentes</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/entregador/ganhos")}
        >
          <div className="flex items-center gap-4">
            <TrendingUp className="w-10 h-10 text-green-500" />
            <div>
              <h3 className="font-semibold text-foreground">Meus Ganhos</h3>
              <p className="text-sm text-muted-foreground">Ver histórico completo</p>
            </div>
          </div>
        </Card>

        <Card
          className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          onClick={() => navigate("/entregador/perfil")}
        >
          <div className="flex items-center gap-4">
            <Settings className="w-10 h-10 text-blue-500" />
            <div>
              <h3 className="font-semibold text-foreground">Meu Perfil</h3>
              <p className="text-sm text-muted-foreground">Editar informações</p>
            </div>
          </div>
        </Card>
      </div>
    </BusqueiLayout>
  );
};

export default EntregadorDashboardPage;
