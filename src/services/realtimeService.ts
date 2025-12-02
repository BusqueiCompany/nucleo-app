import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Escuta mudanças em tempo real na tabela orders
 */
export const listenOrders = (
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel("orders-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        console.log("Order change received:", payload);
        callback(payload);
      }
    )
    .subscribe();

  // Retorna função de cleanup
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta mudanças em um pedido específico
 */
export const listenToOrder = (
  orderId: string,
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`order-${orderId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log("Specific order change:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta mudanças em tempo real na tabela deliveries
 */
export const listenDeliveries = (
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel("deliveries-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "deliveries",
      },
      (payload) => {
        console.log("Delivery change received:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta mudanças em tempo real na tabela priority_routes
 */
export const listenPriorityRoutes = (
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel("priority-routes-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "priority_routes",
      },
      (payload) => {
        console.log("Priority route change received:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta apenas INSERTS em uma tabela (útil para novos pedidos)
 */
export const listenNewOrders = (
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel("new-orders")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        console.log("New order created:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Escuta apenas UPDATES em uma tabela
 */
export const listenOrderUpdates = (
  callback: (payload: any) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel("order-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
      },
      (payload) => {
        console.log("Order updated:", payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
