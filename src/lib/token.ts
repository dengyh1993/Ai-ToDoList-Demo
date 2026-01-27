// Token 计算工具

let enc: Awaited<ReturnType<typeof import('js-tiktoken').getEncoding>> | null = null;

// GLM-4.7 官方定价（元/百万 tokens）
const INPUT_COST_PER_MILLION = 2;
const OUTPUT_COST_PER_MILLION = 8;

export interface CostInfo {
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

/**
 * 初始化 tiktoken 编码器（懒加载）
 */
async function getEncoder() {
  if (!enc) {
    const { getEncoding } = await import('js-tiktoken');
    enc = getEncoding('cl100k_base');
  }
  return enc;
}

/**
 * 计算文本的 token 数
 */
export async function countTokens(text: string): Promise<number> {
  const encoder = await getEncoder();
  return encoder.encode(text).length;
}

/**
 * 计算成本
 * @param inputTokens 输入 token 数
 * @param outputTokens 输出 token 数
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
): CostInfo {
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION;
  const totalCost = inputCost + outputCost;

  return {
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost,
  };
}

/**
 * 格式化成本为可读字符串
 */
export function formatCost(cost: CostInfo): string {
  return `输入: ${cost.inputTokens} tokens (¥${cost.inputCost.toFixed(4)}) | 输出: ${cost.outputTokens} tokens (¥${cost.outputCost.toFixed(4)}) | 总计: ¥${cost.totalCost.toFixed(4)}`;
}
