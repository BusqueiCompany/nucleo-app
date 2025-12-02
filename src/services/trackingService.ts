import { supabase } from "@/integrations/supabase/client";

export interface TrackingData {
  order: {
    id: string;
    status: string;
    endereco_entrega: string;
    establishment_id: string;
    created_at: string;
  } | null;
  establishment: {
    id: string;
    nome: string;
    latitude: number;
    longitude: number;
  } | null;
  delivery: {
    id: string;
    status: string;
    driver_id: string | null;
  } | null;
  driver: {
    id: string;
    nome: string;
    telefone: string;
    foto_url: string | null;
    veiculo: string;
    placa: string | null;
    latitude: number;
    longitude: number;
  } | null;
}

// Posições mock para demonstração (Zona Oeste RJ)
const MOCK_POSITIONS = {
  establishment: { lat: -22.9064, lng: -43.5607 },
  customer: { lat: -22.9150, lng: -43.5500 },
  driver: { lat: -22.9100, lng: -43.5550 }
};

export async function getTrackingData(orderId: string): Promise<TrackingData> {
  try {
    // Buscar pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status, endereco_entrega, establishment_id, created_at")
      .eq("id", orderId)
      .single();

    if (orderError) {
      console.error("Erro ao buscar pedido:", orderError);
      return { order: null, establishment: null, delivery: null, driver: null };
    }

    // Buscar estabelecimento
    const { data: establishment } = await supabase
      .from("establishments")
      .select("id, nome")
      .eq("id", order.establishment_id)
      .single();

    // Buscar entrega
    const { data: delivery } = await supabase
      .from("deliveries")
      .select("id, status, driver_id")
      .eq("order_id", orderId)
      .single();

    // Buscar entregador se houver
    let driver = null;
    if (delivery?.driver_id) {
      const { data: driverData } = await supabase
        .from("delivery_drivers")
        .select("id, nome, telefone, foto_url, veiculo, placa")
        .eq("id", delivery.driver_id)
        .single();
      
      if (driverData) {
        driver = {
          ...driverData,
          // Usar posição mock por enquanto (a tabela não tem lat/lng ainda)
          latitude: MOCK_POSITIONS.driver.lat,
          longitude: MOCK_POSITIONS.driver.lng
        };
      }
    }

    return {
      order,
      establishment: establishment ? {
        ...establishment,
        // Usar posição mock por enquanto
        latitude: MOCK_POSITIONS.establishment.lat,
        longitude: MOCK_POSITIONS.establishment.lng
      } : null,
      delivery,
      driver
    };
  } catch (error) {
    console.error("Erro ao buscar dados de tracking:", error);
    return { order: null, establishment: null, delivery: null, driver: null };
  }
}

// Callback type for real-time updates
type TrackingCallback = (data: Partial<TrackingData>) => void;

// Store subscriptions
let orderChannel: ReturnType<typeof supabase.channel> | null = null;
let deliveryChannel: ReturnType<typeof supabase.channel> | null = null;

export function subscribeTracking(orderId: string, callback: TrackingCallback) {
  // Subscribe to order changes
  orderChannel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      },
      (payload) => {
        console.log('Order updated:', payload);
        callback({ order: payload.new as TrackingData['order'] });
      }
    )
    .subscribe();

  // Subscribe to delivery changes
  deliveryChannel = supabase
    .channel(`delivery-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deliveries',
        filter: `order_id=eq.${orderId}`
      },
      async (payload) => {
        console.log('Delivery updated:', payload);
        const delivery = payload.new as TrackingData['delivery'];
        
        // Se houver driver_id, buscar dados do entregador
        let driver = null;
        if (delivery?.driver_id) {
          const { data: driverData } = await supabase
            .from("delivery_drivers")
            .select("id, nome, telefone, foto_url, veiculo, placa")
            .eq("id", delivery.driver_id)
            .single();
          
          if (driverData) {
            driver = {
              ...driverData,
              latitude: MOCK_POSITIONS.driver.lat + (Math.random() - 0.5) * 0.01,
              longitude: MOCK_POSITIONS.driver.lng + (Math.random() - 0.5) * 0.01
            };
          }
        }
        
        callback({ delivery, driver });
      }
    )
    .subscribe();
}

export function unsubscribeAll() {
  if (orderChannel) {
    supabase.removeChannel(orderChannel);
    orderChannel = null;
  }
  if (deliveryChannel) {
    supabase.removeChannel(deliveryChannel);
    deliveryChannel = null;
  }
}

// Status labels em português
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pendente: "Aguardando confirmação",
  confirmado: "Pedido confirmado",
  preparando: "Em preparação",
  pronto: "Pronto para entrega",
  em_entrega: "Saiu para entrega",
  entregue: "Pedido entregue",
  cancelado: "Pedido cancelado"
};

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pendente: "Aguardando entregador",
  aceito: "Entregador a caminho do estabelecimento",
  coletado: "Pedido coletado",
  em_rota: "A caminho do seu endereço",
  entregue: "Entrega realizada"
};
