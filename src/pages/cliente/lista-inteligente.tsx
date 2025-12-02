import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { ArrowLeft, Plus, Trash2, Edit2, Sparkles } from "lucide-react";
import { Home, ShoppingCart, User, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

const itemSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(1, { message: "Nome não pode estar vazio" })
    .max(100, { message: "Nome deve ter menos de 100 caracteres" }),
  quantidade: z
    .number()
    .min(1, { message: "Quantidade deve ser no mínimo 1" })
    .max(999, { message: "Quantidade deve ser no máximo 999" }),
});

interface ListItem {
  id: string;
  nome: string;
  quantidade: number;
}

const ListaInteligentePage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ListItem[]>([]);
  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState("1");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = () => {
    try {
      const qtd = parseInt(quantidade);
      
      const validated = itemSchema.parse({
        nome: nome,
        quantidade: qtd,
      });

      if (editingId) {
        setItems(
          items.map((item) =>
            item.id === editingId
              ? { ...item, nome: validated.nome, quantidade: validated.quantidade }
              : item
          )
        );
        toast.success("Item atualizado!");
        setEditingId(null);
      } else {
        const newItem: ListItem = {
          id: Date.now().toString(),
          nome: validated.nome,
          quantidade: validated.quantidade,
        };
        setItems([...items, newItem]);
        toast.success("Item adicionado!");
      }

      setNome("");
      setQuantidade("1");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  const handleEdit = (item: ListItem) => {
    setNome(item.nome);
    setQuantidade(item.quantidade.toString());
    setEditingId(item.id);
  };

  const handleRemove = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    toast.success("Item removido!");
    if (editingId === id) {
      setEditingId(null);
      setNome("");
      setQuantidade("1");
    }
  };

  const handleCalculate = () => {
    if (items.length === 0) {
      toast.error("Adicione pelo menos um item à lista!");
      return;
    }
    navigate("/cliente/lista-inteligente-result", { state: { items } });
  };

  return (
    <>
      <BusqueiLayout>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <Sparkles className="h-6 w-6 text-gradient-end" />
            <h1 className="text-2xl font-bold text-foreground">
              Lista Inteligente
            </h1>
          </div>
        </div>

        {/* VIP Notice */}
        <div className="bg-gradient-to-r from-gradient-start/10 to-gradient-end/10 backdrop-blur-md rounded-[1.5rem] p-4 shadow-sm mb-6 border border-gradient-end/20">
          <p className="text-sm text-foreground text-center">
            ✨ <span className="font-semibold">Assinantes VIP</span> visualizam
            automaticamente os preços mais baixos
          </p>
        </div>

        {/* Add Item Form */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? "Editar Item" : "Adicionar Item"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Nome do produto
              </label>
              <Input
                type="text"
                placeholder="Ex: Arroz 1kg"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={100}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Quantidade
              </label>
              <Input
                type="number"
                min="1"
                max="999"
                placeholder="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button
              onClick={handleAddOrUpdate}
              className="w-full rounded-xl bg-gradient-to-r from-gradient-start to-gradient-end"
            >
              {editingId ? (
                <>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Atualizar Item
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Items List */}
        {items.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Sua Lista ({items.length} {items.length === 1 ? "item" : "itens"})
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-background/50 rounded-xl p-4 border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{item.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantidade}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-primary" />
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={items.length === 0}
          className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          <Sparkles className="h-5 w-5 inline-block mr-2" />
          Calcular Economia
        </button>
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

export default ListaInteligentePage;
