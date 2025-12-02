import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { 
  ArrowLeft, 
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  ShoppingCart,
  User,
  ClipboardList
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  buscarTicket,
  Ticket,
  CATEGORIAS_LABELS,
  STATUS_LABELS,
  PRIORIDADE_LABELS,
} from "@/services/suporteService";

const SuporteDetalhePage = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const fetchTicket = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const data = await buscarTicket(ticketId);
      
      if (data) {
        setTicket(data);
      } else {
        toast.error("Ticket não encontrado");
        navigate("/cliente/suporte");
      }
    } catch (error) {
      console.error("Erro ao buscar ticket:", error);
      toast.error("Erro ao carregar ticket");
      navigate("/cliente/suporte");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aberto":
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case "em_andamento":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "resolvido":
      case "fechado":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "em_andamento":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "resolvido":
        return "bg-green-100 text-green-700 border-green-200";
      case "fechado":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <>
        <BusqueiLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground">Carregando ticket...</p>
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
  }

  if (!ticket) {
    return null;
  }

  return (
    <>
      <BusqueiLayout>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/cliente/suporte")}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Detalhes do Ticket</h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {getStatusIcon(ticket.status)}
          <span
            className={`text-sm px-3 py-1 rounded-full border font-medium ${getStatusColor(
              ticket.status
            )}`}
          >
            {STATUS_LABELS[ticket.status]}
          </span>
        </div>

        {/* Ticket Info */}
        <Card className="bg-white/80 backdrop-blur-md shadow-md mb-4">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {ticket.titulo}
            </h2>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="h-4 w-4" />
                <span>{CATEGORIAS_LABELS[ticket.categoria]}</span>
                <span className="mx-2">•</span>
                <span>Prioridade: {PRIORIDADE_LABELS[ticket.prioridade]}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Aberto em {new Date(ticket.created_at).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(ticket.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-foreground whitespace-pre-wrap">
                {ticket.descricao}
              </p>
            </div>

            {/* Image if exists */}
            {ticket.imagem_url && (
              <div className="border-t border-border pt-4 mt-4">
                <h3 className="font-semibold text-foreground mb-2">Imagem</h3>
                <img
                  src={ticket.imagem_url}
                  alt="Imagem do ticket"
                  className="w-full rounded-xl object-cover max-h-96"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response if exists */}
        {ticket.resposta && (
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 shadow-md mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">
                  Resposta do Suporte
                </h3>
              </div>
              <p className="text-green-900 whitespace-pre-wrap">
                {ticket.resposta}
              </p>
              {ticket.updated_at && (
                <p className="text-xs text-green-700 mt-3">
                  Respondido em {new Date(ticket.updated_at).toLocaleDateString("pt-BR")} às{" "}
                  {new Date(ticket.updated_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Waiting for response */}
        {!ticket.resposta && (
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md mb-4">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800 mb-2">
                Aguardando resposta
              </h3>
              <p className="text-sm text-blue-700">
                Nossa equipe está analisando seu ticket e responderá em breve
              </p>
            </CardContent>
          </Card>
        )}
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

export default SuporteDetalhePage;
