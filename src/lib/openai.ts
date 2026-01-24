import OpenAI from 'openai';

// 使用 DeepSeek API - 延迟初始化，避免构建时需要 API key
let openai: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('Missing DEEPSEEK_API_KEY environment variable');
    }
    openai = new OpenAI({
      apiKey,
      baseURL: 'https://sg.uiuiapi.com/v1',
    });
  }
  return openai;
}

export async function decomposeTask(task: string): Promise<string[]> {
  try {
    console.log('[OpenAI] 任务:', task);
    console.log('[OpenAI] API Key 已配置:', !!process.env.DEEPSEEK_API_KEY);
    console.log('[OpenAI] 使用模型: deepseek-chat');

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `你是一个任务分解助手。用户会给你一个宽泛的任务，你需要将它拆解成3-5个具体可执行的小步骤。
规则：
1. 每个步骤应该是具体、可操作的
2. 步骤之间应该有逻辑顺序
3. 只返回步骤列表，每行一个步骤
4. 不要添加序号或其他格式
5. 用中文回复`,
        },
        {
          role: 'user',
          content: task,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    console.log('[OpenAI] API 调用成功');
    console.log('[OpenAI] 响应:', JSON.stringify(response, null, 2));

    const content = response.choices[0]?.message?.content || '';
    console.log('[OpenAI] 内容:', content);

    const steps = content
      .split('\n')
      .map((line) => line.trim())
      // 移除序号格式（如 "1. ", "1、", "- " 等）
      .map((line) =>
        line.replace(/^[\d]+[.、)\]]\s*/, '').replace(/^[-•]\s*/, ''),
      )
      .filter((line) => line.length > 0)
      .slice(0, 5);

    console.log('[OpenAI] 解析结果:', steps);

    return steps;
  } catch (error) {
    console.error('[OpenAI] 错误:', error);
    if (error instanceof Error) {
      console.error('[OpenAI] 错误信息:', error.message);
      console.error('[OpenAI] 堆栈:', error.stack);
    }
    throw error;
  }
}

export async function enhancePrompt(userPrompt: string): Promise<string> {
  try {
    console.log('[OpenAI] 优化提示词:', userPrompt);
    console.log('[OpenAI] API Key 已配置:', !!process.env.DEEPSEEK_API_KEY);

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

    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: metaPrompt,
        },
        {
          role: 'user',
          content: `用户需求：${userPrompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    console.log('[OpenAI] API 调用成功');

    const content = response.choices[0]?.message?.content || '';
    console.log('[OpenAI] 优化结果:', content);

    return content;
  } catch (error) {
    console.error('[OpenAI] 错误:', error);
    if (error instanceof Error) {
      console.error('[OpenAI] 错误信息:', error.message);
      console.error('[OpenAI] 堆栈:', error.stack);
    }
    throw error;
  }
}

export default getOpenAIClient;