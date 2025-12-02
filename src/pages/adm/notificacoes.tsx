import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmRole } from "@/hooks/useAdmRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { listarNotificacoesGlobais, criarNotificacaoGlobal } from "@/services/admService";

const AdmNotificacoesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmUser, loading: roleLoading } = useAdmRole();
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [tipo, setTipo] = useState("info");

  useEffect(() => {
    if (roleLoading) return;
    if (!isAdmUser) {
      navigate("/");
      return;
    }
    carregar();
  }, [roleLoading, isAdmUser, navigate]);

  const carregar = async () => {
    setLoading(true);
    const resultado = await listarNotificacoesGlobais();
    if (resultado.success) {
      setNotificacoes(resultado.data || []);
    }
    setLoading(false);
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !titulo.trim() || !mensagem.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }

    setEnviando(true);
    const resultado = await criarNotificacaoGlobal({
      titulo,
      mensagem,
      tipo,
      enviado_por: user.id,
    });

    if (resultado.success) {
      toast.success("Notificação enviada!");
      setTitulo("");
      setMensagem("");
      setTipo("info");
      await carregar();
    } else {
      toast.error(resultado.error || "Erro ao enviar");
    }

    setEnviando(false);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "info": return "bg-blue-100 text-blue-800";
      case "alerta": return "bg-yellow-100 text-yellow-800";
      case "oferta": return "bg-green-100 text-green-800";
      case "urgente": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (roleLoading || loading) {
    return (
      <BusqueiLayout>
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </BusqueiLayout>
    );
  }

  return (
    <BusqueiLayout>
      <GradientHeader>Notificações Globais</GradientHeader>

      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Enviar Nova Notificação</h3>
        <form onSubmit={handleEnviar} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div>
            <Label>Mensagem *</Label>
            <Textarea value={mensagem} onChange={(e) => setMensagem(e.target.value)} required className="min-h-[100px]" />
          </div>
          <div>
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="alerta">Alerta</SelectItem>
                <SelectItem value="oferta">Oferta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={enviando} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {enviando ? "Enviando..." : "Enviar Notificação"}
          </Button>
        </form>
      </Card>

      <h3 className="text-lg font-semibold text-foreground mb-4">Histórico ({notificacoes.length})</h3>
      <div className="space-y-4">
        {notificacoes.map((notif) => (
          <Card key={notif.id} className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-lg font-semibold text-foreground">{notif.titulo}</h4>
              <Badge className={getTipoColor(notif.tipo)}>{notif.tipo}</Badge>
            </div>
            <p className="text-muted-foreground mb-2">{notif.mensagem}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(notif.created_at).toLocaleString("pt-BR")}
            </p>
          </Card>
        ))}
      </div>
    </BusqueiLayout>
  );
};

export default AdmNotificacoesPage;
