import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// 获取单个待办事项
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

// 更新待办事项（完成/取消完成）
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()
  const body = await request.json()
  const { title, description, status } = body

  // 验证用户已登录
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (status !== undefined) updateData.status = status

  // 先获取当前任务信息，判断是否为主任务
  const { data: currentTodo, error: fetchError } = await supabase
    .from('todos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 })
  }

  // 更新当前任务
  const { data, error } = await supabase
    .from('todos')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 如果是主任务（没有 parent_id）且更新了状态，则级联更新所有子任务状态
  if (!currentTodo.parent_id && status !== undefined) {
    await supabase
      .from('todos')
      .update({ status })
      .eq('parent_id', params.id)
  }

  // 如果是子任务（有 parent_id）且更新了状态，则检查是否需要更新主任务状态
  if (currentTodo.parent_id && status !== undefined) {
    // 获取所有同级子任务（包括当前更新后的状态）
    const { data: siblings } = await supabase
      .from('todos')
      .select('status')
      .eq('parent_id', currentTodo.parent_id)

    if (siblings) {
      // 检查是否所有子任务都已完成
      const allCompleted = siblings.every(s => s.status === 'completed')
      // 检查是否有任何子任务未完成
      const anyPending = siblings.some(s => s.status === 'pending')

      if (allCompleted) {
        // 所有子任务都完成了，主任务也变为完成
        await supabase
          .from('todos')
          .update({ status: 'completed' })
          .eq('id', currentTodo.parent_id)
      } else if (anyPending) {
        // 有子任务未完成，主任务变为未完成
        await supabase
          .from('todos')
          .update({ status: 'pending' })
          .eq('id', currentTodo.parent_id)
      }
    }
  }

  return NextResponse.json(data)
}

// 删除待办事项
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient()

  // 验证用户已登录
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 })
  }

  // 先删除子任务
  await supabase.from('todos').delete().eq('parent_id', params.id)

  // 再删除主任务
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: '删除成功' })
}
