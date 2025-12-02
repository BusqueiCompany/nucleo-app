import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParceiroRole } from "@/hooks/useParceiroRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Clock, Package, CheckCircle } from "lucide-react";

interface PedidoFake {
  id: string;
  numero: string;
  cliente: string;
  valor: number;
  status: "pendente" | "preparando" | "pronto" | "entregue";
  itens: number;
  horario: string;
}

const ParceiroPedidosPage = () => {
  const navigate = useNavigate();
  const { isParceiroUser, loading: roleLoading } = useParceiroRole();
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");

  useEffect(() => {
    if (roleLoading) return;

    if (!isParceiroUser) {
      navigate("/");
      return;
    }
  }, [roleLoading, isParceiroUser, navigate]);

  // Dados fake
  const pedidosFake: PedidoFake[] = [
    {
      id: "1",
      numero: "#1234",
      cliente: "João Silva",
      valor: 87.5,
      status: "pendente",
      itens: 12,
      horario: "14:32",
    },
    {
      id: "2",
      numero: "#1233",
      cliente: "Maria Santos",
      valor: 145.8,
      status: "preparando",
      itens: 8,
      horario: "14:15",
    },
    {
      id: "3",
      numero: "#1232",
      cliente: "Pedro Costa",
      valor: 56.3,
      status: "pronto",
      itens: 5,
      horario: "13:58",
    },
    {
      id: "4",
      numero: "#1231",
      cliente: "Ana Oliveira",
      valor: 234.9,
      status: "entregue",
      itens: 15,
      horario: "13:20",
    },
  ];

  const pedidosFiltrados =
    filtroStatus === "todos"
      ? pedidosFake
      : pedidosFake.filter((p) => p.status === filtroStatus);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <ClipboardList className="w-5 h-5 text-yellow-500" />;
      case "preparando":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "pronto":
        return <Package className="w-5 h-5 text-orange-500" />;
      case "entregue":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "preparando":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pronto":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "entregue":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pendente":
        return "Pendente";
      case "preparando":
        return "Preparando";
      case "pronto":
        return "Pronto";
      case "entregue":
        return "Entregue";
      default:
        return status;
    }
  };

  if (roleLoading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Pedidos</GradientHeader>

      {/* Filtros */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="flex items-center gap-4">
          <label className="text-sm text-muted-foreground">Filtrar por status:</label>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="preparando">Preparando</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        {pedidosFiltrados.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <p className="text-center text-muted-foreground">
              Nenhum pedido encontrado com este filtro.
            </p>
          </Card>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <Card
              key={pedido.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {getStatusIcon(pedido.status)}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {pedido.numero}
                      </h3>
                      <Badge className={getStatusColor(pedido.status)}>
                        {getStatusLabel(pedido.status)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Cliente: {pedido.cliente}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pedido.itens} itens • {pedido.horario}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    R$ {pedido.valor.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </BusqueiLayout>
  );
};

export default ParceiroPedidosPage;
