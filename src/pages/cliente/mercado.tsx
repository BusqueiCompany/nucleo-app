import { ArrowLeft, Star, Clock, ShoppingCart, Plus, Home, Package, ShoppingBag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import BusqueiLayout from "@/components/layout/BusqueiLayout";
import BottomTabs from "@/components/ui/BottomTabs";
import { Badge } from "@/components/ui/badge";

const MercadoPage = () => {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = ["Carnes", "Hortifruti", "Laticínios", "Bebidas", "Higiene"];

  const products = [
    { id: 1, name: "Arroz 1kg", price: 5.99, image: "" },
    { id: 2, name: "Feijão 1kg", price: 7.50, image: "" },
    { id: 3, name: "Açúcar 1kg", price: 4.20, image: "" },
    { id: 4, name: "Leite 1L", price: 4.99, image: "" },
    { id: 5, name: "Detergente", price: 2.90, image: "" },
  ];

  const tabs = [
    { icon: Home, label: "Início", path: "/cliente" },
    { icon: Package, label: "Pedidos", path: "/cliente/pedidos" },
    { icon: ShoppingBag, label: "Carrinho", path: "/cliente/carrinho" },
    { icon: User, label: "Perfil", path: "/cliente/perfil" },
  ];

  const handleAddToCart = () => {
    setCartCount(cartCount + 1);
  };

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
          <h1 className="text-2xl font-bold text-foreground">Mercado Próximo</h1>
        </div>

        {/* Card do Mercado */}
        <div className="bg-white/80 backdrop-blur-md rounded-[1.5rem] p-5 shadow-md mb-6">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-gradient-to-br from-gradient-start to-gradient-end rounded-2xl flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground mb-2">Mercado Próximo</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="bg-gradient-end/10 text-gradient-end px-2 py-0.5 rounded-full font-medium">
                    850m
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">4.8</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Entrega em 25-35 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categorias */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <Badge
                key={category}
                onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                className={`cursor-pointer px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-gradient-start to-gradient-end text-white shadow-md"
                    : "bg-white/80 text-foreground hover:bg-white shadow-sm"
                }`}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Lista de Produtos */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">Produtos</h3>
          <div className="grid grid-cols-1 gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-gradient-start/20 to-gradient-end/20 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{product.name}</h4>
                    <p className="text-lg font-bold text-gradient-end">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow"
                  >
                    <Plus className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </BusqueiLayout>

      {/* Botão flutuante do Carrinho */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/cliente/carrinho")}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all z-50"
        >
          <ShoppingCart className="h-6 w-6 text-white" />
          <span className="absolute -top-1 -right-1 bg-white text-gradient-end text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md">
            {cartCount}
          </span>
        </button>
      )}

      <BottomTabs items={tabs} />
    </>
  );
};

export default MercadoPage;
