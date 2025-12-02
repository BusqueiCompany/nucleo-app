import { supabase } from "@/integrations/supabase/client";

// Establishments
export async function listarEstabelecimentos() {
  try {
    const { data, error } = await supabase
      .from("establishments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar estabelecimentos:", error);
    return { success: false, error: "Erro ao listar estabelecimentos." };
  }
}

export async function criarEstabelecimento(data: any) {
  try {
    const { data: establishment, error } = await supabase
      .from("establishments")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: establishment };
  } catch (error) {
    console.error("Erro ao criar estabelecimento:", error);
    return { success: false, error: "Erro ao criar estabelecimento." };
  }
}

export async function atualizarEstabelecimento(id: string, data: any) {
  try {
    const { error } = await supabase
      .from("establishments")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar estabelecimento:", error);
    return { success: false, error: "Erro ao atualizar estabelecimento." };
  }
}

// Partners
export async function listarParceiros() {
  try {
    const { data, error } = await supabase
      .from("establishment_partners")
      .select(`
        *,
        establishments (nome, tipo),
        user_details (nome, email)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar parceiros:", error);
    return { success: false, error: "Erro ao listar parceiros." };
  }
}

export async function vincularParceiro(data: {
  user_id: string;
  establishment_id: string;
  admin?: boolean;
}) {
  try {
    const { error } = await supabase
      .from("establishment_partners")
      .insert(data);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao vincular parceiro:", error);
    return { success: false, error: "Erro ao vincular parceiro." };
  }
}

// Delivery Drivers
export async function listarEntregadores() {
  try {
    const { data, error } = await supabase
      .from("delivery_drivers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar entregadores:", error);
    return { success: false, error: "Erro ao listar entregadores." };
  }
}

export async function atualizarEntregador(id: string, data: any) {
  try {
    const { error } = await supabase
      .from("delivery_drivers")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar entregador:", error);
    return { success: false, error: "Erro ao atualizar entregador." };
  }
}

// Global Notifications
export async function listarNotificacoesGlobais() {
  try {
    const { data, error } = await supabase
      .from("global_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar notificações:", error);
    return { success: false, error: "Erro ao listar notificações." };
  }
}

export async function criarNotificacaoGlobal(data: {
  titulo: string;
  mensagem: string;
  tipo?: string;
  imagem_url?: string;
  enviado_por: string;
}) {
  try {
    const { error } = await supabase
      .from("global_notifications")
      .insert(data);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return { success: false, error: "Erro ao criar notificação." };
  }
}

// Global Promotions
export async function listarPromocoesGlobais() {
  try {
    const { data, error } = await supabase
      .from("global_promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar promoções:", error);
    return { success: false, error: "Erro ao listar promoções." };
  }
}

export async function criarPromocaoGlobal(data: {
  titulo: string;
  descricao?: string;
  desconto_percent?: number;
  inicio?: string;
  fim?: string;
  imagem_url?: string;
  criado_por: string;
}) {
  try {
    const { error } = await supabase
      .from("global_promotions")
      .insert(data);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar promoção:", error);
    return { success: false, error: "Erro ao criar promoção." };
  }
}

// Priority Routes
export async function listarRotasPrioritarias() {
  try {
    const { data, error } = await supabase
      .from("priority_routes")
      .select(`
        *,
        establishments (nome, tipo)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Erro ao listar rotas prioritárias:", error);
    return { success: false, error: "Erro ao listar rotas prioritárias." };
  }
}

export async function criarRotaPrioritaria(data: {
  establishment_id: string;
  produto: string;
  mensagem: string;
  ativo?: boolean;
}) {
  try {
    const { error } = await supabase
      .from("priority_routes")
      .insert(data);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar rota prioritária:", error);
    return { success: false, error: "Erro ao criar rota prioritária." };
  }
}

export async function atualizarRotaPrioritaria(id: string, data: any) {
  try {
    const { error } = await supabase
      .from("priority_routes")
      .update(data)
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar rota prioritária:", error);
    return { success: false, error: "Erro ao atualizar rota prioritária." };
  }
}

// Stats
export async function obterEstatisticasGlobais() {
  try {
    const [users, establishments, drivers, vips] = await Promise.all([
      supabase.from("user_details").select("id", { count: "exact", head: true }),
      supabase.from("establishments").select("id", { count: "exact", head: true }),
      supabase.from("delivery_drivers").select("id", { count: "exact", head: true }),
      supabase.from("vip_subscriptions").select("id", { count: "exact", head: true }).eq("ativo", true),
    ]);

    return {
      success: true,
      data: {
        totalUsuarios: users.count || 0,
        totalEstabelecimentos: establishments.count || 0,
        totalEntregadores: drivers.count || 0,
        vipsAtivos: vips.count || 0,
      },
    };
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error);
    return { success: false, error: "Erro ao obter estatísticas." };
  }
}
