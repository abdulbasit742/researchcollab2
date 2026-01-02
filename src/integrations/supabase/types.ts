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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      connection_requests: {
        Row: {
          created_at: string
          id: string
          recipient_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      earning_bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          delivery_days: number
          id: string
          message: string | null
          project_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          delivery_days: number
          id?: string
          message?: string | null
          project_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          delivery_days?: number
          id?: string
          message?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earning_bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "earning_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      earning_projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          created_at: string
          deadline_days: number | null
          description: string | null
          id: string
          location: string | null
          owner_id: string
          status: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          location?: string | null
          owner_id: string
          status?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          created_at?: string
          deadline_days?: number | null
          description?: string | null
          id?: string
          location?: string | null
          owner_id?: string
          status?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
          archived_by_user_a: boolean | null
          archived_by_user_b: boolean | null
          created_at: string
          id: string
          last_message_at: string
          last_message_text: string | null
          muted_by_user_a_until: string | null
          muted_by_user_b_until: string | null
          pair_key: string | null
          starred_by_user_a: boolean | null
          starred_by_user_b: boolean | null
          user_a: string
          user_b: string
        }
        Insert: {
          archived_by_user_a?: boolean | null
          archived_by_user_b?: boolean | null
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          muted_by_user_a_until?: string | null
          muted_by_user_b_until?: string | null
          pair_key?: string | null
          starred_by_user_a?: boolean | null
          starred_by_user_b?: boolean | null
          user_a: string
          user_b: string
        }
        Update: {
          archived_by_user_a?: boolean | null
          archived_by_user_b?: boolean | null
          created_at?: string
          id?: string
          last_message_at?: string
          last_message_text?: string | null
          muted_by_user_a_until?: string | null
          muted_by_user_b_until?: string | null
          pair_key?: string | null
          starred_by_user_a?: boolean | null
          starred_by_user_b?: boolean | null
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment: Json | null
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          metadata: Json | null
          reactions: Json | null
          read_at: string | null
          sender_id: string
          thread_id: string
          type: string
        }
        Insert: {
          attachment?: Json | null
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          sender_id: string
          thread_id: string
          type?: string
        }
        Update: {
          attachment?: Json | null
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          metadata?: Json | null
          reactions?: Json | null
          read_at?: string | null
          sender_id?: string
          thread_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_attachments: {
        Row: {
          created_at: string
          id: string
          label: string | null
          offer_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          offer_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          offer_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_attachments_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          created_at: string
          currency: string
          delivery_days: number | null
          description: string | null
          id: string
          offer_type: string
          price: number
          recipient_id: string
          sender_id: string
          status: string
          thread_id: string
          title: string
        }
        Insert: {
          created_at?: string
          currency?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          offer_type: string
          price: number
          recipient_id: string
          sender_id: string
          status?: string
          thread_id: string
          title: string
        }
        Update: {
          created_at?: string
          currency?: string
          delivery_days?: number | null
          description?: string | null
          id?: string
          offer_type?: string
          price?: number
          recipient_id?: string
          sender_id?: string
          status?: string
          thread_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "offers_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_messages: {
        Row: {
          created_at: string | null
          id: string
          is_global: boolean | null
          message_id: string
          pinned_by: string
          thread_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          message_id: string
          pinned_by: string
          thread_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_global?: boolean | null
          message_id?: string
          pinned_by?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pinned_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pinned_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_projects: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          link: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          link?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          education_level: string | null
          first_name: string | null
          full_name: string | null
          id: string
          interests: string[] | null
          last_name: string | null
          location: string | null
          onboarding_completed: boolean | null
          research_level: string | null
          role: string | null
          university: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          research_level?: string | null
          role?: string | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          education_level?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          interests?: string[] | null
          last_name?: string | null
          location?: string | null
          onboarding_completed?: boolean | null
          research_level?: string | null
          role?: string | null
          university?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          message_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at: string | null
          status: string
          thread_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          message_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved_at?: string | null
          status?: string
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_notes: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          thread_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          thread_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          thread_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_notes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_blocked: { Args: { user_a: string; user_b: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "researcher" | "admin"
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
      app_role: ["student", "researcher", "admin"],
    },
  },
} as const
