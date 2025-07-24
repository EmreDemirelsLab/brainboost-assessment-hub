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
  public: {
    Tables: {
      burdon_test_results: {
        Row: {
          attention_ratio: number
          conducted_by: string
          created_at: string
          detailed_results: Json | null
          id: string
          notes: string | null
          section1_correct: number
          section1_missed: number
          section1_score: number
          section1_wrong: number
          section2_correct: number
          section2_missed: number
          section2_score: number
          section2_wrong: number
          section3_correct: number
          section3_missed: number
          section3_score: number
          section3_wrong: number
          student_id: string | null
          test_auto_completed: boolean | null
          test_elapsed_time_seconds: number
          test_end_time: string | null
          test_start_time: string
          total_correct: number
          total_missed: number
          total_score: number
          total_wrong: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attention_ratio?: number
          conducted_by: string
          created_at?: string
          detailed_results?: Json | null
          id?: string
          notes?: string | null
          section1_correct?: number
          section1_missed?: number
          section1_score?: number
          section1_wrong?: number
          section2_correct?: number
          section2_missed?: number
          section2_score?: number
          section2_wrong?: number
          section3_correct?: number
          section3_missed?: number
          section3_score?: number
          section3_wrong?: number
          student_id?: string | null
          test_auto_completed?: boolean | null
          test_elapsed_time_seconds: number
          test_end_time?: string | null
          test_start_time: string
          total_correct?: number
          total_missed?: number
          total_score?: number
          total_wrong?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attention_ratio?: number
          conducted_by?: string
          created_at?: string
          detailed_results?: Json | null
          id?: string
          notes?: string | null
          section1_correct?: number
          section1_missed?: number
          section1_score?: number
          section1_wrong?: number
          section2_correct?: number
          section2_missed?: number
          section2_score?: number
          section2_wrong?: number
          section3_correct?: number
          section3_missed?: number
          section3_score?: number
          section3_wrong?: number
          student_id?: string | null
          test_auto_completed?: boolean | null
          test_elapsed_time_seconds?: number
          test_end_time?: string | null
          test_start_time?: string
          total_correct?: number
          total_missed?: number
          total_score?: number
          total_wrong?: number
          updated_at?: string
          user_id?: string
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
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "burdon_test_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cognitive_assessment_results: {
        Row: {
          akil_mantik_test_completed_at: string | null
          akil_mantik_test_results: Json | null
          akil_mantik_test_score: number | null
          cognitive_assessment_summary: Json | null
          conducted_by: string
          created_at: string
          current_test_step: number | null
          dikkat_test_completed_at: string | null
          dikkat_test_results: Json | null
          dikkat_test_score: number | null
          hafiza_test_completed_at: string | null
          hafiza_test_results: Json | null
          hafiza_test_score: number | null
          id: string
          notes: string | null
          overall_cognitive_score: number | null
          puzzle_test_completed_at: string | null
          puzzle_test_results: Json | null
          puzzle_test_score: number | null
          stroop_test_completed_at: string | null
          stroop_test_results: Json | null
          stroop_test_score: number | null
          student_id: string | null
          test_end_time: string | null
          test_start_time: string
          test_status: string | null
          total_test_duration_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          akil_mantik_test_completed_at?: string | null
          akil_mantik_test_results?: Json | null
          akil_mantik_test_score?: number | null
          cognitive_assessment_summary?: Json | null
          conducted_by: string
          created_at?: string
          current_test_step?: number | null
          dikkat_test_completed_at?: string | null
          dikkat_test_results?: Json | null
          dikkat_test_score?: number | null
          hafiza_test_completed_at?: string | null
          hafiza_test_results?: Json | null
          hafiza_test_score?: number | null
          id?: string
          notes?: string | null
          overall_cognitive_score?: number | null
          puzzle_test_completed_at?: string | null
          puzzle_test_results?: Json | null
          puzzle_test_score?: number | null
          stroop_test_completed_at?: string | null
          stroop_test_results?: Json | null
          stroop_test_score?: number | null
          student_id?: string | null
          test_end_time?: string | null
          test_start_time?: string
          test_status?: string | null
          total_test_duration_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          akil_mantik_test_completed_at?: string | null
          akil_mantik_test_results?: Json | null
          akil_mantik_test_score?: number | null
          cognitive_assessment_summary?: Json | null
          conducted_by?: string
          created_at?: string
          current_test_step?: number | null
          dikkat_test_completed_at?: string | null
          dikkat_test_results?: Json | null
          dikkat_test_score?: number | null
          hafiza_test_completed_at?: string | null
          hafiza_test_results?: Json | null
          hafiza_test_score?: number | null
          id?: string
          notes?: string | null
          overall_cognitive_score?: number | null
          puzzle_test_completed_at?: string | null
          puzzle_test_results?: Json | null
          puzzle_test_score?: number | null
          stroop_test_completed_at?: string | null
          stroop_test_results?: Json | null
          stroop_test_score?: number | null
          student_id?: string | null
          test_end_time?: string | null
          test_start_time?: string
          test_status?: string | null
          total_test_duration_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          difficulty_level: number | null
          exercise_data: Json | null
          exercise_type: string
          id: string
          instructions: string | null
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          difficulty_level?: number | null
          exercise_data?: Json | null
          exercise_type: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          exercise_data?: Json | null
          exercise_type?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content_data: Json | null
          created_at: string
          created_by: string
          file_url: string | null
          generated_at: string | null
          id: string
          is_published: boolean | null
          report_type: string
          student_id: string
          template_data: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          content_data?: Json | null
          created_at?: string
          created_by: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          is_published?: boolean | null
          report_type: string
          student_id: string
          template_data?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          content_data?: Json | null
          created_at?: string
          created_by?: string
          file_url?: string | null
          generated_at?: string | null
          id?: string
          is_published?: boolean | null
          report_type?: string
          student_id?: string
          template_data?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          created_at: string
          grade_level: number | null
          id: string
          notes: string | null
          parent_email: string | null
          parent_name: string | null
          parent_phone: string | null
          school_name: string | null
          student_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          grade_level?: number | null
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_name?: string | null
          student_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          grade_level?: number | null
          id?: string
          notes?: string | null
          parent_email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          school_name?: string | null
          student_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results: {
        Row: {
          conducted_by: string
          created_at: string
          end_time: string | null
          id: string
          max_score: number | null
          notes: string | null
          percentage: number | null
          results_data: Json | null
          score: number | null
          start_time: string
          status: string | null
          student_id: string
          test_id: string
          updated_at: string
        }
        Insert: {
          conducted_by: string
          created_at?: string
          end_time?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          percentage?: number | null
          results_data?: Json | null
          score?: number | null
          start_time: string
          status?: string | null
          student_id: string
          test_id: string
          updated_at?: string
        }
        Update: {
          conducted_by?: string
          created_at?: string
          end_time?: string | null
          id?: string
          max_score?: number | null
          notes?: string | null
          percentage?: number | null
          results_data?: Json | null
          score?: number | null
          start_time?: string
          status?: string | null
          student_id?: string
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_conducted_by_fkey"
            columns: ["conducted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      tests: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          is_active: boolean | null
          test_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          test_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          test_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id: string
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
        }
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
  public: {
    Enums: {
      user_role: ["admin", "trainer", "representative", "user"],
    },
  },
} as const
