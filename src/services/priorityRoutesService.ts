import { supabase } from "@/integrations/supabase/client";

export interface PriorityRoute {
  id: string;
  establishment_id: string | null;
  produto: string;
  mensagem: string;
  ativo: boolean;
  created_at: string;
  establishments?: {
    nome: string;
    foto_url: string | null;
  };
}

/**
 * Cria uma nova rota prioritária
 */
export const criarRota = async (
  establishmentId: string,
  produto: string,
  mensagem: string
): Promise<{ success: boolean; error?: string; routeId?: string }> => {
  try {
    const { data, error } = await supabase
      .from("priority_routes")
      .insert({
        establishment_id: establishmentId,
        produto,
        mensagem,
        ativo: true,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao criar rota prioritária:", error);
      return { success: false, error: error?.message || "Erro ao criar rota" };
    }

    return { success: true, routeId: data.id };
  } catch (error) {
    console.error("Erro ao criar rota prioritária:", error);
    return { success: false, error: "Erro ao criar rota" };
  }
};

/**
 * Lista todas as rotas prioritárias
 */
export const listarRotas = async (): Promise<PriorityRoute[]> => {
  try {
    const { data, error } = await supabase
      .from("priority_routes")
      .select(
        `
        *,
        establishments (nome, foto_url)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar rotas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao listar rotas:", error);
    return [];
  }
};

/**
 * Lista apenas rotas ativas
 */
export const listarAtivas = async (): Promise<PriorityRoute[]> => {
  try {
    const { data, error } = await supabase
      .from("priority_routes")
      .select(
        `
        *,
        establishments (nome, foto_url)
      `
      )
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao listar rotas ativas:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro ao listar rotas ativas:", error);
    return [];
  }
};

/**
 * Desativa uma rota prioritária
 */
export const desativarRota = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("priority_routes")
      .update({ ativo: false })
      .eq("id", id);

    if (error) {
      console.error("Erro ao desativar rota:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao desativar rota:", error);
    return { success: false, error: "Erro ao desativar rota" };
  }
};

/**
 * Ativa uma rota prioritária
 */
export const ativarRota = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from("priority_routes")
      .update({ ativo: true })
      .eq("id", id);

    if (error) {
      console.error("Erro ao ativar rota:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao ativar rota:", error);
    return { success: false, error: "Erro ao ativar rota" };
  }
};
