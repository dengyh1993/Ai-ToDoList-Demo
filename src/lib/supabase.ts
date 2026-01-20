import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 延迟初始化，避免构建时报错
let supabaseInstance: SupabaseClient | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('请配置 Supabase 环境变量')
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}

// 为了向后兼容，导出一个代理对象
export const supabase = {
  from: (table: string) => getSupabase().from(table),
}

// 数据库类型定义
export interface Todo {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'completed'
  parent_id: string | null
  created_at: string
}
