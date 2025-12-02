import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmRole } from "@/hooks/useAdmRole";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { listarEstabelecimentos, criarEstabelecimento, atualizarEstabelecimento } from "@/services/admService";

const AdmEstabelecimentosPage = () => {
  const navigate = useNavigate();
  const { isAdmUser, loading: roleLoading } = useAdmRole();
  const [estabelecimentos, setEstabelecimentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [precoNivel, setPrecoNivel] = useState("");

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
    const resultado = await listarEstabelecimentos();
    if (resultado.success) {
      setEstabelecimentos(resultado.data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim() || !tipo) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    const data = { nome, tipo, descricao: descricao || null, preco_nivel: precoNivel || null };

    if (editando) {
      const resultado = await atualizarEstabelecimento(editando.id, data);
      if (resultado.success) {
        toast.success("Estabelecimento atualizado!");
        await carregar();
        fecharDialog();
      } else {
        toast.error(resultado.error || "Erro");
      }
    } else {
      const resultado = await criarEstabelecimento(data);
      if (resultado.success) {
        toast.success("Estabelecimento criado!");
        await carregar();
        fecharDialog();
      } else {
        toast.error(resultado.error || "Erro");
      }
    }
  };

  const abrirEdicao = (estab: any) => {
    setEditando(estab);
    setNome(estab.nome);
    setTipo(estab.tipo);
    setDescricao(estab.descricao || "");
    setPrecoNivel(estab.preco_nivel || "");
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditando(null);
    setNome("");
    setTipo("");
    setDescricao("");
    setPrecoNivel("");
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
      <GradientHeader>Gerenciar Estabelecimentos</GradientHeader>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{estabelecimentos.length} estabelecimento(s)</p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => fecharDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Estabelecimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editando ? "Editar" : "Novo"} Estabelecimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercado">Mercado</SelectItem>
                    <SelectItem value="padaria">Padaria</SelectItem>
                    <SelectItem value="farmacia">Farmácia</SelectItem>
                    <SelectItem value="petshop">Petshop</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                    <SelectItem value="lanchonete">Lanchonete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>
              <div>
                <Label>Nível de Preço</Label>
                <Select value={precoNivel} onValueChange={setPrecoNivel}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$</SelectItem>
                    <SelectItem value="$$">$$</SelectItem>
                    <SelectItem value="$$$">$$$</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">{editando ? "Atualizar" : "Criar"}</Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {estabelecimentos.map((estab) => (
          <Card key={estab.id} className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{estab.nome}</h3>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{estab.tipo}</Badge>
                  {estab.preco_nivel && <Badge variant="outline">{estab.preco_nivel}</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => abrirEdicao(estab)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </BusqueiLayout>
  );
};

export default AdmEstabelecimentosPage;
