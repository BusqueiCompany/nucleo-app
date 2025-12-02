import { supabase } from "@/integrations/supabase/client";

export type PlanosVIP = "mensal" | "trimestral" | "anual";

interface PlanoDetalhes {
  nome: string;
  dias: number;
  preco: number;
  economia: string;
}

export const PLANOS: Record<PlanosVIP, PlanoDetalhes> = {
  mensal: {
    nome: "Mensal",
    dias: 30,
    preco: 19.9,
    economia: "R$ 50/mês",
  },
  trimestral: {
    nome: "Trimestral",
    dias: 90,
    preco: 49.9,
    economia: "R$ 150/trimestre",
  },
  anual: {
    nome: "Anual",
    dias: 365,
    preco: 149.9,
    economia: "R$ 600/ano",
  },
};

export async function assinarVIP(
  userId: string,
  plano: PlanosVIP
): Promise<{ success: boolean; error?: string }> {
  try {
    const planoDetalhes = PLANOS[plano];
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + planoDetalhes.dias);

    // Check if user already has a subscription
    const { data: existingSub } = await supabase
      .from("vip_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingSub) {
      // Update existing subscription
      const { error } = await supabase
        .from("vip_subscriptions")
        .update({
          plano: plano,
          ativo: true,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim.toISOString(),
        })
        .eq("user_id", userId);

      if (error) throw error;
    } else {
      // Create new subscription
      const { error } = await supabase.from("vip_subscriptions").insert({
        user_id: userId,
        plano: plano,
        ativo: true,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString(),
      });

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao assinar VIP:", error);
    return {
      success: false,
      error: "Erro ao processar assinatura. Tente novamente.",
    };
  }
}

export async function cancelarVIP(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("vip_subscriptions")
      .update({
        ativo: false,
      })
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao cancelar VIP:", error);
    return {
      success: false,
      error: "Erro ao cancelar assinatura. Tente novamente.",
    };
  }
}

export async function isVIP(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("vip_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .maybeSingle();

    if (!data) return false;

    // Check if subscription is still valid
    if (data.data_fim) {
      const dataFim = new Date(data.data_fim);
      return dataFim > new Date();
    }

    return true;
  } catch (error) {
    console.error("Erro ao verificar status VIP:", error);
    return false;
  }
}

export async function getVIPDetails(userId: string) {
  try {
    const { data } = await supabase
      .from("vip_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return null;

    const isValid = data.ativo && (!data.data_fim || new Date(data.data_fim) > new Date());

    return {
      plano: data.plano as PlanosVIP,
      ativo: data.ativo,
      isValid,
      dataInicio: data.data_inicio,
      dataFim: data.data_fim,
    };
  } catch (error) {
    console.error("Erro ao buscar detalhes VIP:", error);
    return null;
  }
}
