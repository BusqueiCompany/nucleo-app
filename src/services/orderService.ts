import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  user_id: string;
  establishment_id: string;
  status: string;
  valor_total: number;
  endereco_entrega: string;
  metodo_pagamento: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantidade: number;
  preco_unit: number;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
  establishments?: {
    nome: string;
    foto_url: string | null;
  };
}

/**
 * Cria um novo pedido com seus itens
 */
export const criarPedido = async (
  establishmentId: string,
  valorTotal: number,
  enderecoEntrega: string,
  metodoPagamento: string,
  items: Array<{ product_id: string; quantidade: number; preco_unit: number }>
): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Usuário não autenticado" };
    }

    // Criar o pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        establishment_id: establishmentId,
        status: "pendente",
        valor_total: valorTotal,
        endereco_entrega: enderecoEntrega,
        metodo_pagamento: metodoPagamento,
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Erro ao criar pedido:", orderError);
      return { success: false, error: orderError?.message || "Erro ao criar pedido" };
    }

    // Criar os itens do pedido
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantidade: item.quantidade,
      preco_unit: item.preco_unit,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Erro ao criar itens do pedido:", itemsError);
      return { success: false, error: "Erro ao criar itens do pedido" };
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return { success: false, error: "Erro ao criar pedido" };
  }
};

/**
 * Lista pedidos do estabelecimento (para parceiros)
 */
export const listarPedidosDoEstabelecimento = async (
  establishmentId: string
): Promise<OrderWithItems[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*)
      `
      )
      .eq("establishment_id", establishmentId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pedidos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return [];
  }
};

/**
 * Lista pedidos do cliente
 */
export const listarPedidosDoCliente = async (): Promise<OrderWithItems[]> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        establishments (nome, foto_url)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pedidos:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return [];
  }
};

/**
 * Busca um pedido específico por ID
 */
export const buscarPedidoPorId = async (
  orderId: string
): Promise<OrderWithItems | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        establishments (nome, foto_url)
      `
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Erro ao buscar pedido:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);
    return null;
  }
};

/**
 * Atualiza o status de um pedido
 */
export const atualizarStatusPedido = async (
  orderId: string,
  novoStatus: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status: novoStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro ao atualizar status" };
  }
};

/**
 * Lista pedidos aguardando entregador (para entregadores)
 */
export const listarPedidosAguardandoEntregador = async (): Promise<
  OrderWithItems[]
> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items (*),
        establishments (nome, foto_url)
      `
      )
      .eq("status", "aguardando-entregador")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar pedidos aguardando entregador:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao listar pedidos aguardando entregador:", error);
    return [];
  }
};

/**
 * Vincula um entregador a um pedido (cria delivery)
 */
export const vincularEntregador = async (
  orderId: string,
  driverId: string,
  distanciaMetros: number,
  valorEntrega: number
): Promise<{ success: boolean; deliveryId?: string; error?: string }> => {
  try {
    // Criar delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .insert({
        order_id: orderId,
        driver_id: driverId,
        status: "aceito",
        distancia_metros: distanciaMetros,
        valor: valorEntrega,
      })
      .select()
      .single();

    if (deliveryError || !delivery) {
      console.error("Erro ao criar delivery:", deliveryError);
      return { success: false, error: deliveryError?.message };
    }

    // Atualizar status do pedido
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "retirado" })
      .eq("id", orderId);

    if (updateError) {
      console.error("Erro ao atualizar status do pedido:", updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, deliveryId: delivery.id };
  } catch (error) {
    console.error("Erro ao vincular entregador:", error);
    return { success: false, error: "Erro ao vincular entregador" };
  }
};
