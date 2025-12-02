import { supabase } from "@/integrations/supabase/client";
import { Ticket, StatusTicket, CategoriasSupporte } from "./suporteService";

export interface TicketCompleto extends Ticket {
  user_details?: {
    nome: string;
    email: string;
    telefone: string;
  };
}

export async function listarTodosTickets(): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []) as Ticket[];
  } catch (error) {
    console.error("Erro ao listar todos os tickets:", error);
    return [];
  }
}

export async function filtrarTickets(
  status?: StatusTicket,
  categoria?: CategoriasSupporte,
  searchTerm?: string
): Promise<Ticket[]> {
  try {
    let query = supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (categoria) {
      query = query.eq("categoria", categoria);
    }

    if (searchTerm) {
      query = query.or(`titulo.ilike.%${searchTerm}%,descricao.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as Ticket[];
  } catch (error) {
    console.error("Erro ao filtrar tickets:", error);
    return [];
  }
}

export async function buscarTicketCompleto(
  ticketId: string
): Promise<TicketCompleto | null> {
  try {
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (ticketError) throw ticketError;

    // Buscar informações do usuário
    const { data: userDetails, error: userError } = await supabase
      .from("user_details")
      .select("nome, email, telefone")
      .eq("user_id", ticket.user_id)
      .maybeSingle();

    if (userError) {
      console.error("Erro ao buscar dados do usuário:", userError);
    }

    return {
      ...ticket,
      user_details: userDetails || undefined,
    } as TicketCompleto;
  } catch (error) {
    console.error("Erro ao buscar ticket completo:", error);
    return null;
  }
}

export async function responderTicket(
  ticketId: string,
  resposta: string,
  respondidoPor: string,
  novoStatus: StatusTicket = "resolvido"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("support_tickets")
      .update({
        resposta,
        respondido_por: respondidoPor,
        status: novoStatus,
      })
      .eq("id", ticketId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao responder ticket:", error);
    return {
      success: false,
      error: "Erro ao responder ticket. Tente novamente.",
    };
  }
}

export async function atualizarStatus(
  ticketId: string,
  novoStatus: StatusTicket
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("support_tickets")
      .update({ status: novoStatus })
      .eq("id", ticketId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return {
      success: false,
      error: "Erro ao atualizar status. Tente novamente.",
    };
  }
}
