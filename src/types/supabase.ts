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
      diary_entries: {
        Row: {
          id: string
          user_id: string
          date: string
          emotion: string
          event: string
          realization: string
          self_esteem_score: number
          worthlessness_score: number
          created_at: string
          counselor_memo?: string
          is_visible_to_user?: boolean
          counselor_name?: string
          assigned_counselor?: string
          urgency_level?: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          emotion: string
          event: string
          realization: string
          self_esteem_score?: number
          worthlessness_score?: number
          created_at?: string
          counselor_memo?: string
          is_visible_to_user?: boolean
          counselor_name?: string
          assigned_counselor?: string
          urgency_level?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          emotion?: string
          event?: string
          realization?: string
          self_esteem_score?: number
          worthlessness_score?: number
          created_at?: string
          counselor_memo?: string
          is_visible_to_user?: boolean
          counselor_name?: string
          assigned_counselor?: string
          urgency_level?: string
        }
      }
      profiles: {
        Row: {
          id: string
          line_username: string
          created_at: string
        }
        Insert: {
          id?: string
          line_username: string
          created_at?: string
        }
        Update: {
          id?: string
          line_username?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          line_username: string
          created_at: string
        }
        Insert: {
          id?: string
          line_username: string
          created_at?: string
        }
        Update: {
          id?: string
          line_username?: string
          created_at?: string
        }
      }
    }
  }
}