import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSuporteRole } from "@/hooks/useSuporteRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, User, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import {
  buscarTicketCompleto,
  responderTicket,
  atualizarStatus,
  TicketCompleto,
} from "@/services/suporteInternoService";
import {
  CATEGORIAS_LABELS,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
  StatusTicket,
} from "@/services/suporteService";

const SuporteTicketDetalhePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get("id");
  const { user } = useAuth();
  const { isSuporteUser, loading: roleLoading } = useSuporteRole();
  const [ticket, setTicket] = useState<TicketCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [resposta, setResposta] = useState("");
  const [novoStatus, setNovoStatus] = useState<StatusTicket>("em_andamento");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (roleLoading) return;

    if (!isSuporteUser) {
      navigate("/");
      return;
    }

    if (!ticketId) {
      navigate("/suporte");
      return;
    }

    carregarTicket();
  }, [roleLoading, isSuporteUser, ticketId, navigate]);

  const carregarTicket = async () => {
    if (!ticketId) return;

    setLoading(true);
    const data = await buscarTicketCompleto(ticketId);
    if (data) {
      setTicket(data);
      setNovoStatus(data.status);
    } else {
      toast.error("Ticket não encontrado");
      navigate("/suporte");
    }
    setLoading(false);
  };

  const handleEnviarResposta = async () => {
    if (!ticket || !user) return;

    if (!resposta.trim()) {
      toast.error("Digite uma resposta antes de enviar");
      return;
    }

    setEnviando(true);

    const resultado = await responderTicket(
      ticket.id,
      resposta,
      user.id,
      novoStatus
    );

    if (resultado.success) {
      toast.success("Resposta enviada com sucesso!");
      carregarTicket();
      setResposta("");
    } else {
      toast.error(resultado.error || "Erro ao enviar resposta");
    }

    setEnviando(false);
  };

  const handleAtualizarStatus = async (status: StatusTicket) => {
    if (!ticket) return;

    const resultado = await atualizarStatus(ticket.id, status);

    if (resultado.success) {
      toast.success("Status atualizado com sucesso!");
      carregarTicket();
    } else {
      toast.error(resultado.error || "Erro ao atualizar status");
    }
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

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </BusqueiLayout>
    );
  }

  if (!ticket) {
    return (
      <BusqueiLayout>
        <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
          <p className="text-center text-muted-foreground">
            Ticket não encontrado.
          </p>
        </Card>
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <Button
        variant="ghost"
        onClick={() => navigate("/suporte")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <GradientHeader>Detalhes do Ticket</GradientHeader>

      {/* Informações do Ticket */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {ticket.titulo}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {CATEGORIAS_LABELS[ticket.categoria]}
                  </Badge>
                  <Badge className={getPrioridadeColor(ticket.prioridade)}>
                    {PRIORIDADE_LABELS[ticket.prioridade]}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-sm text-muted-foreground">
                  Aberto em:{" "}
                  {new Date(ticket.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <Select
                  value={ticket.status}
                  onValueChange={(value) =>
                    handleAtualizarStatus(value as StatusTicket)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Alterar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Descrição
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {ticket.descricao}
            </p>
          </div>

          {/* Imagem */}
          {ticket.imagem_url && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Imagem anexada
              </h3>
              <img
                src={ticket.imagem_url}
                alt="Imagem do ticket"
                className="max-w-full h-auto rounded-lg border border-border"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Informações do Usuário */}
      {ticket.user_details && (
        <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações do Usuário
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Nome:</span>
              <span className="text-foreground font-medium">
                {ticket.user_details.nome}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground font-medium">
                {ticket.user_details.email}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Telefone:</span>
              <span className="text-foreground font-medium">
                {ticket.user_details.telefone}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Resposta Anterior */}
      {ticket.resposta && (
        <Card className="p-6 mb-6 backdrop-blur-sm bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Resposta Anterior
          </h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {ticket.resposta}
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Respondido em:{" "}
            {new Date(ticket.updated_at).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </Card>
      )}

      {/* Formulário de Resposta */}
      <Card className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Responder Ticket
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Status após resposta
            </label>
            <Select
              value={novoStatus}
              onValueChange={(value) => setNovoStatus(value as StatusTicket)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Sua resposta
            </label>
            <Textarea
              placeholder="Digite sua resposta ao cliente..."
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          <Button
            onClick={handleEnviarResposta}
            disabled={enviando}
            className="w-full"
          >
            {enviando ? "Enviando..." : "Enviar Resposta"}
          </Button>
        </div>
      </Card>
    </BusqueiLayout>
  );
};

export default SuporteTicketDetalhePage;
