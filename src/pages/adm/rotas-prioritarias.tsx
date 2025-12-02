import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmRole } from "@/hooks/useAdmRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  criarRota,
  listarRotas,
  desativarRota,
  ativarRota,
  PriorityRoute,
} from "@/services/priorityRoutesService";
import { listarEstabelecimentos } from "@/services/admService";

interface Establishment {
  id: string;
  nome: string;
  tipo: string;
  foto_url: string | null;
}

const AdmRotasPrioritariasPage = () => {
  const navigate = useNavigate();
  const { isAdmUser, loading: roleLoading } = useAdmRole();
  const [rotas, setRotas] = useState<PriorityRoute[]>([]);
  const [estabelecimentos, setEstabelecimentos] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [establishmentId, setEstablishmentId] = useState("");
  const [produto, setProduto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roleLoading) return;

    if (!isAdmUser) {
      navigate("/");
      return;
    }

    carregarDados();
  }, [roleLoading, isAdmUser, navigate]);

  const carregarDados = async () => {
    setLoading(true);
    const rotasData = await listarRotas();
    const estabResult = await listarEstabelecimentos();
    
    setRotas(rotasData);
    if (estabResult.success) {
      setEstabelecimentos(estabResult.data);
    }
    setLoading(false);
  };

  const handleCriarRota = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!establishmentId || !produto.trim() || !mensagem.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSubmitting(true);
    const resultado = await criarRota(establishmentId, produto.trim(), mensagem.trim());

    if (resultado.success) {
      toast.success("Rota prioritária criada com sucesso!");
      setEstablishmentId("");
      setProduto("");
      setMensagem("");
      carregarDados();
    } else {
      toast.error(resultado.error || "Erro ao criar rota");
    }

    setSubmitting(false);
  };

  const handleDesativar = async (id: string) => {
    const resultado = await desativarRota(id);

    if (resultado.success) {
      toast.success("Rota desativada!");
      carregarDados();
    } else {
      toast.error(resultado.error || "Erro ao desativar");
    }
  };

  const handleAtivar = async (id: string) => {
    const resultado = await ativarRota(id);

    if (resultado.success) {
      toast.success("Rota ativada!");
      carregarDados();
    } else {
      toast.error(resultado.error || "Erro ao ativar");
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

  return (
    <BusqueiLayout>
      <GradientHeader>Rotas Prioritárias</GradientHeader>

      {/* Formulário de Criação */}
      <Card className="p-6 mb-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Criar Nova Rota Prioritária
        </h3>

        <form onSubmit={handleCriarRota} className="space-y-4">
          <div>
            <Label htmlFor="establishment">Estabelecimento</Label>
            <Select value={establishmentId} onValueChange={setEstablishmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estabelecimento" />
              </SelectTrigger>
              <SelectContent>
                {estabelecimentos.map((estab) => (
                  <SelectItem key={estab.id} value={estab.id}>
                    {estab.nome} ({estab.tipo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="produto">Produto</Label>
            <Input
              id="produto"
              value={produto}
              onChange={(e) => setProduto(e.target.value)}
              placeholder="Ex: Coca-Cola 2L"
              required
            />
          </div>

          <div>
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Ex: Promoção especial! Leve 2 e pague 1"
              rows={3}
              required
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Criando..." : "Criar Rota Prioritária"}
          </Button>
        </form>
      </Card>

      {/* Lista de Rotas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Rotas Cadastradas ({rotas.length})
        </h3>

        {rotas.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <p className="text-center text-muted-foreground">
              Nenhuma rota prioritária cadastrada ainda.
            </p>
          </Card>
        ) : (
          rotas.map((rota) => (
            <Card
              key={rota.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {rota.ativo ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <h4 className="text-lg font-semibold text-foreground">
                      {rota.produto}
                    </h4>
                    <Badge
                      className={
                        rota.ativo
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }
                    >
                      {rota.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <p className="text-muted-foreground mb-2">{rota.mensagem}</p>

                  <p className="text-sm text-muted-foreground">
                    Estabelecimento:{" "}
                    {rota.establishments?.nome || "Não especificado"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-2">
                    Criado em:{" "}
                    {new Date(rota.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {rota.ativo ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDesativar(rota.id)}
                    >
                      Desativar
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAtivar(rota.id)}
                    >
                      Ativar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </BusqueiLayout>
  );
};

export default AdmRotasPrioritariasPage;
