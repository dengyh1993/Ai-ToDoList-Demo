大家好，我是拭心。

在学习完[第一阶段](https://xiaobot.net/post/d41a7f5d-36c1-41f8-a102-583352945ed0)后，希望你可以对 AI 工程师做什么、需要掌握的基本技能有直观的认识。

接下来我们进入第二阶段---通过 API 构建 AI 应用。

之所以学习这个，一方面是因为很多时候，用户需要的 AI 应用并不需要搭建完整的智能体，仅仅通过**提示词 + 调用 API** 就可以实现，比如很多 AI 生图软件；另一方面也因为，搭建智能体时需要了解大模型 API 的核心参数、调用方式等，所以我们要先学它。

## 一、从 Hello World 到生产环境

说起“通过 API 构建应用”，可能有朋友会说，这不是很简单吗？三行代码就够了：

```none
import OpenAI from 'openai';
const client = new OpenAI({ apiKey: "sk-xxx" });
const response = await client.chat.completions.create({ model: "deepseek-chat", messages: [{ role: "user", content: "你好" }] });
```

上面的代码运行后，收到 AI 对“你好”的回复，大模型 API 不就调通了嘛，还有什么好讲的。

这只是 Hello World，正式上线的 AI 应用就这么简单吗？

当然不是。

当你把这段代码部署到生产环境，可能会遇到这些问题：

-   **半夜接到监控报警**：用户界面持续转圈，功能无法使用。
    
-   **老板拿着账单质问**：为什么 AI 账单一天飙几千块？
    
-   **产品经理抱怨**：同样的问题，AI 为什么每次回答都不一样？
    

这些问题都是我曾经遇到过的，Hello World 和正式上线，之间还有很大的鸿沟。调用 API 只是开始，能够封装出**健壮、可控、稳定的大模型服务**才算达到要求。文章开头那种只有三方代码调用，没有重试、限流和超时控制的 AI 代码，在生产环境里就是一颗定时炸弹。

这一讲，我们来聊聊如何像老手一样优雅地调用大模型，主要解决三个问题：

1\. 参数掌控：如何通过 Temperature、Top\_p 等参数控制 AI 的"理性"与"创造力"？

2\. 平台选型：DeepSeek、硅基流动、阿里百炼、字节火山方舟、腾讯混元，该选哪个？

3\. 工程封装：如何封装出高可用的 AI 系统？

在开始之前，我们需要先确立一个绝对标准：**拥抱 OpenAI 兼容协议**。

## 二、优先选 OpenAI 兼容协议

之所以要强调这个，是因为如果你一开始就选错了技术路线，用了某个厂商的私有 SDK，那么当你想切换模型时，就会发现自己陷入了"维护地狱"：每个厂商的 API 都不一样，你需要重写所有调用代码。

在 AI 工程界，OpenAI 兼容协议就像互联网世界的 TCP/IP 协议一样，已经成为事实上的标准。无论你用哪家的模型，只要它不支持这个标准，就请谨慎考虑。

什么是 OpenAI 兼容协议？简单来说，就是用 OpenAI 的 SDK，通过修改 \`baseURL\` 来调用其他厂商的模型：

```none
import OpenAI from 'openai';
// 调用 DeepSeek
const client = new OpenAI({
apiKey: "your-deepseek-key",
baseURL: "https://api.deepseek.com"
});
// 调用阿里通义千问
const client = new OpenAI({
apiKey: "your-qwen-key",
baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});
// 调用字节豆包
const client = new OpenAI({
apiKey: "your-doubao-key",
baseURL: "https://ark.cn-beijing.volces.com/api/v3"
});
```

看到了吗？只需要改两个参数（\`apiKey\` 和 \`baseURL\`），你就可以在不同厂商之间自由切换。这意味着：

-   不被厂商锁定：今天用 DeepSeek，明天想换成通义千问，只需要改环境变量，不需要重写代码。
    
-   统一的开发体验：所有模型都用同样的 API 调用方式，学习成本降到最低。
    
-   生态工具兼容：基于 OpenAI SDK 的工具库（如 LangChain、LlamaIndex）都可以直接使用。
    

有些开发者为了省事，直接用厂商的私有 SDK，比如阿里的 \`dashscope\`、字节的 \`volcengine\`。这看起来方便，但实际上是在给自己挖坑。当你的代码里混用了多个私有 SDK，每个 SDK 的参数格式、错误处理、返回结构都不一样，维护成本会呈指数级增长。这不是"省事"，这是"维护地狱"的开始。

所以，记住这条铁律：**不要为了"省事"去用厂商的私有 SDK，要为了"标准"去用 OpenAI 兼容协议**。

接下来，我们来看看如何掌控 API 的核心参数。

## 三、大模型 API 核心参数详解

![](https://static.xiaobot.net/file/2025-12-24/21332/72eb0189f8ef4f31c374f1c79587e73b.png!post)

当你第一次调用大模型 API 时，可能会被一堆参数搞晕：\`temperature\`、\`top\_p\`、\`max\_tokens\`、\`seed\`、\`frequency\_penalty\`、\`presence\_penalty\`……这些参数到底是干什么的？该怎么设置？

其实，真正需要掌握的核心参数只有 4 个：**Temperature、Top\_p、Max Tokens、Seed**。理解了这 4 个参数，你就能控制 AI 的"理性"与"创造力"，让它按照你的意图工作。

## 3.1 Temperature：理性与感性的调节杆

![](https://static.xiaobot.net/file/2025-12-24/21332/594a4c4b4dfb3a6d7b0fec0ce1ef2094.png!post)

Temperature（温度）是最重要的参数，它控制着 AI 输出的随机性。你可以把它理解为 AI 的"理性程度"：

-   Temperature = 0：绝对理性，每次都选择概率最高的词，输出结果完全确定。
    
-   Temperature = 1：正常随机，按照模型的原始概率分布采样。
    
-   Temperature > 1：高度随机，低概率的词也有机会被选中，输出更加天马行空。
    

温度的典型使用场景：

-   场景 1：代码生成、数学计算、JSON 提取，需要稳定的输出，Temperature 设置为 0
    
-   场景 2：文案创作、角色扮演、头脑风暴，需要有创意，Temperature 设置为 0.7-0.9
    

```javascript
import OpenAI from 'openai';
const client = new OpenAI({
apiKey: process.env.DEEPSEEK_API_KEY,
baseURL: "https://api.deepseek.com"
});
// 场景 1：代码生成、数学计算、JSON 提取 → Temperature = 0
const response1 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "用 JavaScript 写一个快速排序" }],
temperature: 0 // 绝对理性，确保输出稳定
});
// 场景 2：文案创作、角色扮演、头脑风暴 → Temperature = 0.7-0.9
const response2 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "写一段科幻小说的开头" }],
temperature: 0.8 // 高创意，输出更有想象力
});
```

简单解释下这个参数的原理：**Temperature 控制的是输出概率分布的"平滑度"**。**当 Temperature = 0 时，模型会把所有概率集中在最高的那个词上；当 Temperature 升高时，低概率的词也会获得更多机会。**

如果你要 AI 写代码，请把 Temperature 拧到 0，让它像个严谨的工程师；如果你要 AI 写小说，请把它拧到 0.8，让它像个喝醉的诗人。

## 3.2 Top\_p：词汇过滤器

![](https://static.xiaobot.net/file/2025-12-24/21332/2f1bc9e2d6ea97dfbde12107905328ed.png!post)

Top\_p（也叫 Nucleus Sampling，核采样）是另一种控制随机性的方式。**它的作用是：从累积概率达到 p 的最小词集合中采样。**

很关键的 2 个细节：

1.  **"最小集合"原则**：算法会选择尽可能少的词，使其累积概率**刚好≥p**，然后停止。它不会包含更多词，即使加上它们也达到某个累积值。
    
2.  **排序很重要**：一定要从概率最高的词开始累加，这是"核采样"的核心。
    

举个例子：假设模型预测“你”的下一个词的概率分布是：

-   "好"：50%
    
-   "很好"：30%
    
-   "不错"：15%
    
-   "棒"：5%
    

如果设置 \`top\_p=0.8\`，那么模型只会从"好"（50%）和"很好"（30%）中选择，因为它们的累积概率已经达到 80%。

> **Top-p 与 Top-k 的区别**：
> 
> -   **Top-k**：固定选择前k个词（比如k=3，总是选前3个）
>     
> -   **Top-p**：动态选择，集合大小随分布变化（概率集中时可能只选1-2个，分散时可能选很多个）
>     

**了解了 Top-p 的作用后，还要记住这个关键原则：二选一法则。**

在 API 调参界有一条铁律：**不要同时修改 Temperature 和 Top\_p**。就像你不能同时踩油门和刹车一样，把两个控制随机性的变量混在一起，模型会精神分裂。

推荐做法：

-   大多数情况下，只调 Temperature，把 Top\_p 固定在 1.0（默认值）
    
-   只有在需要精确控制词汇范围时，才使用 Top\_p
    

```javascript
// ✅ 推荐：只调 Temperature
const response = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "你好" }],
temperature: 0.7,
top_p: 1.0 // 保持默认
});
// ❌ 不推荐：同时调整两个参数
const response = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "你好" }],
temperature: 0.7,
top_p: 0.9 // 逻辑会混乱
});
```

## 3.3 Max Tokens：成本刹车片

![](https://static.xiaobot.net/file/2025-12-24/21332/c8c408771aff88273bf85263ba2b14d7.png!post)

Max Tokens 限制的是 AI 输出的最大 token 数量。很多新手会误以为它限制的是输入，其实不是——**它只限制输出**。

**为什么要设置 Max Tokens 呢？**

使用 AI 的时候我们经常会遇到 AI 陷入死循环，重复输出一句话。想象一下，这件事发生在你的身上，用户的某个输入让你调用的模型陷入了死循环，没有控制的情况下疯狂输出了一晚上，早上醒来你的账单直接爆炸，这个时候，你一定会后悔没有早点学习 Max Tokens。

Max Tokens 就是用来防止这种情况的"成本刹车片"，你可以根据预期的输出结果长度灵活设置：

```javascript
// 场景 1：简短回答（如客服机器人）
const response1 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "什么是 AI？" }],
max_tokens: 100 // 限制在 100 个 token 以内
});
// 场景 2：长文本生成（如文章创作）
const response2 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "写一篇关于 AI 的文章" }],
max_tokens: 4096 // 允许更长的输出
});
```

**建议你永远设置一个安全阈值**。即使你输出的长度不确定，也要设置一个上限（如 65535），防止 AI 发疯。

## 3.4 Seed：可复现性的科学实验

Seed（随机种子）是一个经常被忽略但非常重要的参数。它的作用是：**让 AI 的输出可复现**。

在 Prompt 调试阶段，你需要不断调整提示词，观察效果。但如果每次 AI 的输出都不一样，你怎么知道是提示词的改进起了作用，还是随机性导致的？

这时候，固定 Seed 就是控制变量、科学评估效果的唯一手段。

```javascript
// 调试阶段：固定 Seed，确保输出可复现
const response1 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "写一个产品介绍" }],
temperature: 0.7,
seed: 12345 // 固定随机种子
});
// 第二次调用，输出结果会完全一样
const response2 = await client.chat.completions.create({
model: "deepseek-chat",
messages: [{ role: "user", content: "写一个产品介绍" }],
temperature: 0.7,
seed: 12345 // 相同的 Seed，相同的输出
});
```

设置相同 Seed 后：

-   每次程序运行时，随机数生成器会产生**完全相同的随机数序列**
    
-   这意味着模型采样时的每个"随机决策"都会相同
    
-   最终输出完全相同
    

**使用建议：**

-   调试阶段：固定 Seed，方便对比不同提示词的效果
    
-   生产环境：不设置 Seed（或每次随机），保持输出的多样性
    

## 3.5 参数组合速查表

下面是一些典型场景的参数设定，不知道怎么设置的时候可以看一下：

![](https://static.xiaobot.net/file/2025-12-25/21332/87ffe2b766dd9a43820ce112ddaab700.png!post)

掌握了这 4 个核心参数，你就能像老司机一样控制大模型的行为方向。接下来，我们来看看如何选择合适的 API 平台。

## 四、头部大模型 API 平台对比

2025 年的国产大模型市场，已经从"百模大战"进入了"价格屠杀"阶段。DeepSeek-V3 把价格打到了 2 元/百万 token，硅基流动提供 11 个完全免费的模型，腾讯混元的 Hunyuan-lite 直接免费到底……

我们选择模型平台时不能只看价格。成本敏感的离线任务、高并发的 C 端应用、超长文档处理，每个场景的最优解都不一样。

接下来，我们基于 2025 年 12 月的最新数据，对 6 大主流平台进行深度横评。

## 4.1 DeepSeek 官方：价格屠夫，但要小心晚高峰

DeepSeek 不愧是国产大模型之光，它主打一个性价比之王、推理能力强，但缺点是晚高峰经常拥堵。

官方网站：[https://platform.deepseek.com/usage](https://platform.deepseek.com/usage)

官方文档：[https://api-docs.deepseek.com/zh-cn/](https://api-docs.deepseek.com/zh-cn/)

![](https://static.xiaobot.net/file/2025-12-25/21332/58ebec401e80f587b6341d52c8a909d8.png!post)

它的价格几个头部平台基本都接近，拿 DeepSeek-V3.2 来说，[官网](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)、[硅基流动](https://cloud.siliconflow.cn/me/models)和[火山方舟](https://console.volcengine.com/ark/region:ark+cn-beijing/model/detail?Id=deepseek-v3-2)：

-   输入 2 元/百万 token、输出 3 元/百万 token
    

**DeepSeek 的适用场景**：

-   离线批处理任务（如数据分析、内容生成）
    
-   对成本极度敏感的项目
    
-   代码生成、逻辑推理等高性能需求
    

**一些踩坑经验：**

-   官方 API 在晚高峰（晚上 8-11 点）经常出现 502 错误或超时
    
-   不适合 C 端的实时生成业务（用户体验会很差）
    

**避坑建议：**

-   如果你的应用对实时性要求高，建议通过[**硅基流动**](https://cloud.siliconflow.cn/me/models)**或**[**火山方舟API**](https://console.volcengine.com/ark/region:ark+cn-beijing/model/detail?Id=deepseek-v3-2)调用 DeepSeek，而不是直接用官方 API
    
-   官方 API 更适合离线任务，比如凌晨跑批处理
    

```javascript
// 通过硅基流动调用 DeepSeek（更稳定）
const client = new OpenAI({
apiKey: process.env.SILICONFLOW_API_KEY,
baseURL: "https://api.siliconflow.cn/v1"
});
const response = await client.chat.completions.create({
model: "deepseek-ai/DeepSeek-V3",
messages: [{ role: "user", content: "你好" }]
});
```

## 4.2 硅基流动：开发者的免费乐园

硅基流动（[https://www.siliconflow.cn/](https://www.siliconflow.cn/)）是一个聚合的 AI 模型平台，它的业务核心是提供“模型即服务”（MaaS），其产品矩阵旨在让开发者和企业能够“**用得上、用得好、用得起**”AI大模型

![](https://static.xiaobot.net/file/2025-12-25/21332/db884e01d168fd17b7448b1496318983.png!post)

**它的核心特点：免费额度多、开源模型全、速度快。**

![](https://static.xiaobot.net/file/2025-12-25/21332/d0d1c85bd7977be2e6a33429f3ba8fcf.png!post)

**免费政策：**

-   11 个文本生成模型完全免费（包括 Qwen3-8B、GLM-4-9B、DeepSeek-R1-Distill-Qwen-7B 等）
    
-   部分付费模型提供 50 万 tokens 免费额度
    

![](https://static.xiaobot.net/file/2025-12-25/21332/e2ea9164efe1fe8275ca9d38ad314d2b.png!post)

**它的性能优势**：

-   华为云算力加持，速度比官方更快
    
-   支持上百种开源模型，是多模型对比选型的最佳平台
    

![](https://static.xiaobot.net/file/2025-12-25/21332/5a0c8d641e6d9f577795749b3f694765.png!post)

**QPS 限制（上线使用需要特别关注这个，防止不支持高并发）：**

-   免费版：RPM=1,000（每分钟请求数）、TPM=50,000（每分钟 token 数）
    
-   生产环境建议升级到 Pro 版，解除限制
    

硅基流动平台适合的场景：

-   开发测试阶段（免费额度充足）
    
-   多模型对比选型
    
-   中小规模应用部署
    

一些踩坑经验：

-   免费版的 QPS 限制对个人开发者够用，但如果你的应用日活超过 1000，建议提前升级 Pro 版
    
-   注意监控免费额度的消耗情况，避免突然超额
    

```javascript
// 硅基流动的免费模型调用
const client = new OpenAI({
apiKey: process.env.SILICONFLOW_API_KEY,
baseURL: "https://api.siliconflow.cn/v1"
});
const response = await client.chat.completions.create({
model: "Qwen/Qwen2.5-7B-Instruct", // 完全免费
messages: [{ role: "user", content: "你好" }]
});
```

## 4.3 阿里百炼：超长文档处理的王者

阿里百练（[https://bailian.console.aliyun.com/](https://bailian.console.aliyun.com/)）是阿里云推出的一站式大模型应用开发平台，旨在帮助企业及开发者快速、高效地构建和部署AI应用。

![](https://static.xiaobot.net/file/2025-12-25/21332/6987bcdd12db7f4404c6d78ed483587c.png!post)

它的特点是除了大模型 API，还提供了大模型应用开发的工具和功能，另外推荐的模型主要是阿里千问模型。

它的优势是有**价格特别便宜的模型**和**上下文特别长的模型**：

-   Qwen-Flash（0-128K）：输入 0.15 元/百万 token，输出 1.5 元/百万 token（比 DeepSeek 还便宜）
    
-   Qwen-Long：全球首个商用千万级上下文模型，支持 1000 万 token 上下文（约 1500 万字），输入仅 0.5 元/百万 token
    

因此，**可以在这些场景下选择用阿里百练**：

-   代码审查、论文分析、合同审阅等**超长文档场景**：Qwen-Long 可以一次性处理整本书（300 万字），成本极低
    
-   **企业级 RAG 应用**（知识库问答、文档助手）：百炼提供了知识库构建、文档解析、向量检索等完整工具链
    

-   **成本敏感的高频调用场景**：Qwen-Flash 价格最低，所有主力模型提供 100 万 token 免费额度（有效期 90 天）
    

![](https://static.xiaobot.net/file/2025-12-25/21332/7cf682fbfc8f3a34bb9daeaeead15053.png!post)

一些踩坑经验：

-   很多模型计费规则采用**阶梯计价**：单次请求的输入 token 越多，单价越高。如果你的应用经常处理长文本，要提前计算好成本
    
-   部分插件（如联网搜索）会产生额外费用，使用前要看清楚计费说明
    

```javascript
// 调用 Qwen-Long 处理超长文档
const client = new OpenAI({
apiKey: process.env.QWEN_API_KEY,
baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
});
const response = await client.chat.completions.create({
model: "qwen-long",
messages: [{ role: "user", content: "请分析这份 100 页的合同..." }],
max_tokens=4096,  # 限制输出长度
});
```

## 4.4 字节火山方舟：高并发场景的并发怪兽

火山方舟（[https://console.volcengine.com/ark/region:ark+cn-beijing/overview](https://console.volcengine.com/ark/region:ark+cn-beijing/overview)）是字节跳动旗下火山引擎推出的一站式大模型服务平台，它主要是提供字节豆包模型和 DeepSeek 等开源模型。

![](https://static.xiaobot.net/file/2025-12-25/21332/e3cf62f2f7a23faa00f911e2a0372946.png!post)

它的特点是：并发能力强、抗突发流量、C 端应用首选。

为什么说并发能力强呢，以下数据为证：

-   实测数据：在 10,000 QPS 压力下保持零服务中断
    
-   首 token 延迟稳定在 0.30 秒
    

它的核心模型价格（Doubao 系列）：

-   Doubao-seed-1.6-flash（极速版）：输入 0.15 元/百万 token、输出 1.5 元/百万 token（0-32K）
    
-   Doubao-seed-1.6-lite（轻量版）：输入 0.3 元/百万 token、输出 0.6 元/百万 token（0-32K）
    

![](https://static.xiaobot.net/file/2025-12-25/21332/389868a9ca7359b7acda0bb4535276de.png!post)

火山方舟的适用场景：

-   高并发 C 端应用（电商客服、在线教育、社交应用）
    
-   对响应速度要求高的实时场景
    
-   需要稳定 QPS 保障的企业级应用
    

一些经验：

-   火山方舟的 SDK 更新频繁，建议走 OpenAI 兼容模式，避免频繁适配
    
-   价格采用**阶梯计价**，输入长度超过 32K 后单价会上涨，要注意控制
    
-   在我们的文本处理业务里，豆包 Seed 1.6 基本上占大头，另外就是 Gemini 了。豆包 1.6 胜在价格便宜很多，效果也还能接受，比 Gemini 性价比高很多，要做文本处理且预算有限时的首选。
    

```javascript
// 调用火山方舟豆包模型
const client = new OpenAI({
apiKey: process.env.DOUBAO_API_KEY,
baseURL: "https://ark.cn-beijing.volces.com/api/v3"
});
const response = await client.chat.completions.create({
model: "doubao-seed-1.6-flash",
messages: [{ role: "user", content: "你好" }]
});
```

## 4.5 腾讯混元：微信生态的原生选择

腾讯混元（[https://hunyuan.tencent.com/](https://hunyuan.tencent.com/)）是腾讯云面向开发者和企业提供的一站式大模型服务接入平台。其核心目标是让用户能够便捷、高效地将**腾讯领先的AI大模型**能力集成到自己的应用、产品或服务中。

![](https://static.xiaobot.net/file/2025-12-25/21332/6d416f853d6c9420971bd3f6caa356f5.png!post)

**它的特点是：提供的都是微信的模型，如果想使用其他模型，这个平台不适合。**

免费政策：

-   首次开通赠送 100 万 token 免费额度（有效期 1 年）
    
-   混元生图：首次开通赠送 50 次免费调用
    

![](https://static.xiaobot.net/file/2025-12-25/21332/84512789f658ba7d30c7d92f38689a2e.png!post)![](https://static.xiaobot.net/file/2025-12-25/21332/c1701175b52f58c69747e238dab9f417.png!post)

混元大模型 API 的适用场景：

-   微信小程序、公众号等微信生态应用
    
-   多模态应用（文生图、图像理解）
    

一些踩坑经验：

-   默认 5 并发对小型应用够用，但如果你的应用日活超过 500，需要提前购买并发扩容
    
-   联网插件（AI 搜索）按次数收费（6 元/千次），使用前要评估成本
    

```javascript
// 调用腾讯混元（免费模型）
const client = new OpenAI({
apiKey: process.env.HUNYUAN_API_KEY,
baseURL: "https://api.hunyuan.cloud.tencent.com/v1"
});
const response = await client.chat.completions.create({
model: "hunyuan-lite", // 完全免费
messages: [{ role: "user", content: "你好" }]
});
```

## 4.6 OpenRouter：海外模型聚合平台

OpenRouter（[https://openrouter.ai/](https://openrouter.ai/)） 是国外头部的大模型统一接口平台，通过它我们可以调用 Anthropic（Claude）、Google（Gemini）、Meta（LLaMA）等国外各家厂商的大模型，适合开发出海业务的时候使用。

![](https://static.xiaobot.net/file/2025-12-25/21332/4168587820f5aa2f71b1d6e5e5ffbbd4.png!post)

它的特点是：**模型选择极其丰富、接口统一、性价比极高**。

为什么说它是海外模型 API 的首选：

-   聚合了来自 **60+** 家供应商的 **400+** 个模型
    
-   提供智能路由，自动选择可用且成本最优的供应商节点
    
-   新用户注册即赠送 **1,000,000** 免费 token 用于体验
    

它的核心模型价格（举例，价格随时动态变化）：

-   **Google Gemini Flash 1.5**: 输入 0.075/百万token，输出0.30 / 百万 token
    
-   **Claude 3.5 Sonnet**: 输入 3.00/百万token，输出15.00 / 百万 token
    
-   **DeepSeek R1**: $0.80 / 百万 token（输入输出同价）
    
-   **Mistral 7B Instruct** (免费): 输入输出完全免费
    

**一些使用经验：**

-   OpenRouter 的 **最大优势是接口 100% 兼容 OpenAI API**，迁移成本极低，只需替换 baseURL和 apiKey。
    
-   出海业务，**复杂推理任务用 Claude，快速简单的任务用 Gemini Flash，代码生成则用 DeepSeek**，通过 OpenRouter 一个平台就能搞定，非常灵活。
    

## 4.7 平台选型决策树

以上是常用的 AI 大模型 API 平台，根据这些平台的特点，整理一个选型决策树：

![](https://static.xiaobot.net/file/2025-12-25/21332/cd83ec091f790b00989b762b5c8f91f7.png!post)

**再来一个平台特点对比速查表**

![](https://static.xiaobot.net/file/2025-12-25/21332/196fcf51e5de0879b07979a9eb825cef.png!post)

## 五、手动封装 API

选好了平台，掌握了参数，接下来我们学习如何封装一个高可用的 API 服务，为了深刻理解，先手动来一遍。

## 5.1 让 API 调用不再脆弱

网络抖动、服务端限流、临时故障……这些问题在生产环境中无法避免。如果你的代码遇到错误就直接抛异常，用户体验会非常糟糕。

**重试机制**是解决这些问题的最简单方案。一个小细节是，重试的间隔要逐步放大，否则容易造成 DDOS（短时间大量请求导致服务器无法被正常用户访问）攻击，举个例子：报错 → 歇 1 秒再试 → 还不行歇 2 秒 → 最多试 3 次 → 最后才抛异常。

JS 项目使用 \`p-retry\` 库可以优雅地实现重试（其他语言也有类似的库）：

```javascript
import pRetry from 'p-retry';
import OpenAI from 'openai';
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,    
    baseURL: "https://api.deepseek.com",    
    timeout: 120000 // 超时设置：120 秒    
    });
