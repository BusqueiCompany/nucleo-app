import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  qtd: number;
  imagem: string;
  mercadoId: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qtd">) => void;
  removeItem: (id: number) => void;
  increaseQty: (id: number) => void;
  decreaseQty: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("busquei_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("busquei_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "qtd">) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      
      if (existingItem) {
        toast({
          title: "Quantidade atualizada",
          description: `${item.nome} já está no carrinho`,
        });
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, qtd: i.qtd + 1 } : i
        );
      }

      toast({
        title: "Adicionado ao carrinho",
        description: `${item.nome} foi adicionado`,
      });
      return [...prevItems, { ...item, qtd: 1 }];
    });
  };

  const removeItem = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    toast({
      title: "Item removido",
      description: "Produto removido do carrinho",
      variant: "destructive",
    });
  };

  const increaseQty = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, qtd: item.qtd + 1 } : item
      )
    );
  };

  const decreaseQty = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.qtd > 1 ? { ...item, qtd: item.qtd - 1 } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os itens foram removidos",
    });
  };

  const subtotal = items.reduce((sum, item) => sum + item.preco * item.qtd, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qtd, 0);

  const value = {
    items,
    addItem,
    removeItem,
    increaseQty,
    decreaseQty,
    clearCart,
    subtotal,
    totalItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
