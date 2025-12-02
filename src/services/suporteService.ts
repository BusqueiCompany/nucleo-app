import { supabase } from "@/integrations/supabase/client";

export type CategoriasSupporte = "pedido" | "pagamento" | "entrega" | "produto" | "conta" | "outro";
export type StatusTicket = "aberto" | "em_andamento" | "resolvido" | "fechado";
export type PrioridadeTicket = "baixa" | "normal" | "alta" | "urgente";

export interface CriarTicketData {
  userId: string;
  categoria: CategoriasSupporte;
  titulo: string;
  descricao: string;
  prioridade: PrioridadeTicket;
  imagemUrl?: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  categoria: CategoriasSupporte;
  titulo: string;
  descricao: string;
  status: StatusTicket;
  prioridade: PrioridadeTicket;
  imagem_url: string | null;
  resposta: string | null;
  respondido_por: string | null;
  created_at: string;
  updated_at: string;
}

export async function criarTicket(
  data: CriarTicketData
): Promise<{ success: boolean; error?: string; ticketId?: string }> {
  try {
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: data.userId,
        categoria: data.categoria,
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade,
        imagem_url: data.imagemUrl || null,
        status: "aberto",
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, ticketId: ticket.id };
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    return {
      success: false,
      error: "Erro ao criar ticket. Tente novamente.",
    };
  }
}

export async function listarTickets(userId: string): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []) as Ticket[];
  } catch (error) {
    console.error("Erro ao listar tickets:", error);
    return [];
  }
}

export async function buscarTicket(ticketId: string): Promise<Ticket | null> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) throw error;

    return data as Ticket;
  } catch (error) {
    console.error("Erro ao buscar ticket:", error);
    return null;
  }
}

export async function uploadImagemSuporte(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("support-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("support-images")
      .getPublicUrl(fileName);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    return {
      success: false,
      error: "Erro ao fazer upload da imagem.",
    };
  }
}

export const CATEGORIAS_LABELS: Record<CategoriasSupporte, string> = {
  pedido: "Pedido",
  pagamento: "Pagamento",
  entrega: "Entrega",
  produto: "Produto",
  conta: "Conta",
  outro: "Outro",
};

export const STATUS_LABELS: Record<StatusTicket, string> = {
  aberto: "Aberto",
  em_andamento: "Em Andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const PRIORIDADE_LABELS: Record<PrioridadeTicket, string> = {
  baixa: "Baixa",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};
