import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntregadorRole } from "@/hooks/useEntregadorRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDriver, listarEntregas, Delivery } from "@/services/entregadorService";

const EntregadorGanhosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEntregadorUser, loading: roleLoading } = useEntregadorRole();
  const [entregas, setEntregas] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (roleLoading) return;

    if (!isEntregadorUser) {
      navigate("/");
      return;
    }

    if (user) {
      inicializar();
    }
  }, [roleLoading, isEntregadorUser, user, navigate]);

  const inicializar = async () => {
    if (!user) return;

    setLoading(true);
    const driver = await getDriver(user.id);

    if (driver) {
      const entregasData = await listarEntregas(driver.id);
      setEntregas(entregasData.filter((e) => e.status === "entregue"));
    }

    setLoading(false);
  };

  // Dados fake para gráficos
  const ganhosPorDia = [
    { dia: "Seg", valor: 145 },
    { dia: "Ter", valor: 189 },
    { dia: "Qua", valor: 156 },
    { dia: "Qui", valor: 223 },
    { dia: "Sex", valor: 267 },
    { dia: "Sáb", valor: 312 },
    { dia: "Dom", valor: 198 },
  ];

  const totalDia = 267;
  const totalSemana = 1490;
  const totalMes = 6234;

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Meus Ganhos</GradientHeader>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Hoje</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalDia}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Esta Semana</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalSemana}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Este Mês</p>
              <p className="text-3xl font-bold text-foreground">
                R$ {totalMes}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-primary opacity-20" />
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ganhos por Dia (Última Semana)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ganhosPorDia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Histórico */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Histórico de Entregas Concluídas
        </h3>

        {entregas.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma entrega concluída ainda.
          </p>
        ) : (
          <div className="space-y-3">
            {entregas.map((entrega) => (
              <div
                key={entrega.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground">
                    Pedido #{entrega.order_id?.slice(0, 8) || "---"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(entrega.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-green-600">
                    Entregue
                  </Badge>
                  <p className="text-xl font-bold text-primary">
                    R$ {entrega.valor?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </BusqueiLayout>
  );
};

export default EntregadorGanhosPage;
