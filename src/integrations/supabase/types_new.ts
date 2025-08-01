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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attention_test_results: {
        Row: {
          accuracy_percentage: number | null
          average_reaction_time: number | null
          completion_status: string | null
          conducted_by: string
          created_at: string | null
          detailed_answers: Json | null
          id: string
          letter_questions_accuracy: number | null
          letter_questions_correct: number | null
          letter_questions_total: number | null
          mixed_questions_accuracy: number | null
          mixed_questions_correct: number | null
          mixed_questions_total: number | null
          notes: string | null
          number_questions_accuracy: number | null
          number_questions_correct: number | null
          number_questions_total: number | null
          reaction_times: Json | null
          section1_accuracy: number | null
          section1_correct: number | null
          section1_total: number | null
          section2_accuracy: number | null
          section2_correct: number | null
          section2_total: number | null
          section3_accuracy: number | null
          section3_correct: number | null
          section3_total: number | null
          speed_score: number | null
          student_id: string
          test_duration_seconds: number | null
          test_end_time: string | null
          test_start_time: string
          total_correct_answers: number | null
          total_questions_attempted: number | null
          updated_at: string | null
          wrong_answers: Json | null
        }
        Insert: {
          accuracy_percentage?: number | null
          average_reaction_time?: number | null
          completion_status?: string | null
          conducted_by: string
          created_at?: string | null
          detailed_answers?: Json | null
          id?: string
          letter_questions_accuracy?: number | null
          letter_questions_correct?: number | null
          letter_questions_total?: number | null
          mixed_questions_accuracy?: number | null
          mixed_questions_correct?: number | null
          mixed_questions_total?: number | null
          notes?: string | null
          number_questions_accuracy?: number | null
          number_questions_correct?: number | null
          number_questions_total?: number | null
          reaction_times?: Json | null
          section1_accuracy?: number | null
          section1_correct?: number | null
          section1_total?: number | null
          section2_accuracy?: number | null
          section2_correct?: number | null
          section2_total?: number | null
          section3_accuracy?: number | null
          section3_correct?: number | null
          section3_total?: number | null
          speed_score?: number | null
          student_id: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time: string
          total_correct_answers?: number | null
          total_questions_attempted?: number | null
          updated_at?: string | null
          wrong_answers?: Json | null
        }
        Update: {
          accuracy_percentage?: number | null
          average_reaction_time?: number | null
          completion_status?: string | null
          conducted_by?: string
          created_at?: string | null
          detailed_answers?: Json | null
          id?: string
          letter_questions_accuracy?: number | null
          letter_questions_correct?: number | null
          letter_questions_total?: number | null
          mixed_questions_accuracy?: number | null
          mixed_questions_correct?: number | null
          mixed_questions_total?: number | null
          notes?: string | null
          number_questions_accuracy?: number | null
          number_questions_correct?: number | null
          number_questions_total?: number | null
          reaction_times?: Json | null
          section1_accuracy?: number | null
          section1_correct?: number | null
          section1_total?: number | null
          section2_accuracy?: number | null
          section2_correct?: number | null
          section2_total?: number | null
          section3_accuracy?: number | null
          section3_correct?: number | null
          section3_total?: number | null
          speed_score?: number | null
          student_id?: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time?: string
          total_correct_answers?: number | null
          total_questions_attempted?: number | null
          updated_at?: string | null
          wrong_answers?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "attention_test_results_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attention_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      burdon_test_results: {
        Row: {
          attention_ratio: number | null
          completion_status: string | null
          conducted_by: string
          created_at: string
          detailed_results: Json | null
          id: string
          notes: string | null
          section1_correct: number | null
          section1_missed: number | null
          section1_score: number | null
          section1_wrong: number | null
          section2_correct: number | null
          section2_missed: number | null
          section2_score: number | null
          section2_wrong: number | null
          section3_correct: number | null
          section3_missed: number | null
          section3_score: number | null
          section3_wrong: number | null
          student_id: string
          test_duration_seconds: number | null
          test_end_time: string | null
          test_start_time: string
          total_correct: number | null
          total_missed: number | null
          total_score: number | null
          total_wrong: number | null
          updated_at: string
        }
        Insert: {
          attention_ratio?: number | null
          completion_status?: string | null
          conducted_by: string
          created_at?: string
          detailed_results?: Json | null
          id?: string
          notes?: string | null
          section1_correct?: number | null
          section1_missed?: number | null
          section1_score?: number | null
          section1_wrong?: number | null
          section2_correct?: number | null
          section2_missed?: number | null
          section2_score?: number | null
          section2_wrong?: number | null
          section3_correct?: number | null
          section3_missed?: number | null
          section3_score?: number | null
          section3_wrong?: number | null
          student_id: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time: string
          total_correct?: number | null
          total_missed?: number | null
          total_score?: number | null
          total_wrong?: number | null
          updated_at?: string
        }
        Update: {
          attention_ratio?: number | null
          completion_status?: string | null
          conducted_by?: string
          created_at?: string
          detailed_results?: Json | null
          id?: string
          notes?: string | null
          section1_correct?: number | null
          section1_missed?: number | null
          section1_score?: number | null
          section1_wrong?: number | null
          section2_correct?: number | null
          section2_missed?: number | null
          section2_score?: number | null
          section2_wrong?: number | null
          section3_correct?: number | null
          section3_missed?: number | null
          section3_score?: number | null
          section3_wrong?: number | null
          student_id?: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time?: string
          total_correct?: number | null
          total_missed?: number | null
          total_score?: number | null
          total_wrong?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "burdon_test_results_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "burdon_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      d2_test_results: {
        Row: {
          attention_stability: number | null
          commission_errors: number | null
          completion_status: string | null
          concentration_performance: number | null
          conducted_by: string
          correct_selections: number | null
          created_at: string
          detailed_results: Json | null
          fluctuation_rate: number | null
          id: string
          line_results: Json | null
          notes: string | null
          omission_errors: number | null
          processing_speed: number | null
          student_id: string
          test_duration_seconds: number | null
          test_end_time: string | null
          test_start_time: string
          total_errors: number | null
          total_items_processed: number | null
          total_net_performance: number | null
          total_score: number | null
          updated_at: string
        }
        Insert: {
          attention_stability?: number | null
          commission_errors?: number | null
          completion_status?: string | null
          concentration_performance?: number | null
          conducted_by: string
          correct_selections?: number | null
          created_at?: string
          detailed_results?: Json | null
          fluctuation_rate?: number | null
          id?: string
          line_results?: Json | null
          notes?: string | null
          omission_errors?: number | null
          processing_speed?: number | null
          student_id: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time: string
          total_errors?: number | null
          total_items_processed?: number | null
          total_net_performance?: number | null
          total_score?: number | null
          updated_at?: string
        }
        Update: {
          attention_stability?: number | null
          commission_errors?: number | null
          completion_status?: string | null
          concentration_performance?: number | null
          conducted_by?: string
          correct_selections?: number | null
          created_at?: string
          detailed_results?: Json | null
          fluctuation_rate?: number | null
          id?: string
          line_results?: Json | null
          notes?: string | null
          omission_errors?: number | null
          processing_speed?: number | null
          student_id?: string
          test_duration_seconds?: number | null
          test_end_time?: string | null
          test_start_time?: string
          total_errors?: number | null
          total_items_processed?: number | null
          total_net_performance?: number | null
          total_score?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "d2_test_results_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "d2_test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_user_id: string
          avatar_url: string | null
          created_at: string
          demographic_info: Json | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          roles: Json | null
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          demographic_info?: Json | null
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          roles?: Json | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          demographic_info?: Json | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          roles?: Json | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_user_with_demographics: {
        Args: {
          p_auth_user_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_phone?: string
          p_roles?: Json
          p_supervisor_id?: string
          p_demographic_info?: Json
        }
        Returns: string
      }
      get_all_subordinates: {
        Args: { supervisor_uuid: string }
        Returns: {
          id: string
          first_name: string
          last_name: string
          email: string
          roles: Json
          supervisor_id: string
          level: number
        }[]
      }
      user_has_role: {
        Args: { user_roles: Json; required_role: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "trainer" | "representative" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["admin", "trainer", "representative", "user"],
    },
  },
} as const
