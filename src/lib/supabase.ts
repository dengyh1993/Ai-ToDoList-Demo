// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface Todo {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  parent_id?: string
  user_id?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
}
