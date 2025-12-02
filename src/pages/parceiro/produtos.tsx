import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParceiroRole } from "@/hooks/useParceiroRole";
import { useAuth } from "@/contexts/AuthContext";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import GradientHeader from "@/components/ui/GradientHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  getEstablishmentByPartner,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductInCatalog,
  EstablishmentProduct,
} from "@/services/parceiroService";

const ParceiroProdutosPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isParceiroUser, loading: roleLoading } = useParceiroRole();
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [products, setProducts] = useState<EstablishmentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EstablishmentProduct | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("");
  const [preco, setPreco] = useState("");

  useEffect(() => {
    if (roleLoading) return;

    if (!isParceiroUser) {
      navigate("/");
      return;
    }

    if (user) {
      inicializar();
    }
  }, [roleLoading, isParceiroUser, user, navigate]);

  const inicializar = async () => {
    if (!user) return;

    setLoading(true);
    const establishment = await getEstablishmentByPartner(user.id);
    
    if (!establishment) {
      toast.error("Estabelecimento não encontrado");
      navigate("/parceiro");
      return;
    }

    setEstablishmentId(establishment.id);
    await carregarProdutos(establishment.id);
    setLoading(false);
  };

  const carregarProdutos = async (estabId: string) => {
    const data = await listProducts(estabId);
    setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!establishmentId) {
      toast.error("Estabelecimento não identificado");
      return;
    }

    if (!nome.trim() || !categoria || !unidade || !preco) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (editingProduct) {
      // Atualizar preço
      const resultado = await updateProduct(editingProduct.id, {
        preco: parseFloat(preco),
      });

      if (resultado.success) {
        toast.success("Produto atualizado com sucesso!");
        await carregarProdutos(establishmentId);
        fecharDialog();
      } else {
        toast.error(resultado.error || "Erro ao atualizar produto");
      }
    } else {
      // Criar produto novo no catálogo primeiro
      const resultadoCatalogo = await createProductInCatalog({
        nome,
        categoria,
        unidade,
      });

      if (!resultadoCatalogo.success || !resultadoCatalogo.productId) {
        toast.error(resultadoCatalogo.error || "Erro ao criar produto");
        return;
      }

      // Depois vincular ao estabelecimento
      const resultado = await createProduct({
        establishment_id: establishmentId,
        product_id: resultadoCatalogo.productId,
        preco: parseFloat(preco),
      });

      if (resultado.success) {
        toast.success("Produto criado com sucesso!");
        await carregarProdutos(establishmentId);
        fecharDialog();
      } else {
        toast.error(resultado.error || "Erro ao criar produto");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir este produto?")) return;

    const resultado = await deleteProduct(id);

    if (resultado.success) {
      toast.success("Produto excluído com sucesso!");
      if (establishmentId) {
        await carregarProdutos(establishmentId);
      }
    } else {
      toast.error(resultado.error || "Erro ao excluir produto");
    }
  };

  const abrirDialogEdicao = (product: EstablishmentProduct) => {
    setEditingProduct(product);
    setNome(product.products?.nome || "");
    setCategoria(product.products?.categoria || "");
    setUnidade(product.products?.unidade || "");
    setPreco(product.preco.toString());
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setNome("");
    setCategoria("");
    setUnidade("");
    setPreco("");
  };

  if (roleLoading || loading) {
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
      <GradientHeader>Gerenciar Produtos</GradientHeader>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {products.length} produto(s) cadastrado(s)
        </p>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => fecharDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={!!editingProduct}
                  required
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={categoria}
                  onValueChange={setCategoria}
                  disabled={!!editingProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hortifruti">Hortifruti</SelectItem>
                    <SelectItem value="bebidas">Bebidas</SelectItem>
                    <SelectItem value="laticinios">Laticínios</SelectItem>
                    <SelectItem value="padaria">Padaria</SelectItem>
                    <SelectItem value="carnes">Carnes</SelectItem>
                    <SelectItem value="higiene">Higiene</SelectItem>
                    <SelectItem value="limpeza">Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="unidade">Unidade</Label>
                <Select
                  value={unidade}
                  onValueChange={setUnidade}
                  disabled={!!editingProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade</SelectItem>
                    <SelectItem value="kg">Quilograma</SelectItem>
                    <SelectItem value="g">Grama</SelectItem>
                    <SelectItem value="l">Litro</SelectItem>
                    <SelectItem value="ml">Mililitro</SelectItem>
                    <SelectItem value="cx">Caixa</SelectItem>
                    <SelectItem value="pct">Pacote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Produtos */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <Card className="p-12 backdrop-blur-sm bg-card/80 border-border/50">
            <p className="text-center text-muted-foreground">
              Nenhum produto cadastrado ainda.
            </p>
          </Card>
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              className="p-6 backdrop-blur-sm bg-card/80 border-border/50 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {product.products?.nome}
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {product.products?.categoria}
                    </Badge>
                    <Badge variant="outline">{product.products?.unidade}</Badge>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    R$ {product.preco.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirDialogEdicao(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash className="w-4 h-4" />
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

export default ParceiroProdutosPage;
