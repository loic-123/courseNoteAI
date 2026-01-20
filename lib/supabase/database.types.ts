export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string
          name: string
          short_name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          institution_id: string
          code: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          code: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          code?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          name: string
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          name: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          name?: string
          description?: string | null
          order_index?: number
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          course_id: string
          module_id: string | null
          creator_name: string
          title: string
          language: 'en' | 'fr'
          notes_markdown: string
          qcm_json: Json
          visual_prompt: string
          visual_image_url: string | null
          upvotes: number
          downvotes: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          module_id?: string | null
          creator_name: string
          title: string
          language?: 'en' | 'fr'
          notes_markdown: string
          qcm_json: Json
          visual_prompt: string
          visual_image_url?: string | null
          upvotes?: number
          downvotes?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          module_id?: string | null
          creator_name?: string
          title?: string
          language?: 'en' | 'fr'
          notes_markdown?: string
          qcm_json?: Json
          visual_prompt?: string
          visual_image_url?: string | null
          upvotes?: number
          downvotes?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          note_id: string
          user_identifier: string
          vote_type: 'up' | 'down'
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_identifier: string
          vote_type: 'up' | 'down'
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_identifier?: string
          vote_type?: 'up' | 'down'
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      notes_tags: {
        Row: {
          note_id: string
          tag_id: string
        }
        Insert: {
          note_id: string
          tag_id: string
        }
        Update: {
          note_id?: string
          tag_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_view_count: {
        Args: {
          note_uuid: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
