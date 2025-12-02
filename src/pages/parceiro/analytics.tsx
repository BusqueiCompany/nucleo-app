import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useParceiroRole } from "@/hooks/useParceiroRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ParceiroAnalyticsPage = () => {
  const navigate = useNavigate();
  const { isParceiroUser, loading: roleLoading } = useParceiroRole();

  useEffect(() => {
    if (roleLoading) return;

    if (!isParceiroUser) {
      navigate("/");
      return;
    }
  }, [roleLoading, isParceiroUser, navigate]);

  // Dados fake para gráficos
  const vendasPorDia = [
    { dia: "Seg", valor: 1240 },
    { dia: "Ter", valor: 1580 },
    { dia: "Qua", valor: 1320 },
    { dia: "Qui", valor: 1890 },
    { dia: "Sex", valor: 2340 },
    { dia: "Sáb", valor: 2890 },
    { dia: "Dom", valor: 1650 },
  ];

  const produtosMaisVendidos = [
    { nome: "Arroz 5kg", vendas: 45 },
    { nome: "Feijão 1kg", vendas: 38 },
    { nome: "Óleo de Soja", vendas: 32 },
    { nome: "Açúcar 1kg", vendas: 28 },
    { nome: "Café 500g", vendas: 25 },
  ];

  const receitaMensal = [
    { mes: "Jan", receita: 12400 },
    { mes: "Fev", receita: 15800 },
    { mes: "Mar", receita: 13200 },
    { mes: "Abr", receita: 18900 },
    { mes: "Mai", receita: 23400 },
    { mes: "Jun", receita: 28900 },
  ];

  const distribuicaoCategoria = [
    { name: "Hortifruti", value: 30 },
    { name: "Bebidas", value: 25 },
    { name: "Padaria", value: 20 },
    { name: "Limpeza", value: 15 },
    { name: "Outros", value: 10 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (roleLoading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Analytics</GradientHeader>

      {/* Vendas por Dia */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Vendas por Dia (Última Semana)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={vendasPorDia}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dia" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Produtos Mais Vendidos */}
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Produtos Mais Vendidos
          </h3>
          <div className="space-y-3">
            {produtosMaisVendidos.map((produto, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <span className="text-foreground">{produto.nome}</span>
                <span className="font-semibold text-primary">
                  {produto.vendas} un
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Distribuição por Categoria */}
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Vendas por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distribuicaoCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Receita Mensal */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Evolução da Receita (6 meses)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={receitaMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="receita"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Métricas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">Ticket Médio</p>
          <p className="text-3xl font-bold text-foreground">R$ 127,50</p>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">Total de Pedidos</p>
          <p className="text-3xl font-bold text-foreground">342</p>
        </Card>

        <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">Taxa de Conversão</p>
          <p className="text-3xl font-bold text-foreground">68%</p>
        </Card>
      </div>
    </BusqueiLayout>
  );
};

export default ParceiroAnalyticsPage;
