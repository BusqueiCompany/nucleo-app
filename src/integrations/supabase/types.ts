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
      deliveries: {
        Row: {
          created_at: string | null
          distancia_metros: number | null
          driver_id: string | null
          id: string
          order_id: string | null
          status: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          created_at?: string | null
          distancia_metros?: number | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          created_at?: string | null
          distancia_metros?: number | null
          driver_id?: string | null
          id?: string
          order_id?: string | null
          status?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "delivery_drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_drivers: {
        Row: {
          created_at: string | null
          foto_url: string | null
          id: string
          nome: string
          placa: string | null
          status_online: boolean | null
          telefone: string
          user_id: string
          veiculo: string
        }
        Insert: {
          created_at?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          placa?: string | null
          status_online?: boolean | null
          telefone: string
          user_id: string
          veiculo: string
        }
        Update: {
          created_at?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          placa?: string | null
          status_online?: boolean | null
          telefone?: string
          user_id?: string
          veiculo?: string
        }
        Relationships: []
      }
      establishment_partners: {
        Row: {
          admin: boolean | null
          created_at: string | null
          establishment_id: string
          id: string
          user_id: string
        }
        Insert: {
          admin?: boolean | null
          created_at?: string | null
          establishment_id: string
          id?: string
          user_id: string
        }
        Update: {
          admin?: boolean | null
          created_at?: string | null
          establishment_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "establishment_partners_establishment_id_fkey"
            columns: ["establishment_id"]
            isOneToOne: true
            referencedRelation: "establishments"
            referencedColumns: ["id"]
          },
        ]
      }
      establishment_products: {
        Row: {
          establishment_id: string | null
          id: string
          preco: number
          product_id: string | null
          updated_at: string | null
        }
        Insert: {
          establishment_id?: string | null
          id?: string
          preco: number
          product_id?: string | null
          updated_at?: string | null
        }
        Update: {
          establishment_id?: string | null
          id?: string
          preco?: number
          product_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_products_market_id_fkey"
            columns: ["establishment_id"]
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
      establishments: {
        Row: {
          created_at: string | null
          descricao: string | null
          distancia_metros: number | null
          foto_url: string | null
          funcionamento_abre: string | null
          funcionamento_fecha: string | null
          id: string
          nome: string
          preco_nivel: string | null
          tempo_entrega_min: number | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          distancia_metros?: number | null
          foto_url?: string | null
          funcionamento_abre?: string | null
          funcionamento_fecha?: string | null
          id?: string
          nome: string
          preco_nivel?: string | null
          tempo_entrega_min?: number | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          distancia_metros?: number | null
          foto_url?: string | null
          funcionamento_abre?: string | null
          funcionamento_fecha?: string | null
          id?: string
          nome?: string
          preco_nivel?: string | null
          tempo_entrega_min?: number | null
          tipo?: string
        }
        Relationships: []
      }
      global_notifications: {
        Row: {
          created_at: string | null
          enviado_por: string | null
          id: string
          imagem_url: string | null
          mensagem: string
          tipo: string | null
          titulo: string
        }
        Insert: {
          created_at?: string | null
          enviado_por?: string | null
          id?: string
          imagem_url?: string | null
          mensagem: string
          tipo?: string | null
          titulo: string
        }
        Update: {
          created_at?: string | null
          enviado_por?: string | null
          id?: string
          imagem_url?: string | null
          mensagem?: string
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_vip_active: { Args: { user_uuid: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "suporte" | "cliente" | "parceiro" | "entregador"
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
    Enums: {
      app_role: ["admin", "suporte", "cliente", "parceiro", "entregador"],
    },
  },
} as const
