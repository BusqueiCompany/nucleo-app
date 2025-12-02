import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import { useCart } from "@/contexts/CartContext";
import SlideToPay from "@/components/ui/SlideToPay";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, addItem } = useCart();

  const taxaEntrega = 4.99;
  const total = subtotal + taxaEntrega;

  const esqueceuItems = [
    { id: 101, nome: "Água Mineral", preco: 2.5, imagem: "" },
    { id: 102, nome: "Chiclete", preco: 1.0, imagem: "" },
    { id: 103, nome: "Papel Toalha", preco: 8.9, imagem: "" },
    { id: 104, nome: "Café 500g", preco: 12.5, imagem: "" },
  ];

  const handleComplete = () => {
    navigate("/cliente/confirmado");
  };

  return (
    <BusqueiLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      </div>

      {/* Itens no carrinho */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Seus itens
        </h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{item.nome}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.qtd}x R$ {item.preco.toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-gradient-end">
                R$ {(item.preco * item.qtd).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Esqueceu algo? */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Esqueceu algo?
        </h2>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {esqueceuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm flex-shrink-0 w-36"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-xl mb-3 mx-auto" />
                <h4 className="font-semibold text-foreground text-sm mb-1 text-center">
                  {item.nome}
                </h4>
                <p className="text-gradient-end font-bold text-center mb-2">
                  R$ {item.preco.toFixed(2)}
                </p>
                <button
                  onClick={() =>
                    addItem({
                      id: item.id,
                      nome: item.nome,
                      preco: item.preco,
                      imagem: item.imagem,
                      mercadoId: "mercado-1",
                    })
                  }
                  className="w-full bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-full py-2 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs font-medium">Adicionar</span>
                </button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Endereço de entrega */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Endereço de entrega
        </h2>
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 shadow-md">
          <h3 className="font-semibold text-foreground mb-2">Casa</h3>
          <p className="text-muted-foreground text-sm">
            Rua das Flores, 123
            <br />
            Jardim Primavera
            <br />
            CEP 12345-678
          </p>
        </div>
      </div>

      {/* Resumo de pagamento */}
      <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-6 shadow-md mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Resumo de pagamento
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-foreground">
            <span>Subtotal</span>
            <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-foreground">
            <span>Taxa de entrega</span>
            <span className="font-semibold">R$ {taxaEntrega.toFixed(2)}</span>
          </div>
          <div className="border-t border-border/50 pt-3 flex justify-between text-lg font-bold text-foreground">
            <span>Total</span>
            <span className="text-gradient-end">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Slide to Pay */}
      <SlideToPay onComplete={handleComplete} className="mb-6" />
    </BusqueiLayout>
  );
};

export default CheckoutPage;
