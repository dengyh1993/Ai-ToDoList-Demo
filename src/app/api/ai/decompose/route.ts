import { NextRequest, NextResponse } from 'next/server';
import { decomposeTask } from '@/lib/openai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// AI 拆解任务
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { task } = body;

    if (!task) {
      return NextResponse.json({ error: '任务不能为空' }, { status: 400 });
    }

    // 获取当前用户
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 使用 AI 拆解任务
    const steps = await decomposeTask(task);

    if (steps.length === 0) {
      return NextResponse.json({ error: 'AI 无法拆解该任务' }, { status: 500 });
    }

    // 创建主任务
    const { data: mainTask, error: mainError } = await supabase
      .from('todos')
      .insert([
        {
          title: task,
          description: null,
          status: 'pending',
          parent_id: null,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (mainError) {
      return NextResponse.json({ error: mainError.message }, { status: 500 });
    }

    // 创建子任务
    const now = new Date().getTime();
    const subTasks = steps.map((step, index) => ({
      title: step,
      description: null,
      status: 'pending',
      parent_id: mainTask.id,
      user_id: user.id,
      created_at: new Date(now + index * 1000).toISOString(), // 确保子任务有明确的顺序
    }));

    const { data: createdSubTasks, error: subError } = await supabase
      .from('todos')
      .insert(subTasks)
      .select();

    if (subError) {
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    return NextResponse.json({
      mainTask,
      subTasks: createdSubTasks,
      message: `成功拆解为 ${steps.length} 个子任务`,
    });
  } catch (error) {
    console.error('[API] AI decompose error:', error);
    if (error instanceof Error) {
      console.error('[API] 错误信息:', error.message);
      console.error('[API] 堆栈:', error.stack);
    }
    return NextResponse.json(
      {
        error: 'AI 服务暂时不可用，请稍后重试',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
