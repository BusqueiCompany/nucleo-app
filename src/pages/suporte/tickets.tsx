import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSuporteRole } from "@/hooks/useSuporteRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import {
  listarTodosTickets,
  filtrarTickets,
} from "@/services/suporteInternoService";
import { Ticket } from "@/services/suporteService";
import {
  CATEGORIAS_LABELS,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
  CategoriasSupporte,
  StatusTicket,
} from "@/services/suporteService";

const SuporteTicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isSuporteUser, loading: roleLoading } = useSuporteRole();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusTicket | "todos">("todos");
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriasSupporte | "todas">("todas");

  useEffect(() => {
    if (roleLoading) return;

    if (!isSuporteUser) {
      navigate("/");
      return;
    }

    carregarTickets();
  }, [roleLoading, isSuporteUser, navigate]);

  const carregarTickets = async () => {
    setLoading(true);
    const data = await listarTodosTickets();
    setTickets(data);
    setLoading(false);
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    const statusFiltro = filtroStatus === "todos" ? undefined : filtroStatus;
    const categoriaFiltro = filtroCategoria === "todas" ? undefined : filtroCategoria;
    const data = await filtrarTickets(
      statusFiltro,
      categoriaFiltro,
      searchTerm || undefined
    );
    setTickets(data);
    setLoading(false);
  };

  const getStatusColor = (status: StatusTicket) => {
    switch (status) {
      case "aberto":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "em_andamento":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "resolvido":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "fechado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "urgente":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "alta":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "baixa":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
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
      <GradientHeader>Central de Suporte</GradientHeader>

      {/* Filtros */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filtros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Título ou descrição"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Status
              </label>
              <Select
                value={filtroStatus}
                onValueChange={(value) => setFiltroStatus(value as StatusTicket | "todos")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Categoria
              </label>
              <Select
                value={filtroCategoria}
                onValueChange={(value) =>
                  setFiltroCategoria(value as CategoriasSupporte | "todas")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="pedido">Pedido</SelectItem>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="entrega">Entrega</SelectItem>
                  <SelectItem value="produto">Produto</SelectItem>
                  <SelectItem value="conta">Conta</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={aplicarFiltros} className="w-full md:w-auto">
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </>
        ) : tickets.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <p className="text-center text-muted-foreground">
              Nenhum ticket encontrado.
            </p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => navigate(`/suporte/ticket-detalhe?id=${ticket.id}`)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {ticket.titulo}
                    </h3>
                    <Badge className={getPrioridadeColor(ticket.prioridade)}>
                      {PRIORIDADE_LABELS[ticket.prioridade]}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">
                      {CATEGORIAS_LABELS[ticket.categoria]}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {STATUS_LABELS[ticket.status]}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.descricao}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Button variant="outline" size="sm">
                    Abrir
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </BusqueiLayout>
  );
};

export default SuporteTicketsPage;
