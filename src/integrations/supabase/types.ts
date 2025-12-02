export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      market_products: {
        Row: {
          id: string
          market_id: string | null
          preco: number
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          market_id?: string | null
          preco: number
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          market_id?: string | null
          preco?: number
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_products_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          created_at: string | null
          distancia_metros: number | null
          foto_url: string | null
          id: string
          nome: string
          tempo_entrega_min: number | null
        }
        Insert: {
          created_at?: string | null
          distancia_metros?: number | null
          foto_url?: string | null
          id?: string
          nome: string
          tempo_entrega_min?: number | null
        }
        Update: {
          created_at?: string | null
          distancia_metros?: number | null
          foto_url?: string | null
          id?: string
          nome?: string
          tempo_entrega_min?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          categoria: string | null
          created_at: string | null
          id: string
          nome: string
          unidade: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome: string
          unidade?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          unidade?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          categoria: string
          created_at: string | null
          descricao: string
          id: string
          imagem_url: string | null
          prioridade: string | null
          respondido_por: string | null
          resposta: string | null
          status: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categoria: string
          created_at?: string | null
          descricao: string
          id?: string
          imagem_url?: string | null
          prioridade?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categoria?: string
          created_at?: string | null
          descricao?: string
          id?: string
          imagem_url?: string | null
          prioridade?: string | null
          respondido_por?: string | null
          resposta?: string | null
          status?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_details: {
        Row: {
          aceita_campanhas: boolean
          bairro: string
          cep: string
          cpf: string | null
          created_at: string
          data_nascimento: string
          email: string
          foto_url: string | null
          id: string
          idade_calculada: number | null
          nome: string
          numero: string
          rua: string
          telefone: string
          user_id: string
        }
        Insert: {
          aceita_campanhas?: boolean
          bairro: string
          cep: string
          cpf?: string | null
          created_at?: string
          data_nascimento: string
          email: string
          foto_url?: string | null
          id?: string
          idade_calculada?: number | null
          nome: string
          numero: string
          rua: string
          telefone: string
          user_id: string
        }
        Update: {
          aceita_campanhas?: boolean
          bairro?: string
          cep?: string
          cpf?: string | null
          created_at?: string
          data_nascimento?: string
          email?: string
          foto_url?: string | null
          id?: string
          idade_calculada?: number | null
          nome?: string
          numero?: string
          rua?: string
          telefone?: string
          user_id?: string
        }
        Relationships: []
      }
      vip_subscriptions: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          plano: string
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          plano: string
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          plano?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: { Args: { birth_date: string }; Returns: number }
      get_user_ticket_stats: {
        Args: { user_uuid: string }
        Returns: {
          abertos: number
          em_andamento: number
          resolvidos: number
          total_tickets: number
        }[]
      }
      get_vip_status: {
        Args: { user_uuid: string }
        Returns: {
          data_fim: string
          is_active: boolean
          plano: string
        }[]
      }
      is_vip_active: { Args: { user_uuid: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
