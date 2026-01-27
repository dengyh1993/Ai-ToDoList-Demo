import { NextRequest, NextResponse } from 'next/server';
import { getBigModelClient } from '@/lib/openai';
import { countTokens, calculateCost, formatCost } from '@/lib/token';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * POST /api/ai/chat
 * 流式 AI 聊天接口
 */
export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '请提供有效的消息数组' },
        { status: 400 },
      );
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: '消息不能为空' }, { status: 400 });
    }

    // 计算输入 token 数
    const inputText = messages.map((m) => m.content).join(' ');
    const inputTokens = await countTokens(inputText);

    // 获取客户端并调用 API
    const client = getBigModelClient();

    const stream = await client.chat.completions.create({
      model: 'glm-4.7',
      messages: messages,
      temperature: 0.8,
      max_tokens: 65535,
      stream: true,
      // seed: 42, // 稍后测试时开启
    });

    // 创建 SSE 流式响应
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let outputContent = '';

        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              outputContent += content;
              // SSE 格式: data: { content: "..." }
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // 计算输出 token 数和成本
          const outputTokens = await countTokens(outputContent);
          const cost = calculateCost(inputTokens, outputTokens);
          const costStr = formatCost(cost);

          // 发送成本信息
          const costData = JSON.stringify({
            type: 'cost',
            ...cost,
            formatted: costStr,
          });
          controller.enqueue(encoder.encode(`data: ${costData}\n\n`));

          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('流式传输错误:', error);
          // 发送友好的错误消息
          const errorData = JSON.stringify({
            type: 'error',
            message: '抱歉，AI 服务暂时不可用，请稍后重试。',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // 禁用 nginx 缓冲
      },
    });
  } catch (error) {
    console.error('聊天 API 错误:', error);
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      console.error('堆栈:', error.stack);
    }
    return NextResponse.json(
      { error: 'AI 服务暂时不可用' },
      { status: 500 },
    );
  }
}
