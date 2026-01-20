import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有待办事项
export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// 创建新待办事项
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, parent_id } = body

  if (!title) {
    return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('todos')
    .insert([
      {
        title,
        description: description || null,
        status: 'pending',
        parent_id: parent_id || null,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
