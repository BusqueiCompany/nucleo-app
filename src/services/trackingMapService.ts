import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface TrackingData {
  order: any;
  establishment: any;
  delivery: any;
  driver: any;
}

/**
 * Buscar dados completos do tracking
 */
export const getTrackingData = async (
  orderId: string
): Promise<TrackingData | null> => {
  try {
    // Buscar pedido com estabelecimento
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        establishments (*)
      `)
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Erro ao buscar pedido:", orderError);
      return null;
    }

    // Buscar delivery relacionado
    const { data: delivery, error: deliveryError } = await supabase
      .from("deliveries")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (deliveryError) {
      console.error("Erro ao buscar entrega:", deliveryError);
    }

    // Se houver delivery, buscar driver
    let driver = null;
    if (delivery?.driver_id) {
      const { data: driverData, error: driverError } = await supabase
        .from("delivery_drivers")
        .select("*")
        .eq("id", delivery.driver_id)
        .single();

      if (driverError) {
        console.error("Erro ao buscar entregador:", driverError);
      } else {
        driver = driverData;
      }
    }

    return {
      order,
      establishment: order.establishments,
      delivery,
      driver,
    };
  } catch (error) {
    console.error("Erro ao buscar dados de tracking:", error);
    return null;
  }
};

/**
 * Escutar mudanças em tempo real
 */
let activeChannels: RealtimeChannel[] = [];

export const subscribeTracking = (
  orderId: string,
  callback: (data: any) => void
): (() => void) => {
  // Canal para mudanças no pedido
  const orderChannel = supabase
    .channel(`order-tracking-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log("Order change:", payload);
        callback({ type: "order", payload });
      }
    )
    .subscribe();

  // Canal para mudanças na entrega
  const deliveryChannel = supabase
    .channel(`delivery-tracking-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deliveries",
        filter: `order_id=eq.${orderId}`,
      },
      (payload) => {
        console.log("Delivery change:", payload);
        callback({ type: "delivery", payload });
      }
    )
    .subscribe();

  activeChannels.push(orderChannel, deliveryChannel);

  // Retornar função de cleanup
  return () => {
    supabase.removeChannel(orderChannel);
    supabase.removeChannel(deliveryChannel);
    activeChannels = activeChannels.filter(
      (ch) => ch !== orderChannel && ch !== deliveryChannel
    );
  };
};

/**
 * Desinscrever de todos os canais
 */
export const unsubscribeAll = () => {
  activeChannels.forEach((channel) => {
    supabase.removeChannel(channel);
  });
  activeChannels = [];
};
