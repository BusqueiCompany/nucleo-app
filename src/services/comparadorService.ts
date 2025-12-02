import { supabase } from "@/integrations/supabase/client";

export interface ListItem {
  nome: string;
  quantidade: number;
}

export interface ItemDetalhado {
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

export interface ResultadoComparacao {
  marketId: string;
  nome: string;
  distancia: number;
  tempoEntrega: number;
  total: number;
  itensDetalhados: ItemDetalhado[];
}

export async function compararPrecos(
  listaItens: ListItem[]
): Promise<ResultadoComparacao[]> {
  try {
    // 1. Buscar todos os mercados
    const { data: markets, error: marketsError } = await supabase
      .from("markets")
      .select("*");

    if (marketsError) throw marketsError;
    if (!markets || markets.length === 0) {
      throw new Error("Nenhum mercado encontrado");
    }

    // 2. Buscar todos os produtos
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;
    if (!products || products.length === 0) {
      throw new Error("Nenhum produto encontrado");
    }

    // 3. Buscar todos os preços
    const { data: marketProducts, error: marketProductsError } = await supabase
      .from("market_products")
      .select("*");

    if (marketProductsError) throw marketProductsError;
    if (!marketProducts || marketProducts.length === 0) {
      throw new Error("Nenhum preço encontrado");
    }

    // 4. Criar mapa de produtos por nome para busca rápida
    const productMap = new Map(
      products.map((p) => [p.nome.toLowerCase(), p.id])
    );

    // 5. Criar mapa de preços por market_id e product_id
    const priceMap = new Map<string, number>();
    marketProducts.forEach((mp) => {
      const key = `${mp.market_id}_${mp.product_id}`;
      priceMap.set(key, mp.preco);
    });

    // 6. Calcular total para cada mercado
    const resultados: ResultadoComparacao[] = [];

    for (const market of markets) {
      let total = 0;
      const itensDetalhados: ItemDetalhado[] = [];
      let todosItensEncontrados = true;

      for (const item of listaItens) {
        // Buscar product_id pelo nome
        const productId = productMap.get(item.nome.toLowerCase());

        if (!productId) {
          console.warn(`Produto não encontrado: ${item.nome}`);
          todosItensEncontrados = false;
          continue;
        }

        // Buscar preço deste produto neste mercado
        const key = `${market.id}_${productId}`;
        const precoUnit = priceMap.get(key);

        if (precoUnit === undefined) {
          console.warn(
            `Preço não encontrado para ${item.nome} no mercado ${market.nome}`
          );
          todosItensEncontrados = false;
          continue;
        }

        // Calcular subtotal
        const subtotal = precoUnit * item.quantidade;
        total += subtotal;

        itensDetalhados.push({
          nome: item.nome,
          quantidade: item.quantidade,
          precoUnit: precoUnit,
          subtotal: subtotal,
        });
      }

      // Só adicionar mercado se todos os itens foram encontrados
      if (todosItensEncontrados && itensDetalhados.length > 0) {
        resultados.push({
          marketId: market.id,
          nome: market.nome,
          distancia: market.distancia_metros || 0,
          tempoEntrega: market.tempo_entrega_min || 0,
          total: total,
          itensDetalhados: itensDetalhados,
        });
      }
    }

    // 7. Ordenar por menor total
    resultados.sort((a, b) => a.total - b.total);

    return resultados;
  } catch (error) {
    console.error("Erro ao comparar preços:", error);
    throw error;
  }
}
