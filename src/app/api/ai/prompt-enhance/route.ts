import { NextRequest } from 'next/server';
import { getOpenAIClient } from '@/lib/openai';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// AI 优化提示词 - 流式响应
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const { prompt } = body;

  if (!prompt) {
    return new Response(JSON.stringify({ error: '提示词不能为空' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 获取当前用户
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: '请先登录' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const metaPrompt = `你是一个 Prompt Engineering 专家，负责将用户的模糊需求转化为高质量、结构清晰的 Prompt。

## 你的任务
分析用户需求，然后**直接输出**优化后的提示词。

## 输出要求
1. **不要输出分析过程**，只输出最终优化后的提示词
2. 优化后的提示词应该包含：
   - 清晰的角色定义（如果需要）
   - 明确的任务描述
   - 具体的约束条件
   - 输出格式要求
   - 示例（如果有助于理解）
3. 使用 Markdown 格式，结构清晰
4. 用中文输出`;

  try {
    console.log('[OpenAI] 优化提示词（流式）:', prompt);

    const openai = getOpenAIClient();
    const stream = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: metaPrompt,
        },
        {
          role: 'user',
          content: `用户需求：${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // 创建可读流
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          console.error('[Stream] 错误:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[API] Prompt enhance error:', error);
    return new Response(
      JSON.stringify({
        error: 'AI 服务暂时不可用，请稍后重试',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
