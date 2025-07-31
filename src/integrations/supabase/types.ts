export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      employees: {
        Row: {
          active: boolean
          created_at: string
          hourly_rate: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          hourly_rate: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          hourly_rate?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          active: boolean
          billing_unit: string
          category: string
          cost_per_month: number
          created_at: string
          id: string
          name: string
          price_per_month: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_unit?: string
          category: string
          cost_per_month: number
          created_at?: string
          id?: string
          name: string
          price_per_month: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_unit?: string
          category?: string
          cost_per_month?: number
          created_at?: string
          id?: string
          name?: string
          price_per_month?: number
          updated_at?: string
        }
        Relationships: []
      }
      package_configs: {
        Row: {
          created_at: string
          id: string
          multiplier: number
          package_type: string
          service_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          multiplier?: number
          package_type: string
          service_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          multiplier?: number
          package_type?: string
          service_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_configs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_licenses: {
        Row: {
          created_at: string
          id: string
          license_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          license_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          license_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_licenses_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_licenses_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          billing_type: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          package_level: string | null
          product_name: string | null
          time_in_minutes: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          billing_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          package_level?: string | null
          product_name?: string | null
          time_in_minutes: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          billing_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          package_level?: string | null
          product_name?: string | null
          time_in_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      stored_backups: {
        Row: {
          backup_type: string
          created_at: string
          created_by: string | null
          description: string | null
          file_path: string
          file_size: number
          filename: string
          id: string
          records_count: number
        }
        Insert: {
          backup_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path: string
          file_size: number
          filename: string
          id?: string
          records_count: number
        }
        Update: {
          backup_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          records_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
