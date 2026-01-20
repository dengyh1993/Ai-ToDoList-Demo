import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // 构建查询
  let query = supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  // 添加日期筛选
  if (start) {
    query = query.gte('created_at', `${start}T00:00:00`)
  }
  if (end) {
    query = query.lte('created_at', `${end}T23:59:59`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, parent_id } = body

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('todos')
    .insert({
      title,
      description,
      parent_id,
      user_id: user?.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
