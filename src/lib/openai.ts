import OpenAI from 'openai'

// 使用 OpenRouter 接入小米 API
const openai = new OpenAI({
  apiKey: process.env.XIAOMI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Todo App',
  },
})

export async function decomposeTask(task: string): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: 'xiaomi/mimo-v2-flash:free',
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
  })

  const content = response.choices[0]?.message?.content || ''
  const steps = content
    .split('\n')
    .map((line) => line.trim())
    // 移除序号格式（如 "1. ", "1、", "- " 等）
    .map((line) => line.replace(/^[\d]+[.、)\]]\s*/, '').replace(/^[-•]\s*/, ''))
    .filter((line) => line.length > 0)
    .slice(0, 5)

  return steps
}

export default openai
