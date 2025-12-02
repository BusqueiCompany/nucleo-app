import { supabase } from "@/integrations/supabase/client";

export interface Establishment {
  id: string;
  nome: string;
  tipo: string;
  descricao: string | null;
  foto_url: string | null;
  distancia_metros: number | null;
  tempo_entrega_min: number | null;
  preco_nivel: string | null;
  funcionamento_abre: string | null;
  funcionamento_fecha: string | null;
  created_at: string;
}

export interface EstablishmentProduct {
  id: string;
  establishment_id: string;
  product_id: string;
  preco: number;
  updated_at: string | null;
  products?: {
    id: string;
    nome: string;
    categoria: string | null;
    unidade: string | null;
  };
}

export interface CreateProductData {
  establishment_id: string;
  product_id: string;
  preco: number;
}

export interface UpdateProductData {
  preco?: number;
}

export async function getEstablishmentByPartner(
  userId: string
): Promise<Establishment | null> {
  try {
    const { data: partnership, error: partnershipError } = await supabase
      .from("establishment_partners")
      .select("establishment_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (partnershipError) throw partnershipError;
    if (!partnership) return null;

    const { data: establishment, error: establishmentError } = await supabase
      .from("establishments")
      .select("*")
      .eq("id", partnership.establishment_id)
      .single();

    if (establishmentError) throw establishmentError;

    return establishment as Establishment;
  } catch (error) {
    console.error("Erro ao buscar estabelecimento do parceiro:", error);
    return null;
  }
}

export async function listProducts(
  establishmentId: string
): Promise<EstablishmentProduct[]> {
  try {
    const { data, error } = await supabase
      .from("establishment_products")
      .select(`
        *,
        products (
          id,
          nome,
          categoria,
          unidade
        )
      `)
      .eq("establishment_id", establishmentId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data || []) as EstablishmentProduct[];
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return [];
  }
}

export async function createProduct(
  data: CreateProductData
): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const { data: product, error } = await supabase
      .from("establishment_products")
      .insert({
        establishment_id: data.establishment_id,
        product_id: data.product_id,
        preco: data.preco,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return {
      success: false,
      error: "Erro ao criar produto. Tente novamente.",
    };
  }
}

export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("establishment_products")
      .update(data)
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return {
      success: false,
      error: "Erro ao atualizar produto. Tente novamente.",
    };
  }
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("establishment_products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return {
      success: false,
      error: "Erro ao deletar produto. Tente novamente.",
    };
  }
}

export async function uploadProductImage(
  establishmentId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${establishmentId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("product-images")
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

export async function createProductInCatalog(data: {
  nome: string;
  categoria: string;
  unidade: string;
}): Promise<{ success: boolean; error?: string; productId?: string }> {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        nome: data.nome,
        categoria: data.categoria,
        unidade: data.unidade,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Erro ao criar produto no catálogo:", error);
    return {
      success: false,
      error: "Erro ao criar produto no catálogo.",
    };
  }
}
