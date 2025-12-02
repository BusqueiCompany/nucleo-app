import { ArrowLeft, Trash2, Plus, Minus, Home, Package, ShoppingBag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { useCart } from "@/contexts/CartContext";

const CarrinhoPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, increaseQty, decreaseQty, subtotal, clearCart } = useCart();

  const taxa = 5.0;
  const total = subtotal + taxa;

  const tabs = [
    { icon: Home, label: "Início", path: "/cliente" },
    { icon: Package, label: "Pedidos", path: "/cliente/pedidos" },
    { icon: ShoppingBag, label: "Carrinho", path: "/cliente/carrinho" },
    { icon: User, label: "Perfil", path: "/cliente/perfil" },
  ];

  return (
    <>
      <BusqueiLayout>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Seu Carrinho</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-4">Seu carrinho está vazio</p>
            <button
              onClick={() => navigate("/cliente")}
              className="bg-gradient-to-r from-gradient-start to-gradient-end text-white px-6 py-3 rounded-[1.5rem] shadow-md hover:shadow-lg transition-shadow font-medium"
            >
              Começar a comprar
            </button>
          </div>
        ) : (
          <>
            {/* Lista de Itens */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-xl flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">{item.nome}</h4>
                      <p className="text-lg font-bold text-gradient-end">
                        R$ {item.preco.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                      >
                        <Minus className="h-4 w-4 text-foreground" />
                      </button>
                      <span className="w-8 text-center font-semibold text-foreground">
                        {item.qtd}
                      </span>
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
                      >
                        <Plus className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-10 h-10 bg-red-50 rounded-full shadow-sm flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Resumo do Pedido</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Taxa de entrega</span>
                  <span className="font-semibold">R$ {taxa.toFixed(2)}</span>
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between text-lg font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-gradient-end">R$ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={() => navigate("/cliente/checkout")}
                className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-[1.5rem] py-4 shadow-lg hover:shadow-xl transition-shadow font-semibold"
              >
                Finalizar Compra
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-white/80 text-foreground rounded-[1.5rem] py-3 shadow-sm hover:shadow-md transition-shadow font-medium"
              >
                Limpar Carrinho
              </button>
            </div>
          </>
        )}
      </BusqueiLayout>

      <BottomTabs items={tabs} />
    </>
  );
};

export default CarrinhoPage;