async function callLLM(prompt) {
    return pRetry(
        async () => {
            const response = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
            });
            return response.choices[0].message.content;
        },
        {
            retries: 3, // 最多重试 3 次
            factor: 2, // 指数因子
            minTimeout: 1000, // 最小延迟 1 秒
            maxTimeout: 10000, // 最大延迟 10 秒
            onFailedAttempt: (error) => {
                console.log(`尝试 ${error.attemptNumber} 失败，还剩 ${error.retriesLeft} 次重试`);
            }
        }
);
}
// 调用时自动重试
try {
    const result = await callLLM("写一段代码");
    console.log(result)
} catch (error) {
    console.error("重试 3 次后仍然失败：", error);
}
```

> p-retry 的更详细案例见 [https://github.com/shixinzhang/AI-TODO/blob/main/pages/api/samples/retry.ts](https://github.com/shixinzhang/AI-TODO/blob/main/pages/api/samples/retry.ts)

封装大模型 API 的重试和超时控制细节：

-   **等待时间指数增长**：第一次等 1 秒，第二次等 2 秒，第三次等 4 秒……避免频繁请求加重服务端压力
    
-   **超时时间加大**：传统 HTTP 的 5 秒超时在大模型场景下不够用，建议设置 \`timeout: 120000\`（特别是推理模型如 DeepSeek-R1）
    
-   **限制最大重试次数**：不要无限重试，一般 3 次即可
    

## 5.2 流式响应 让用户不再焦虑

我们在使用其他聊天 AI （比如 ChatGPT、豆包）的时候，经常看到 AI 的输出结果像打字机一样一个字一个字的蹦出来，这是一种很好的体验优化---流式输出。

要处理的提示词越复杂，大模型输出的耗时越久。如果你用普通的同步调用，用户可能要等 5-10 秒才能看到结果，这期间界面一片空白，用户会以为程序卡死了。

而使用流式响应（Streaming）以后，就可以让用户看到程序在输出结果，心里有了等待的预期，体验会提升很多。

**要实现流式输出，后端和前端分别需要进行这样的处理**：

1.  后端
    
    1.  请求大模型 API 的时候，参数 stream（一般都叫这个名字，少数不一样） 设置为 true，表示需要大模型 API 流式输出
        
    2.  接口响应的 header 里，Content-Type 设置为 text/event-stream（必不可少）、Cache-Control 等其他值参考这里：
        
        res.setHeader('Content-Type', 'text/event-stream')
        
        res.setHeader('Cache-Control', 'no-cache')
        
        res.setHeader('Connection', 'keep-alive')
        
        res.setHeader('X-Accel-Buffering', 'no') // 禁用 Nginx 缓冲
        
    3.  返回 **Server-Sent Events (SSE)** 类型的数据：data: {JSON数据}\\n\\n
        
        ```none
        // 开始消息
        data: {"type":"start","message":"开始生成..."}\n\n
        // 数据块消息
        data: {"type":"chunk","content":"Hello"}\n\n
        data: {"type":"chunk","content":" World"}\n\n
        // 结束消息
        data: {"type":"done","message":"生成完成"}\n\n
        ```
        
2.  前端
    
    1.  按照 SSE 格式解析数据
        
    2.  去重，否则会出现下图所示的“结巴”效果
        
        ![](https://static.xiaobot.net/file/2025-12-27/21332/cce103814b3377c1d3076841d63d267b.png!post)

### 5.2.1 后端如何发送数据（Next.js 方案）

步骤 1：设置 SSE 响应头

```none
res.setHeader('Content-Type', 'text/event-stream')  // SSE 标准格式
res.setHeader('Cache-Control', 'no-cache')           // 禁用缓存
res.setHeader('Connection', 'keep-alive')            // 保持连接
res.setHeader('X-Accel-Buffering', 'no')            // 禁用 Nginx 缓冲
```

步骤 2：调用大模型 API（流式）

```none
const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_API_BASE_URL,  // SiliconFlow 的 API 地址
})
const stream = await openai.chat.completions.create({
  model: 'deepseek-ai/DeepSeek-V3.2-Exp',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
  max_tokens: 2000,
  stream: true,  // 关键：启用流式输出
})
```

步骤 3：发送 SSE 消息

```none
// 1. 发送开始消息
res.write(`data: ${JSON.stringify({ type: 'start', message: '开始生成...' })}\n\n`)
// 2. 循环处理流式响应
for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || ''
  if (content) {
    // SSE 格式：data: {...}\n\n
    res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`)
  }
}
// 3. 发送结束消息
res.write(`data: ${JSON.stringify({ type: 'done', message: '生成完成' })}\n\n`)
res.end()
```

标准的 SSE 格式是这样：data:<JSON>\\n\\n

-   data: 前缀
    
-   JSON 字符串
    
-   两个换行符 \\n\\n 作为消息分隔符
    

比如：data: {"type":"chunk","content":"今天是"}\\n\\n

type（消息类型）的值有这四种：

-   start: 开始生成
    
-   chunk: 内容块
    
-   done: 完成
    
-   error: 错误
    

### 5.2.2 React 前端接收流式数据

前端使用 Fetch API + ReadableStream 手动解析 SSE：

```none
// 1. 使用 fetch 发送 POST 请求
const response = await fetch('/api/samples/stream', {
  method: 'POST',
  body: JSON.stringify({ prompt, model })
})
// 2. 获取 ReadableStream
const reader = response.body.getReader()
const decoder = new TextDecoder()
let buffer = ''
// 3. 手动读取流数据
while (true) {
  const { done, value } = await reader.read()
  if (done) break
  // 4. 手动解码和解析 SSE 格式
  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split('\n\n')  // SSE 消息以 \n\n 分隔
  buffer = lines.pop() || ''
  // 5. 手动解析 data: {...} 格式
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6))
      // 处理数据...
    }
  }
}
```

JS 前端有个 EventSource API 专门用来解析 SSE 数据。但它的限制是只支持 GET 请求，不支持 POST，因为演示案例需要 POST 传递 prompt 和 model 参数，所以没用，但大家可以记住这个 API，使用起来很简单:

```none
    const es = new EventSource('/api/samples/stream');    
    es.onopen = () => {
      setIsConnected(true);
    };
    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };
    es.onerror = () => {
      setIsConnected(false);
    };
```

OK 这就是流式输出的大概实现方式，关键点：

-   后端发送 SSE 数据
    
-   前端使用 \`fetch\` + \`getReader()\` 接收流式数据
    

流式响应不仅提升体验，还能更早发现错误：如果模型输出有问题，不用等到全部生成完才发现。

## 5.3 永远不要把密钥写在代码里

这是一个基本的安全原则，但很多新手经常会犯，所以也强调一下：**不要把 API Key 直接写在代码里，一旦提交到 GitHub，很容易泄漏密钥，被别人刷爆账单。**

**正确做法是使用 \`.env\` 文件管理密钥。**

**第一步：创建 \`.env.local\` 文件**

```none
# Supabase 配置
# 从 Supabase Dashboard -> Settings -> API 获取这些值
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# API 配置（可选）
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_APP_ID=your_app_id
# DeepSeek API 配置
# 从 https://platform.deepseek.com 获取 API Key
# 用于 AI 任务拆解功能，如果不配置，拆解功能将无法使用
DEEPSEEK_API_KEY=your_deepseek_api_key
```

**第二步：在 \`.gitignore\` 中忽略 \`.env.local\`**

![](https://static.xiaobot.net/file/2025-12-27/21332/848ded01fa361805c85fdeab82da306e.png!post)

**第三步：在代码中读取环境变量**

```javascript
// Next.js 内置支持，无需额外配置
const client = new OpenAI({
apiKey: process.env.DEEPSEEK_API_KEY,
baseURL: process.env.DEEPSEEK_BASE_URL
});
// Node.js 项目需要安装 dotenv
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({
apiKey: process.env.DEEPSEEK_API_KEY,
baseURL: process.env.DEEPSEEK_BASE_URL
});
```

Next.js 内置了环境变量加载，不需要我们手动使用 dotenv。它会按照优先级自动加载项目根目录下的这些文件，将变量注入到 process.env 中：

-   .env.local（本地开发，优先级最高）
    

-   .env.development（开发环境）
    

-   .env.production（生产环境）
    

-   .env（通用配置，优先级最低）
    

Next.js 有两种环境变量：

服务端变量（默认）

```none
// 只在服务端可用（API Routes、getServerSideProps 等）
process.env.DEEPSEEK_API_KEY  // 服务端可用
```

客户端变量（需要 NEXT\_PUBLIC\_ 前缀）

```none
// 需要 NEXT_PUBLIC_ 前缀才能在客户端使用
process.env.NEXT_PUBLIC_API_BASE_URL  // 客户端和服务端都可用
```

小结一下：**代码里永远不要出现 \`sk-xxxx\` 这样的明文密钥，另外最好定期轮换 API Key，降低泄露风险。**

## 5.4 再分享两个常见的坑

掌握了封装的基本功，我们再来了解两个坑，开发线上应用一定用得到。

### 5.4.1：大模型费用预估坑

有时候我们需要根据**用户量、单次请求的 token 数评估成本**。

这里有几个小坑：

1.  token 数不等于字数
    
2.  不同模型的 token 计算规则不一样
    
3.  不同模型的价格也不一样
    

新手往往会只注意第三点，但忽略了前两点，导致迁移模型时成本低估，上线欠费了才意识到问题。

**首先，token 数不等于字数。**当用户输入：“你好，请帮我写一封请假邮件”，你数一下有 12个字，可能以为是 12 个token。**实际上模型会将文本分解成更小的单元，这些单元称为“token”。这个过程由“Tokenizer”（分词器）完成**。比如 DeepSeek 可能切成 7 个 token：\["你好", "，", "请", "帮我", "写", "一封", "请假邮件"\]。

**所以预估成本不能按字数计算，会出现偏差。**

**另外不同模型的 token 计算规则也不一样。**厂商训练模型时，会根据自己的语料和算法训练一个 Tokenizer （分词器），不同的分词器分词规则不一样。比如前面的输入，Gemini 3 可能切成 11 个 token:\["你", "好", "，", "请", "帮", "我", "写", "一", "封", "请假", "邮件"\]。

**所以同样的输入，在使用不同模型时消耗的 token 数量不一样，有些情况下可能差异很大。**

![](https://static.xiaobot.net/file/2025-12-27/21332/298a1f5b081faec709d5ba51e37a5320.png!post)

模型使用**成本等于输入/输出的 token 数乘以模型价格**，比如使用的是 DeepSeek-V3.2，单次输入 10000 token，输出 30000 token，这次的成本就是：

成本 = 输入token数 × 输入单价 + 输出token数 × 输出单价

\= 10000 x 2/1000000 + 30000 x 3 / 1000000

\= 0.11

**当你要切换模型时，预估费用不单单要修改输入/输出单价，对应的 token 数也得重新测试计算。**

有一种方案是使用 \`js-tiktoken\` 或者其他类似的分词库进行 token 计算：

```javascript
// 使用 js-tiktoken 计算 token 数量
import { encoding_for_model } from 'js-tiktoken';
function countTokens(text, model = 'gpt-4') {
const encoding = encoding_for_model(model);
const tokens = encoding.encode(text);
encoding.free(); // 释放内存
return tokens.length;
}
const text = "你好，世界！";
const tokenCount = countTokens(text);
console.log(`Token 数量：${tokenCount}`); // 输出：6
```

除了计算不同模型的 token 数，我们在预估成本时也要预留 20-30% 的 Buffer，在接口上线初期监控实际消耗，及时调整预算。

### 5.4.2：并发量限制（429 Rate Limit）

几乎所有大模型 API 平台都有速率限制（RPM、TPM），并发量太高、超过她们的限制，接口就会返回 \`429 Too Many Requests\` 错误，尤其是免费版的 QPS 限制更低（如硅基流动免费版 RPM=1,000）。

> HTTP 429 状态码表示**请求过多**（Too Many Requests），这是服务器告诉你"你发送的请求太频繁了，请慢一点"。

所以我们在接口上线前，也要评估 QPS，如果并发量非常大，就得做好措施。

这里分享我知道的几个解决办法。

**方案 1：智能退避**

```javascript
async function callWithRateLimitHandling(prompt) {
    try {
        const response = await client.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: prompt }]
        });
        return response;
    } catch (error) {
        if (error.status === 429) {
            // 从响应头获取重试时间
            const retryAfter = error.headers?.['retry-after'];
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
            console.log(`触发限流，${waitTime}ms 后重试`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            // 递归重试
            return callWithRateLimitHandling(prompt);
        }
        throw error;
    }
}
```

在调用三方大模型 API 时，错误处理里针对状态码 429 进行处理：

1.  通过响应头中的 Retry-After 字段获取对方返回的重试时间
    
2.  根据对方的要求在一定时间后重试
    

**记住：不要在收到 429 后立即重试，这会让情况更糟。**

**方案 2：多 Key 轮询**

如果你的应用 QPS 很高，可以准备 3 个 API Key，在一个 key 失败后使用下一个 key 进行请求，做一个简单的轮询器：

![](https://static.xiaobot.net/file/2025-12-27/21332/c8b05b86985a1eba7eadf03b40aa916b.png!post)![](https://static.xiaobot.net/file/2025-12-27/21332/38a421fb85ebf42ec802c756f1b91499.png!post)![](https://static.xiaobot.net/file/2025-12-27/21332/1b4890ebc9a974ca59a584d38e6ff38e.png!post)

**小结一下：遇到 429 错误，不要硬刚，要根据对方反馈进行适当重试；高 QPS 业务建议升级付费版或使用多 Key 轮询；监控 RPM/TPM 消耗，提前预警。**

## 六、使用学到的知识 Vibe Coding 一个 AI 聊天页面

把上面的技巧整合起来，一个比较完善的 AI 聊天页面的提示词应该长这样：

> 在首页新增一个 tab【流式AI】，实现一个 AI 聊天功能：
> 
> 模型调用参考 pages/api/tasks/breakdown.ts ，模型参数配置：温度 0.8、超时 120s、MaxTokens 65535、Seed 注释掉（稍后我会测试开启）；
> 
> 模型平台选择硅基流动，baseURL 为 [https://api.siliconflow.cn/v1](https://api.siliconflow.cn/v1) ，模型使用 deepseek-ai/DeepSeek-V3.2-Exp；
> 
> 封装接口使用 p-retry 进行重试、SSE 流式输出、前端实现逐字输出结果（且不重复）；
> 
> 每次请求使用 js-tiktoken 计算 token 数和成本（DeepSeek-V3.2 价格：输入 2元/百万tokens、输出 3元/百万tokens）；
> 
> 遇到 429 错误，根据响应头中的 Retry-After 字段获取对方返回的重试时间进行重试

> 复制提示词：[https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC5%E8%AE%B2.md](https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC5%E8%AE%B2.md)

这个提示词包含了：

-   自动重试机制（韧性设计）
    
-   超时控制（避免卡死）
    
-   流式响应支持（体验优化）
    
-   Token 计数（成本控制）
    
-   统一的错误处理（易于维护）
    

打开我们前几章创建的 AI 拆解 TODO 项目，把这个提示词输入，等待一段时间后，AI 会在顶部增加一个 Tab:

![](https://static.xiaobot.net/file/2025-12-27/21332/2049a44a20926d5c1218c90d7fa5b9f8.png!post)

> 过程中可能会有报错，全部复制给 AI 解决就好。

当我们输入内容后，通过调试页面可以看到接口的返回类型和内容：

![](https://static.xiaobot.net/file/2025-12-27/21332/5f00c2db060cbfd081fede68755b8c1f.png!post)

返回的数据是我们所需要的 SSE 格式：

![](https://static.xiaobot.net/file/2025-12-27/21332/60a87ad7d00fb9f9c41393da06e05c7c.png!post)

前端也是按照我们要求的方式实现：

![](https://static.xiaobot.net/file/2025-12-27/21332/d85ecf4ca604d12c7bfd97ef680cd6c7.png!post)

展示效果（左下角也输出了每次消耗的成本）：

![](https://static.xiaobot.net/file/2025-12-27/21332/93f4f90d70dba18ca32e4128a224155d.png!post)

上图还是有输出内容重复的问题，我让 AI 解决了几次都没处理好，这也体现了手动解析 SSE 格式和管理缓冲区的复杂度。

这里我们重点是功能的完整性，这个细节就不处理了，下一讲我们通过使用框架解决这个问题。

## 七、结语：老手是如何调用大模型的

好了，这篇大模型 API 如何避免踩坑的文章到这里就结束了。

这一讲，我们从 Hello World 出发，一路走到了生产级的 AI 聊天应用开发。

我们学会了：

1.  **参数掌控**：Temperature 控制理性与创造力，Top\_p 不能与其同时调整，Max Tokens 防止成本爆炸，Seed 保证可复现性。
    
2.  **平台选型**：根据场景选择合适的平台——开发测试选硅基流动，超长文档选阿里百炼，高并发选字节火山方舟，微信生态选腾讯混元。
    
3.  **工程封装**：重试机制、超时控制、流式响应、配置安全、Token 计数、多 Key 轮询，这些是生产级 API 封装的必备要素。
    

可以看到，线上使用大模型 API 需要考虑的非常多，新手跑通就万事大吉，而老手则要瞻前顾后。

阅读并吸收这篇文章，**你就有了较为全面的大模型调用认知，以后面对大模型平台选择、成本预估、输出结果多样性和接口鲁棒性等问题，可以讲出不少看法。再加上一些实践，很快就可以成为考虑周全的老手。**

好了，以上就是这篇文章的主要内容，觉得有帮助欢迎留言、点「有启发」，我们下一讲再见。

> 由于平台不支持复制代码，文中提示词上传在这里：[https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC5%E8%AE%B2.md](https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC5%E8%AE%B2.md)

> 本专栏已开启「合伙人计划」，读者可生成专属的邀请链接或邀请海报。
> 
> 有人通过你的邀请链接或海报付费订阅时，会返现支付金额的 25% 给你，比如支付 298 元 会返现 74.5 元，快去分享给你的好朋友们吧！

转型 AI 工程师：重塑你的能力栈与思维

56 读者， 14 内容

![](https://xiaobot.net/img/icon_arrow_right_light.svg)