import { supabase } from "@/integrations/supabase/client";

export interface DeliveryTrackingData {
  delivery: {
    id: string;
    status: string;
    order_id: string;
    driver_id: string;
    valor: number;
  };
  order: {
    id: string;
    endereco_entrega: string;
    status: string;
    valor_total: number;
    user_id: string;
  };
  establishment: {
    id: string;
    nome: string;
    latitude: number;
    longitude: number;
  };
  customer: {
    nome: string;
    telefone: string;
    latitude: number;
    longitude: number;
  };
  driver: {
    id: string;
    nome: string;
    telefone: string;
    latitude: number;
    longitude: number;
  };
}

// Mock coordinates for demonstration (Zona Oeste RJ)
const MOCK_ESTABLISHMENTS: Record<string, { latitude: number; longitude: number }> = {
  default: { latitude: -22.905, longitude: -43.555 }
};

const MOCK_CUSTOMERS: Record<string, { latitude: number; longitude: number }> = {
  default: { latitude: -22.915, longitude: -43.545 }
};

// Store active subscriptions
let activeChannel: ReturnType<typeof supabase.channel> | null = null;

export const getActiveDelivery = async (driverId: string): Promise<DeliveryTrackingData | null> => {
  try {
    // Buscar entrega ativa (não entregue)
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("driver_id", driverId)
      .neq("status", "entregue")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (deliveryError || !delivery) {
      return null;
    }

    // Buscar order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, establishments(*)")
      .eq("id", delivery.order_id)
      .single();

    if (orderError || !order) {
      return null;
    }

    // Buscar dados do cliente
    const { data: customerDetails } = await supabase
      .from("user_details")
      .select("nome, telefone, bairro, rua, numero")
      .eq("user_id", order.user_id)
      .single();

    // Buscar dados do entregador
    const { data: driver } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("id", driverId)
      .single();

    const establishment = order.establishments as any;

    return {
      delivery: {
        id: delivery.id,
        status: delivery.status,
        order_id: delivery.order_id || "",
        driver_id: delivery.driver_id || "",
        valor: delivery.valor || 0
      },
      order: {
        id: order.id,
        endereco_entrega: order.endereco_entrega,
        status: order.status,
        valor_total: order.valor_total || 0,
        user_id: order.user_id
      },
      establishment: {
        id: establishment?.id || "",
        nome: establishment?.nome || "Estabelecimento",
        latitude: MOCK_ESTABLISHMENTS.default.latitude,
        longitude: MOCK_ESTABLISHMENTS.default.longitude
      },
      customer: {
        nome: customerDetails?.nome || "Cliente",
        telefone: customerDetails?.telefone || "",
        latitude: MOCK_CUSTOMERS.default.latitude,
        longitude: MOCK_CUSTOMERS.default.longitude
      },
      driver: {
        id: driver?.id || driverId,
        nome: driver?.nome || "Entregador",
        telefone: driver?.telefone || "",
        latitude: -22.91,
        longitude: -43.55
      }
    };
  } catch (error) {
    console.error("Erro ao buscar entrega ativa:", error);
    return null;
  }
};

export const updateDeliveryStatus = async (
  deliveryId: string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("deliveries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", deliveryId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Atualizar status do pedido correspondente
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("order_id")
      .eq("id", deliveryId)
      .single();

    if (delivery?.order_id) {
      let orderStatus = "em-preparo";
      if (status === "retirado") orderStatus = "saiu-para-entrega";
      if (status === "a_caminho") orderStatus = "saiu-para-entrega";
      if (status === "entregue") orderStatus = "entregue";

      await supabase
        .from("orders")
        .update({ status: orderStatus, updated_at: new Date().toISOString() })
        .eq("id", delivery.order_id);
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateDriverLocation = async (
  driverId: string,
  latitude: number,
  longitude: number
): Promise<{ success: boolean; error?: string }> => {
  // Como não temos coluna de lat/lng no banco, apenas logamos
  // Em produção, você adicionaria essas colunas via migration
  console.log(`Driver ${driverId} location updated:`, { latitude, longitude });
  return { success: true };
};

export const subscribeDelivery = (
  driverId: string,
  callback: (data: any) => void
): (() => void) => {
  // Cleanup previous subscription
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
  }

  activeChannel = supabase
    .channel(`delivery-tracking-${driverId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deliveries",
        filter: `driver_id=eq.${driverId}`
      },
      (payload) => {
        callback({ type: "delivery", payload });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders"
      },
      (payload) => {
        callback({ type: "order", payload });
      }
    )
    .subscribe();

  return () => {
    if (activeChannel) {
      supabase.removeChannel(activeChannel);
      activeChannel = null;
    }
  };
};

export const unsubscribeAll = () => {
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  }
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendente: "Aguardando",
    aceito: "Aceito",
    retirado: "Retirado",
    a_caminho: "A Caminho",
    entregue: "Entregue"
  };
  return labels[status] || status;
};

export const getNextStatus = (currentStatus: string): string | null => {
  const flow: Record<string, string> = {
    pendente: "aceito",
    aceito: "retirado",
    retirado: "a_caminho",
    a_caminho: "entregue"
  };
  return flow[currentStatus] || null;
};
