import { supabase } from "@/integrations/supabase/client";

export interface DeliveryDriver {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  placa: string | null;
  foto_url: string | null;
  status_online: boolean;
  created_at: string;
}

export interface Delivery {
  id: string;
  driver_id: string | null;
  order_id: string | null;
  status: string;
  valor: number | null;
  distancia_metros: number | null;
  created_at: string;
  updated_at: string;
}

export async function getDriver(userId: string): Promise<DeliveryDriver | null> {
  try {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return data as DeliveryDriver | null;
  } catch (error) {
    console.error("Erro ao buscar entregador:", error);
    return null;
  }
}

export async function createDriver(data: {
  user_id: string;
  nome: string;
  telefone: string;
  veiculo: string;
  placa?: string;
  foto_url?: string;
}): Promise<{ success: boolean; error?: string; driverId?: string }> {
  try {
    const { data: driver, error } = await supabase
      .from("delivery_drivers")
      .insert({
        user_id: data.user_id,
        nome: data.nome,
        telefone: data.telefone,
        veiculo: data.veiculo,
        placa: data.placa || null,
        foto_url: data.foto_url || null,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, driverId: driver.id };
  } catch (error) {
    console.error("Erro ao criar entregador:", error);
    return {
      success: false,
      error: "Erro ao criar perfil de entregador.",
    };
  }
}

export async function updateDriver(
  driverId: string,
  data: Partial<DeliveryDriver>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("delivery_drivers")
      .update(data)
      .eq("id", driverId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar entregador:", error);
    return {
      success: false,
      error: "Erro ao atualizar perfil.",
    };
  }
}

export async function atualizarStatusOnline(
  driverId: string,
  status: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("delivery_drivers")
      .update({ status_online: status })
      .eq("id", driverId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status online:", error);
    return {
      success: false,
      error: "Erro ao atualizar status.",
    };
  }
}

export async function listarEntregas(driverId: string): Promise<Delivery[]> {
  try {
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .eq("driver_id", driverId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []) as Delivery[];
  } catch (error) {
    console.error("Erro ao listar entregas:", error);
    return [];
  }
}

export async function atualizarStatusEntrega(
  deliveryId: string,
  novoStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("deliveries")
      .update({ status: novoStatus })
      .eq("id", deliveryId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status da entrega:", error);
    return {
      success: false,
      error: "Erro ao atualizar status.",
    };
  }
}

export async function uploadDriverPhoto(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("driver-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("driver-photos")
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Erro ao fazer upload da foto:", error);
    return {
      success: false,
      error: "Erro ao fazer upload da foto.",
    };
  }
}
