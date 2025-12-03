import { supabase } from "@/integrations/supabase/client";

export interface DriverMarker {
  id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  status_online: boolean;
  latitude: number;
  longitude: number;
  currentDeliveryId?: string;
}

export interface EstablishmentMarker {
  id: string;
  nome: string;
  tipo: string;
  latitude: number;
  longitude: number;
}

export interface OrderMarker {
  id: string;
  status: string;
  valor_total: number;
  establishment_id: string;
  establishment_nome: string;
  endereco_entrega: string;
  latitude: number;
  longitude: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

// Mock coordinates for demonstration (Zona Oeste RJ area)
const MOCK_DRIVER_LOCATIONS = [
  { lat: -22.905, lng: -43.555 },
  { lat: -22.912, lng: -43.548 },
  { lat: -22.898, lng: -43.562 },
  { lat: -22.920, lng: -43.540 },
  { lat: -22.908, lng: -43.570 },
];

const MOCK_ESTABLISHMENT_LOCATIONS = [
  { lat: -22.903, lng: -43.550 },
  { lat: -22.915, lng: -43.545 },
  { lat: -22.900, lng: -43.560 },
  { lat: -22.918, lng: -43.555 },
  { lat: -22.895, lng: -43.548 },
];

const MOCK_ORDER_LOCATIONS = [
  { lat: -22.910, lng: -43.552 },
  { lat: -22.907, lng: -43.558 },
  { lat: -22.922, lng: -43.543 },
  { lat: -22.899, lng: -43.565 },
];

let activeChannels: ReturnType<typeof supabase.channel>[] = [];

export const listarEntregadoresOnline = async (): Promise<DriverMarker[]> => {
  try {
    const { data: drivers, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("status_online", true);

    if (error) throw error;

    // Add mock coordinates for demonstration
    return (drivers || []).map((driver, index) => ({
      id: driver.id,
      nome: driver.nome,
      telefone: driver.telefone,
      veiculo: driver.veiculo,
      status_online: driver.status_online || false,
      latitude: MOCK_DRIVER_LOCATIONS[index % MOCK_DRIVER_LOCATIONS.length].lat,
      longitude: MOCK_DRIVER_LOCATIONS[index % MOCK_DRIVER_LOCATIONS.length].lng,
    }));
  } catch (error) {
    console.error("Erro ao listar entregadores:", error);
    return [];
  }
};

export const listarTodosEntregadores = async (): Promise<DriverMarker[]> => {
  try {
    const { data: drivers, error } = await supabase
      .from("delivery_drivers")
      .select("*");

    if (error) throw error;

    return (drivers || []).map((driver, index) => ({
      id: driver.id,
      nome: driver.nome,
      telefone: driver.telefone,
      veiculo: driver.veiculo,
      status_online: driver.status_online || false,
      latitude: MOCK_DRIVER_LOCATIONS[index % MOCK_DRIVER_LOCATIONS.length].lat,
      longitude: MOCK_DRIVER_LOCATIONS[index % MOCK_DRIVER_LOCATIONS.length].lng,
    }));
  } catch (error) {
    console.error("Erro ao listar entregadores:", error);
    return [];
  }
};

export const listarEstabelecimentos = async (): Promise<EstablishmentMarker[]> => {
  try {
    const { data: establishments, error } = await supabase
      .from("establishments")
      .select("*");

    if (error) throw error;

    return (establishments || []).map((est, index) => ({
      id: est.id,
      nome: est.nome,
      tipo: est.tipo,
      latitude: MOCK_ESTABLISHMENT_LOCATIONS[index % MOCK_ESTABLISHMENT_LOCATIONS.length].lat,
      longitude: MOCK_ESTABLISHMENT_LOCATIONS[index % MOCK_ESTABLISHMENT_LOCATIONS.length].lng,
    }));
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    return [];
  }
};

export const listarPedidosAtivos = async (): Promise<OrderMarker[]> => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, establishments(nome)")
      .neq("status", "entregue")
      .neq("status", "cancelado")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (orders || []).map((order, index) => ({
      id: order.id,
      status: order.status,
      valor_total: order.valor_total || 0,
      establishment_id: order.establishment_id,
      establishment_nome: (order.establishments as any)?.nome || "Estabelecimento",
      endereco_entrega: order.endereco_entrega,
      latitude: MOCK_ORDER_LOCATIONS[index % MOCK_ORDER_LOCATIONS.length].lat,
      longitude: MOCK_ORDER_LOCATIONS[index % MOCK_ORDER_LOCATIONS.length].lng,
    }));
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return [];
  }
};

export const generateHeatmapFromOrders = async (): Promise<HeatmapPoint[]> => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 30 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Generate heatmap points based on order density
    const points: HeatmapPoint[] = [];
    const basePoints = MOCK_ORDER_LOCATIONS;
    
    basePoints.forEach((point, i) => {
      const intensity = Math.random() * 0.5 + 0.5;
      points.push({
        latitude: point.lat + (Math.random() - 0.5) * 0.01,
        longitude: point.lng + (Math.random() - 0.5) * 0.01,
        intensity,
      });
    });

    // Add more points for density
    for (let i = 0; i < (orders?.length || 5); i++) {
      const basePoint = basePoints[i % basePoints.length];
      points.push({
        latitude: basePoint.lat + (Math.random() - 0.5) * 0.02,
        longitude: basePoint.lng + (Math.random() - 0.5) * 0.02,
        intensity: Math.random() * 0.7 + 0.3,
      });
    }

    return points;
  } catch (error) {
    console.error("Erro ao gerar heatmap:", error);
    return [];
  }
};

export const generateHeatmapFromDrivers = async (): Promise<HeatmapPoint[]> => {
  const drivers = await listarTodosEntregadores();
  
  return drivers.map(driver => ({
    latitude: driver.latitude + (Math.random() - 0.5) * 0.005,
    longitude: driver.longitude + (Math.random() - 0.5) * 0.005,
    intensity: driver.status_online ? 1 : 0.3,
  }));
};

export const subscribeDrivers = (callback: (payload: any) => void): (() => void) => {
  const channel = supabase
    .channel("admin-drivers")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "delivery_drivers" },
      callback
    )
    .subscribe();

  activeChannels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    activeChannels = activeChannels.filter(c => c !== channel);
  };
};

export const subscribeOrders = (callback: (payload: any) => void): (() => void) => {
  const channel = supabase
    .channel("admin-orders")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      callback
    )
    .subscribe();

  activeChannels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    activeChannels = activeChannels.filter(c => c !== channel);
  };
};

export const subscribeEstablishments = (callback: (payload: any) => void): (() => void) => {
  const channel = supabase
    .channel("admin-establishments")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "establishments" },
      callback
    )
    .subscribe();

  activeChannels.push(channel);

  return () => {
    supabase.removeChannel(channel);
    activeChannels = activeChannels.filter(c => c !== channel);
  };
};

export const unsubscribeAll = () => {
  activeChannels.forEach(channel => {
    supabase.removeChannel(channel);
  });
  activeChannels = [];
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    "em-preparo": "Em Preparo",
    "aguardando-entregador": "Aguardando Entregador",
    "saiu-para-entrega": "Em Entrega",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pendente: "#f59e0b",
    confirmado: "#3b82f6",
    "em-preparo": "#8b5cf6",
    "aguardando-entregador": "#f97316",
    "saiu-para-entrega": "#14b8a6",
    entregue: "#22c55e",
    cancelado: "#ef4444",
  };
  return colors[status] || "#6b7280";
};
