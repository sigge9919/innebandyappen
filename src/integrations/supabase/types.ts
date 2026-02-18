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
      drills: {
        Row: {
          categories: string[] | null
          created_at: string
          description: string | null
          id: string
          linked_layout_ids: string[] | null
          media_files: Json | null
          name: string
          team_id: string
          video_url: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          linked_layout_ids?: string[] | null
          media_files?: Json | null
          name: string
          team_id: string
          video_url?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          linked_layout_ids?: string[] | null
          media_files?: Json | null
          name?: string
          team_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drills_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          date: string
          events: Json | null
          id: string
          location: string
          notes: Json | null
          opponent: string
          opponent_score: number | null
          our_score: number | null
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string
          date: string
          events?: Json | null
          id?: string
          location?: string
          notes?: Json | null
          opponent: string
          opponent_score?: number | null
          our_score?: number | null
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string
          date?: string
          events?: Json | null
          id?: string
          location?: string
          notes?: Json | null
          opponent?: string
          opponent_score?: number | null
          our_score?: number | null
          status?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      idps: {
        Row: {
          coach_notes: string | null
          completed: boolean | null
          created_at: string
          end_date: string
          focus_areas: string[] | null
          goal: string
          id: string
          last_updated: string
          player_id: string
          short_term_goals: string[] | null
          start_date: string
          team_id: string
        }
        Insert: {
          coach_notes?: string | null
          completed?: boolean | null
          created_at?: string
          end_date: string
          focus_areas?: string[] | null
          goal: string
          id?: string
          last_updated?: string
          player_id: string
          short_term_goals?: string[] | null
          start_date: string
          team_id: string
        }
        Update: {
          coach_notes?: string | null
          completed?: boolean | null
          created_at?: string
          end_date?: string
          focus_areas?: string[] | null
          goal?: string
          id?: string
          last_updated?: string
          player_id?: string
          short_term_goals?: string[] | null
          start_date?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idps_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idps_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          focus_flag: boolean
          id: string
          jersey_number: number
          name: string
          notes: string | null
          positions: string[]
          status: string
          stick_side: string
          team_id: string
        }
        Insert: {
          created_at?: string
          focus_flag?: boolean
          id?: string
          jersey_number?: number
          name: string
          notes?: string | null
          positions?: string[]
          status?: string
          stick_side?: string
          team_id: string
        }
        Update: {
          created_at?: string
          focus_flag?: boolean
          id?: string
          jersey_number?: number
          name?: string
          notes?: string | null
          positions?: string[]
          status?: string
          stick_side?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      plays: {
        Row: {
          category: string
          created_at: string
          diagram_url: string | null
          id: string
          key_points: string[] | null
          linked_layout_ids: string[] | null
          media_files: Json | null
          name: string
          tags: string[] | null
          team_id: string
          video_url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          diagram_url?: string | null
          id?: string
          key_points?: string[] | null
          linked_layout_ids?: string[] | null
          media_files?: Json | null
          name: string
          tags?: string[] | null
          team_id: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          diagram_url?: string | null
          id?: string
          key_points?: string[] | null
          linked_layout_ids?: string[] | null
          media_files?: Json | null
          name?: string
          tags?: string[] | null
          team_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plays_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          invite_email: string | null
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_email?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_email?: string | null
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_settings: {
        Row: {
          coach_notes: string | null
          id: string
          play_categories: string[] | null
          team_id: string
          updated_at: string
          weekly_focus: string | null
        }
        Insert: {
          coach_notes?: string | null
          id?: string
          play_categories?: string[] | null
          team_id: string
          updated_at?: string
          weekly_focus?: string | null
        }
        Update: {
          coach_notes?: string | null
          id?: string
          play_categories?: string[] | null
          team_id?: string
          updated_at?: string
          weekly_focus?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_settings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      test_results: {
        Row: {
          created_at: string
          date: string
          id: string
          player_id: string
          previous_result: string | null
          result: string
          team_id: string
          test_name: string
          test_type: string
          trend: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          player_id: string
          previous_result?: string | null
          result: string
          team_id: string
          test_name: string
          test_type: string
          trend?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          player_id?: string
          previous_result?: string | null
          result?: string
          team_id?: string
          test_name?: string
          test_type?: string
          trend?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          created_at: string
          date: string
          duration: number
          id: string
          player_ids: string[] | null
          sections: Json | null
          team_id: string
          theme: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: number
          id?: string
          player_ids?: string[] | null
          sections?: Json | null
          team_id: string
          theme: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number
          id?: string
          player_ids?: string[] | null
          sections?: Json | null
          team_id?: string
          theme?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_team_role: {
        Args: { _team_id: string }
        Returns: Database["public"]["Enums"]["team_role"]
      }
      is_head_coach: { Args: { _team_id: string }; Returns: boolean }
      is_team_member: { Args: { _team_id: string }; Returns: boolean }
    }
    Enums: {
      team_role: "head_coach" | "assistant_coach" | "stats_coach" | "viewer"
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
      team_role: ["head_coach", "assistant_coach", "stats_coach", "viewer"],
    },
  },
} as const
