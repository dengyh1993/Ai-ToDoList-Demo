大家好，我是拭心。

上一讲我们聊了["全栈比想象中容易得多"](https://xiaobot.net/post/43f0fc78-b262-49c0-9def-4f3dd804d670)，通过一个案例体会到， AI 时代开发一个包括前后端的应用如此轻松。但实际开发中我们会发现 AI 经常"翻车"：生成的代码跑不通、逻辑有漏洞、甚至越改越乱。

如何减少这种问题，让 AI 写代码更准确更符合心意呢？

这一讲，我们来聊聊如何高效的 **Vibe Coding**。

## 一、什么是 Vibe Coding？

OpenAI 联合创始人 Andrej Karpathy 在一次分享中提到：

> Vibe Coding 是一种**大部分时间都在管理提示词、复制粘贴和审查代码，而几乎不写代码**的状态。

这句话听起来有点玄学，但它揭示了一个核心事实：

**在 Vibe Coding 时代，程序员不再是逐字逐句的"作家"，而是掌控全局的"主编"。你的核心竞争力，取决于能在多短的时间内，识别出代码的"味道"是对是错。**

## 1.1 身份转变：从 Writer 到 Editor

传统编程中，你是"作家"，一行一行敲代码：

-   瓶颈是手速、语法记忆、API 熟悉度
    
-   核心能力是"写得快、写得对"
    

而在 Vibe Coding 时，你是"主编"，AI 是"写手"：

-   瓶颈是"如何让 AI 理解你的意图"和"如何快速识别 Bug"
    
-   核心能力是"Review 能力"和"用自然语言精准描述需求"
    

举个例子，要实现一个用户登录功能：

-   **传统编程**：需要自己写表单验证、API 调用、错误处理、状态管理……可能要花 2 小时。
    
-   **Vibe Coding**：
    
    -   你告诉 AI："实现用户登录，输错 3 次密码锁定账户，登录成功后跳转 Dashboard，需要包含 Loading 状态。"
        
    -   AI 30 秒生成代码，你花 5 分钟 Review，发现密码加密方式不对，让 AI 改成 bcrypt，再花 2 分钟测试——总共 10 分钟搞定。
        

关键是：**你不需要记住 bcrypt 的 API，也不需要手写表单验证逻辑。你只需要知道"密码应该加密"，以及"bcrypt 是业界标准"。**

## 1.2 核心状态：维持心流（Vibe）

Karpathy 强调的"Vibe"，本质上是一种**心流状态**：

-   当代码"味道对了"（逻辑清晰、命名规范、没有明显 Bug），你会感觉很顺畅，继续推进。
    
-   当代码"味道不对"（逻辑混乱、命名随意、有明显漏洞），你会立刻察觉，让 AI 重写。
    

这种"直觉"来自你的编程经验。你不需要逐行分析代码，只需要扫一眼，就能判断"这段代码靠谱吗"。

这就是为什么 **Vibe Coding 不是"零基础也能编程"，而是"有经验的程序员效率翻倍**"。

## 二、AI 为什么会犯错？

很多人用 AI 写代码时，会遇到这些问题：

-   AI 生成的代码跑不通（语法错误、API 调用错误）
    
-   AI 重复造轮子（明明项目里有现成的函数，它又写了一个）
    
-   AI 越改越乱（改了 A 文件，B 文件的逻辑就乱了）
    

这不是因为 AI 笨，而是因为它"没看到"。

**AI 写出 Bug，通常不是因为通过不了图灵测试，而是因为通过不了视力测试——它"看不见"你的项目全貌，自然只能盲人摸象。**

具体来说，AI 犯错本质上是**三个层次的视力问题**：

1.  **模型---相当于视力**：不同的 AI 模型，编程能力差异巨大。Claude 4.5 Sonnet 是"鹰眼"，GPT-5.0 是"近视眼"。如果你用的是小模型，AI 犯错是正常的——它的能力本来就不够。
    
2.  **IDE ---相当于眼镜**：传统的 IDE（如 VS Code）+ DeepSeek/豆包 的组合，就像戴着度数不对的眼镜——AI 看不到你的项目结构。你在 ChatGPT 里问："帮我写一个获取用户信息的函数。"AI 会生成一个全新的函数，但它不知道你的项目里已经有一个 \`getUserInfo\` 了。这就是为什么需要 **AI Native IDE**（如 Cursor、Windsurf）——它们能让 AI "看到"你的整个项目。
    
3.  **上下文---光线够不够亮**：即使你用的是 Claude 4.5 Sonnet + Cursor，AI 也可能犯错，因为**你没有给它足够的上下文**。就像在黑暗中看东西，再好的眼睛也看不清。你让 AI 写一个"支付功能"，但你没有告诉它：你的后端 API 是什么格式？你的前端用的是什么框架？你的错误处理机制是什么？AI 只能尽量去摸索去"猜"，猜错了就翻车。
    

接下来我们来看看这三个问题分别怎么解决。

## 三、选对模型与 IDE

在讲方法论之前，我们先解决两个问题：**用哪个 AI 模型？用什么 IDE？**

## 3.1 模型选择：三个核心模型就够了

根据 [OpenRouter 统计的数据](https://openrouter.ai/state-of-ai)，不同模型在编程类别的份额占比如下图所示：

![](https://static.xiaobot.net/file/2025-12-15/21332/81b2887731e4a27abc82d2df78dcbf9e.png!post)

可以看到：

-   Anthropic Claude/Opus 稳定占比超 60%（也是我体感下来最好用的）
    
-   Google 的 Gemini 排第二，在 15% 左右（Gemini 3 的 UI 审美很好）
    
-   OpenAI 的 GPT 约 8%，第三
    
-   x-ai 的 Grok Code 排第四，
    
-   国内模型：
    
    -   MiniMax 最近也上榜了
        
    -   DeepSeek 在编程方面用的不多
        
    -   Qwen 波动比较大
        

那这些模型的价格呢？

![](https://static.xiaobot.net/file/2025-12-15/21332/be2e597bbf8ac3039c5573e1b9015f46.png!post)

上图横轴是价格（每百万 token 的价格），竖轴是使用程度。

可以看到：

-   GPT-5 （右下角象限）是最贵的，它的使用率比较低
    
-   Gemini 2.5 Flash 是性价比最高的（左上角象限）
    
-   Claude Sonnet 4 和 Gemini 3（上图没有）价格差不多贵，但使用率高证明了它的能力
    
-   DeepSeek V3 适合追求性价比的任务
    

所以综合来看，选这三个模型准没错：

![](https://static.xiaobot.net/file/2025-12-15/21332/c1415397f700cdac6655466ca62ddabe.png!post)

**我的实际使用策略：**

-   60% 的时间用 Claude 3.5 Sonnet（主力）
    
-   25% 的时间用 DeepSeek V3（省钱）
    
-   15% 的时间用 Gemini 3.0 Pro（还原 UI）
    

确定了适合编程的模型后，接下来就是使用合适的 AI IDE。

## 3.2 IDE 选择：推荐 Cursor

目前主流的 AI 编程工具分为 3 类：

**1.全栈协作流（AI Native IDEs）：**

-   **Cursor**（王者）：多文件编辑 + .cursorrules 项目级配置
    
-   **Windsurf**（竞品）：Cascade 级联模式，强调深度理解
    
-   **Antigravity**（新起之秀）：Google 收购 Windsurf 后开发的新产品
    
-   **TRAE**（国产）：字节出品，更便宜，中文支持好
    

**2.命令行工具：**

-   [Claude Code](https://claude.com/product/claude-code)（Authropic）：代码生成能力强，适合开发复杂业务，但容易封号
    
-   [Gemini CLI](https://geminicli.com/) (Google）：支持较长的对话历史和多模态，我一般用来写脚本
    
-   [Codex](https://openai.com/zh-Hans-CN/codex/)（OpenAI）：响应快，适合快速开发简单项目
    

**3.从 0 到 1 生成流（网页应用）**：

-   [v0（Vercel）](https://v0.app/)：专精前端 UI，生成 React 组件极其漂亮
    
    ![](https://static.xiaobot.net/file/2025-12-17/21332/85d5c3994a3de23ef5720b59026f5d31.png!post)
-   [bolt.new](https://bolt.new/)（StackBlitz）：全栈应用，浏览器里直接跑 Node.js
    
    ![](https://static.xiaobot.net/file/2025-12-17/21332/2aeb6e2b98d0216c92519dbdfdd4212e.png!post)
-   [Lovable](https://lovable.dev/)：视觉化编辑，适合非技术背景创始人
    
    ![](https://static.xiaobot.net/file/2025-12-17/21332/1603f2a80ab75b83d99be64677c564c8.png!post)

**为什么建议使用 IDE？**

网页版生成器适合让你做出惊艳的 Demo，命令行工具有点太极客， AI Native IDE 介于两者之间，既好用、又能做复杂项目，是能让你保住饭碗、交付生产级代码的真正武器。

> 有点类似 Windows、Linux 和 Mac 的关系，AI Native IDE 就是 Mac。

而 AI IDE 中，我个人体验下来，Cursor 最好用，它的核心优势：

1.  Agent 模式：上下文提供够的情况下，准确率比较高
    
2.  支持多种规则文件：用户规则、项目级指令配置，一次性配置好永久有效
    
3.  社区活跃：有大量最佳实践和插件
    

> Cursor 月卡最低 20$，如果觉得贵，可以考虑去咸鱼看看，一个月六七十的基本够用。

我们这个专栏聚焦于 **IDE 流（以 Cursor 为例）**，因为这是工程师的吃饭家伙。

接下来，我们以 Cursor 为例，讲解如何高效使用 AI 编程，配置的方式可能不同 IDE 略有区别，但核心思想是统一的。

## 四、高效心法：SSP 工作流

为了方便记忆，我将这个高效使用 AI IDE 的技巧总结为 **Spec-Skills-Plan** 三步法，简称 SSP。它是这篇文章最核心的方法论，可以一定程度上帮助你解决"AI 写代码准确率低"的问题。

**SSP 工作流是什么：**

-   Spec（立规矩）：项目级系统指令
    
-   Skills（给资料、能力）：上下文工程
    
-   Plan（定计划）：伪代码驱动开发
    

**用 AI 开发时，不要把 AI 当成许愿池，而要把它当成一个刚毕业的高材生：先给员工手册（Spec），再给参考资料（Skills），最后给执行计划（Plan），这样它不仅能把活干完，还能把活干好。**

## 4.1 Step 1: SPEC（立规矩）

Spec 指的是提供项目级规则（或者叫指令）。

当没有提供规则的时候，AI 随机性很强，每次输出的内容风格、技术栈可能都不一样。

比如：

-   你的项目用 Tailwind CSS，它给你写内联样式
    
-   前面写好的函数，后面又写一个类似的
    

每次都要手动纠正，效率极低。

### 解决方案

一个比较好的方式是配置 **.cursorrules**。

根据 Cursor 官方文档，规则文件应使用 **MDC 格式**（Markdown with Cursor），文件扩展名为 .mdc，存放在 .cursor/rules/目录下，这些规则会被加到提示词的开头，影响 AI 处理代码时的行为。

![](https://static.xiaobot.net/file/2025-12-15/21332/60bb9438e4ad9f3fda5b28120dc6e5b5.png!post)

> 上图中的 tts.mdc 就是这个项目的规则文件，作用是告诉 AI 输出的时候输出完整代码、并且修改后自动 review。

Cursor 支持这四种类型的规则：

![](https://static.xiaobot.net/file/2025-12-15/21332/36292b8cc069a153dbcfd6b6ceb8c547.png!post)

添加项目规则和用户规则可以通过 Cursor Settings -> Rules 中进行：

![](https://static.xiaobot.net/file/2025-12-15/21332/2afde2d52e36e8575834ae390c1eafd3.png!post)

团队规则由管理员在 Cursor 后台创建，创建后自动应用于所有团队成员：

![](https://static.xiaobot.net/file/2025-12-15/21332/d3287300d9bd67224ab5790a67591514.png!post)

AGENTS.md 是 Cursor 最新的规则配置方式，适用于简单直接的规则。配置很简单，创建一个定义了 agent 指令的 markdown 文件，放在项目根目录即可，比如：

```none
# Project Instructions
## Code Style
- Use TypeScript for all new files
- Prefer functional components in React
- Use snake_case for database columns
## Architecture
- Follow the repository pattern
- Keep business logic in service layers
```

### 三个黄金模板

介绍完 Cursor 中如何配置规则，也就是我们 SSP 中的 Spec 后，接下来给大家提供一些通用的规则模版，可以直接用在你的项目上，包括三种：

1.  项目结构规范（这个必不可少）
    
2.  代码风格规范
    
3.  功能实现规范
    

**项目结构规范**

项目结构规范用于**统一代码结构，方便后期业务复杂后 AI 快速定位和人工熟悉逻辑**。

一般是根据自己的项目初期创建好目录结构，让 AI 生成一份规范文档。

比如我们上一讲的 [Next.js 全栈项目--- AI 拆解待做事项](https://github.com/shixinzhang/AI-TODO) 项目结构：

```none
to-do-list/
├── pages/                    # Next.js 页面和 API 路由
│   ├── _app.tsx             # 应用入口，全局样式引入
│   ├── index.tsx             # 前端首页（待办事项列表页面）
│   └── api/                  # API 路由目录
│       └── tasks/            # 任务相关 API
│           ├── index.ts      # GET/POST /api/tasks
│           ├── [id].ts       # PATCH/DELETE /api/tasks/[id]
│           └── breakdown.ts  # POST /api/tasks/breakdown
│
├── lib/                      # 工具库和配置
│   ├── config.ts            # 环境变量配置（API_BASE_URL, APP_ID, DeepSeek 配置）
│   └── supabase.ts          # Supabase 客户端初始化
│
├── types/                    # TypeScript 类型定义
│   └── task.ts              # 任务相关的类型定义
│
├── styles/                   # 全局样式
│   └── globals.css          # Tailwind CSS 和自定义样式
│
├── node_modules/            # 依赖包（自动生成）
│
├── .next/                    # Next.js 构建输出（自动生成，已忽略）
│
├── package.json             # 项目配置和依赖
├── package-lock.json        # 依赖锁定文件
├── tsconfig.json            # TypeScript 配置
├── next.config.js           # Next.js 配置
├── tailwind.config.cjs      # Tailwind CSS 配置
├── postcss.config.cjs       # PostCSS 配置
│
├── supabase-schema.sql      # 数据库表结构 SQL
├── env.example              # 环境变量示例文件
│
├── API_DOCUMENTATION.md     # API 接口文档
├── SETUP.md                 # 项目设置指南
├── PROJECT_STRUCTURE.md     # 本文件：项目结构文档
│
└── test-*.sh                 # 测试脚本
```

**如果你的项目大部分时候都是 AI 生成，一定要生成项目规范，可以显著减少后期 AI 乱放代码、改错代码的问题。**

**代码风格规范**

团队协作时，统一的代码风格、代码依赖方式很重要，可以避免因为格式化导致 git 记录污染等细节问题。

```none
---
description: "项目代码风格规范"
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: true
---
# 代码风格规范
## 缩进与格式
- 使用 2 个空格缩进，禁止使用制表符
- 单行最大长度 120 字符
- 语句末尾必须加分号
- 使用单引号包裹字符串
## 命名约定
- 变量和函数：camelCase（如 `userName`、`fetchData`）
- 组件和类：PascalCase（如 `UserProfile`、`DataService`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 接口和类型：PascalCase（如 `UserData`、`ButtonProps`）
## TypeScript 规范
- 启用严格模式（`strict: true`）
- 禁止使用 `any` 类型
- 所有函数参数和返回值必须显式声明类型
- 使用 `interface` 定义对象类型
## 导入规范
- 导入语句按类型分组排序：第三方库 → 项目内部模块 → 相对路径
- 按需导入，避免导入未使用的模块
- 使用路径别名（如 `@/components/Button`）
## 注释规范
- 公共 API 必须添加 JSDoc 注释
- 复杂逻辑需添加行内说明
- 使用 `TODO`、`FIXME` 标记待处理项
```

**功能实现规范**

功能实现规范可以放置**长期迭代比较重要的规则，比如项目架构、组件规范、API 调用规范、日志规范等等，用于统一架构、优化性能、方便排查问题。**

```none
---
description: "功能实现规范"
globs: ["**/*.ts", "**/*.tsx"]
alwaysApply: true
---
# 功能实现规范
## React 组件规范
- 使用函数组件 + Hooks，禁止使用类组件
- Props 必须定义接口类型
- 复杂计算使用 `useMemo`/`useCallback` 优化性能
- 使用自定义 Hook 提取可复用逻辑
## 状态管理
- 组件内部状态：`useState`
- 跨组件状态：`useContext` 或状态管理库
- 避免在组件中直接修改 props
## API 调用规范
- 异步操作必须添加错误处理（`try/catch` 或 `.catch()`）
- 使用统一的请求工具函数（如 `@/utils/request`）
- 响应数据必须使用类型包装器
- 禁止在组件中直接调用第三方 API 库
## 错误处理
- 所有异步操作必须捕获错误
- 使用错误边界包装页面组件
- 禁止吞掉异常，必须记录或抛出
## 性能优化
- 大列表使用虚拟化技术
- 图片使用懒加载
- 避免在渲染函数中进行复杂计算
- 使用 `React.memo` 包装纯展示组件
## 测试规范
- 关键功能必须有单元测试
- 测试文件命名：`{{ComponentName}}.test.tsx`
- 使用 `describe` + `it` 结构组织测试用例
- 测试覆盖率不低于 80%
## 代码质量
- 禁止使用 `console.log` 生产环境
- 避免魔法数字，使用常量定义
- 函数长度不超过 50 行
- 文件大小不超过 500 行
```

功能实现规范里如果不知道写什么，可以去搜用到技术栈的官方、社区最佳实践，比如 “React 最佳实践”。

写到这里，我想起工作三四年的时候，我总是看不惯别人的代码，在团队里做过好几次代码风格、最佳实践的分享，自己讲的很嗨，但别人还是我行我素，想要改变人的习惯太难了。

现在好了，AI 听话，有了这些规范等于深入的团队宣讲，只不过听众是 AI。

## 4.2 Step 2: SKILLS（给资料给能力）

Skills 就是提供更多的资料和能力。

> 这里的 Skills 不同于 Claude Code Skills（https://github.com/anthropics/skills），更多是指一种思想， Claude Code Skills 是一种具体的实现，共同点是通过提供丰富的文档、上下文，指导 AI 做更精确的事。

### 4.2.1 代码索引

在 Cursor 中，最重要的资料就是项目初始化时的 Codebase indexing（代码索引），这个就是为了理解代码之间的关系，等待进度走到 100% 再对话效率更高。

![](https://static.xiaobot.net/file/2025-12-14/21332/520add0d10ce50c1900087cd3c786050.png!post)

打开项目后，Cursor 将自动开始将你的项目代码转换为可搜索的向量，具体会通过 7 个步骤进行：

![](https://static.xiaobot.net/file/2025-12-15/21332/7ed85acfe934a1b3b2d1711538995907.png!post)

1.  你的工作区文件会与 Cursor 的服务器安全同步，确保索引始终最新
    
2.  文件被拆分为有意义的片段，聚焦函数、类和逻辑代码块，而非任意文本段
    
3.  每个片段使用 AI 模型转为向量表示，生成能捕捉语义的特征
    
4.  这些向量存储在专用的向量数据库中，支持在数百万代码片段中进行高速相似度搜索
    
5.  当你搜索时，查询会用与处理代码相同的 AI 模型转为向量
    
6.  系统将你的查询向量与已存储的嵌入向量进行比对，找到最相似的代码片段
    
7.  然后你会获得包含文件位置和上下文的相关代码片段，并按与查询的语义相似度排序
    

### 4.2.2 内部文档

我们项目里经常会使用一些内部的 SDK，Cursor 对它们不了解，因此无法知道 SDK 的功能、函数，这时就需要通过文档的方式告诉 Cusor。

我们可以手动在 Cursor 上添加自己内部知识库信息，添加方式是：Settings -> Indexing & Docs -> Add Docs :

![](https://static.xiaobot.net/file/2025-12-14/21332/9b7380de54458df604ef7d752e5d68b7.png!post)

点击上图右下角的 Add Doc 后，会弹出输入框，输入我们的文档地址：

![](https://static.xiaobot.net/file/2025-12-14/21332/8a590637118c1474c005d52b522f7329.png!post)

添加完 doc 左侧会有状态，表示是否添加成功，变成绿色后表示索引完成：

![](https://static.xiaobot.net/file/2025-12-14/21332/254210f9f8bc92313ab0769edb575104.png!post)

这时点击右侧的「书籍」图标，可以看到它索引到的文档：

![](https://static.xiaobot.net/file/2025-12-14/21332/587b1a9e1bbbd54dd4f14b72328c2529.png!post)

后面再调用内部的 SDK 时，就可以通过 @Docs 的方式提供文档给 AI，增加 AI 的上下文信息：

![](https://static.xiaobot.net/file/2025-12-16/21332/4fab1086657b25262a432052cb51aeb0.png!post)

### **4.2.3 Reference（照猫画虎）**

当你要写一个新功能时，如果已经有类似的，可以找一个"相似的文件"，让 AI 模仿。

比如说：

-   你要写一个新的 API 接口，但不记得格式
    
-   你要写一个新的组件，但不记得项目的组件规范
    

这时可以：

1.  找到一个相似的文件（如 \`src/app/api/users/route.ts\`）
    
2.  在 Cursor 的 Chat 里输入：\`@Files src/app/api/users/route.ts 参考这个文件，帮我写一个 /api/posts 的路由\`
    

这样 AI 会模仿这个文件的风格、结构、错误处理方式，生成的代码和借鉴文件的风格高度一致。

### **4.2.4 几个超好用的 MCP**

了解了代码索引、文档和引用以后，接下来介绍几个非常实用的 MCP，可以很好地提升开发体验。

> MCP 后面会有一篇详细介绍，这里你只需要知道它是一种插件，可以增强 AI IDE 的能力即可。

首先要介绍的是 [Supabase MCP（https://github.com/supabase-community/supabase-mcp）](https://github.com/supabase-community/supabase-mcp)。

上一篇我们介绍了如何使用 supabase 的数据库，是通过手动去后台进行操作。

有了这个 MCP，就可以让 AI 直接操作 supabase 数据库，通过自然语言管理数据库结构、执行SQL查询、创建表等操作。

最常用的是**根据业务功能直接确定表字段并创建表、修改表**，省的我们再去网页后台操作。

要使用这个 MCP，首先需要登录 Supabase 控制台（[https://supabase.com/dashboard](https://supabase.com/dashboard)）创建一个 access token，顺序如图所示：

![](https://static.xiaobot.net/file/2025-12-16/21332/971edd25480c6f23dd007934afa1f0b7.png!post)

创建以后，打开 Cursor Settings -> Tools&MCP -> 点击「New MCP Server」，会自动打开一个 mcp.json 文件：

![](https://static.xiaobot.net/file/2025-12-16/21332/036e560949ab2378fb43c68a02c11ae6.png!post)

这个文件就是 MCP Server 的定义文件。

我们复制 supabase 的代码到这个文件里：

```none
{
    "supabase": {
        "command": "/opt/homebrew/bin/npx",
        "args": [
            "-y",
            "@supabase/mcp-server-supabase@latest",
            "--access-token",
            "换成你自己的"
        ],
        "env": {
            "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        }
    }
}
```

> 对应的代码在 [https://github.com/supabase-community/supabase-mcp](https://github.com/supabase-community/supabase-mcp) 中可以找到
> 
> 我们的 AI-TODO 里也有备份：[https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC3%E8%AE%B2.md](https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC3%E8%AE%B2.md)

复制进去后，重启 Cursor，再打开设置的 MCP 这里，看到小绿点，就说明加载成功了：

![](https://static.xiaobot.net/file/2025-12-16/21332/1281a75014e8066b00b6a80fe9d5064f.png!post)

> search\_docs 等名称，就是这个 MCP 内部的函数，通过名称可以知道它的功能。
> 
> 如果显示红色，点击 Error 后复制错误给 AI，它会进行修复。

加载成功后，提示词里带上“supabase mcp”，就可以让 AI 直接操作数据库了，比如：

```none
提示词：使用 supabase mcp 查看下我的 todo-list 项目有哪些 table
提示词：使用 supabase mcp 新建一个 test 表，字段为 id 和 key
```

接下来介绍一个浏览器操作助手 [Playwright MCP](https://github.com/microsoft/playwright-mcp?tab=readme-ov-file)

**它的核心功能**：让AI能够像人类一样操作浏览器，实现自动化测试、网页数据抓取、表单填写等任务。通过自然语言指令，AI可以自动打开网页、点击按钮、输入文本、截图等操作，无需手动编写复杂的测试脚本。

最常用的就是 **AI 写完 UI 后，让它自己看有没有问题，省的我们截图**，还有自动化测试。

![](https://static.xiaobot.net/file/2025-12-16/21332/91f18fecbd3493825870e25feec6afe3.png!post)

它的 MCP 代码：

```none
{
    "Playwright": {
        "command": "/opt/homebrew/bin/node",
        "args": [
            "/opt/homebrew/lib/node_modules/@playwright/mcp/cli.js"
        ],
        "env": {
        }
    }
}
```

添加后一样的方式确认是否成功：

![](https://static.xiaobot.net/file/2025-12-16/21332/0d584a80cdb107ce86b4b007c97d0d53.png!post)

成功后可以看到具体的能力：

![](https://static.xiaobot.net/file/2025-12-16/21332/679c64a96257ceed7104a9767bda8fc3.png!post)

然后就可以让 AI 去模拟人使用浏览器了，比如让 AI 去启动我们上一节的 TODO 应用，然后测试一下输入和拆解功能：

```
提示词：启动项目，使用 Playwright MCP 添加一个“撰写第四讲”的待办事项并进行拆解，完成后截图
```

![](https://static.xiaobot.net/file/2025-12-16/21332/c31dd8b33bdc7e414f754fce497f8f67.png!post)

从日志里看它先后调用了 等待页面加载、浏览器的点击（多次），等待执行结束后刷新页面，果然出现了让它新增的数据和拆解数据：

![](https://static.xiaobot.net/file/2025-12-16/21332/49f3216bc9b7385b68db63a3776ba2eb.png!post)

Playwright MCP 是个非常强大的插件，可以用来做这些事情：

-   **自动化测试**：浏览器上自动测试待办事项的增删改查
    
-   **UI 验证**：检查页面元素是否正确渲染
    
-   **性能监控**：监控网络请求和控制台错误
    
-   **截图记录**：为功能文档生成页面截图
    
-   **数据抓取**：如果需要从其他网站抓取数据
    

第三个 MCP 是 [Github MCP](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-cursor.md)。

它的作用是让 AI 可以直接与 GitHub 交互，完成读取代码库、管理Issue、处理PR、分析代码等操作，通过自然语言即可完成代码仓库的创建、代码提交、分支管理等操作。

![](https://static.xiaobot.net/file/2025-12-16/21332/7d3d6e25b5893e4d672e9dff9c837350.png!post)

对于自己的项目非常方便，写完直接和 AI 说一下“提交到 master 分支”就好了。

使用它需要先去 [Github 设置](https://github.com/settings/personal-access-tokens/new) 里新建一个 token:

![](https://static.xiaobot.net/file/2025-12-17/21332/675c7c7477f72e600daf27d719f1bf01.png!post)

把新建的 token 粘贴到下面的代码里，然后添加到 Cursor 里重启即可：

```none
    "github": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer 你的 token"
      }
    }
```

最后一个要介绍的 MCP 是 [context7](https://context7.com/dashboard) 。

它的作用是可以实时检索开源库的最新文档，解决 AI 因训练数据过时而产生的"幻觉"问题。能够区分不同版本（如Next.js 15与13），确保生成的代码准确无误。

使用它也要先去申请一个 key: [https://context7.com/dashboard](https://context7.com/dashboard)

![](https://static.xiaobot.net/file/2025-12-16/21332/69ddb2c09a71f1275f08b1a5ce4e09b8.png!post)

申请后复制到代码中，然后添加到 Cursor：

```none
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "xxx"
      }
    }
```

![](https://static.xiaobot.net/file/2025-12-16/21332/ff32dafc0cd86b20c91332dbbc2dfc4f.png!post)

## 4.3 Step 3: PLAN（定计划）

以上是 SSP 的 Skill 部分，接下来介绍最后一步：Plan。

Plan 就是计划，这一步解决的是：**要做的任务太复杂时，AI 写到一半就乱了。**

比如：

-   你让 AI 写一个"用户管理系统"，它写了 500 行代码，但逻辑混乱
    
-   你让 AI 重构一个文件，它改了 A 逻辑，B 逻辑就乱了
    

**Plan 的策略是：开始做复杂任务之前，先确定技术方案，让 AI 执行的时候按照计划行进。**

具体来说，就是粗略的想法先用其他对话式 AI 生成设计文档、产品方案，以 markdown 文件的形式保存到项目里，然后 @File 的方式告诉 AI 按照 xxx 计划进行执行。

![](https://static.xiaobot.net/file/2025-12-15/21332/ad305908543f0fd87be3d554ab068083.png!post)

上图是 Antigravity 在收到任务后会生成的 「实现计划」文档，我们在生成计划文档时可以参考，计划文档要包含这几项：

1.  目标描述
    
2.  任务拆分
    
3.  具体修改处
    

如果要执行的任务比较复杂，提供了计划还可能出错，就切换到 Cursor 的 Plan 模式，让 AI 先输出计划，确认后再执行：

![](https://static.xiaobot.net/file/2025-12-15/21332/68169e09017d0dd5479d0c8aeffa2ed4.png!post)

切换到这个模式后，在收到指令后，AI 会输出一份详尽的文档：

![](https://static.xiaobot.net/file/2025-12-15/21332/45853a1253e4fe7e400fbedd375e243c.png!post)

同时会列出要做的事（右侧框住的 3 To-dos），我们可以查看方案后，觉得没有问题了再点击右下角的 Build 按钮触发执行。

![](https://static.xiaobot.net/file/2025-12-15/21332/cb0703fb37fcfc7617e01c0517f49fdb.png!post)

等任务完成后，To-dos 的状态会变为上图所示的完成。

![](https://static.xiaobot.net/file/2025-12-15/21332/90ded678dcf6cac47a6fcf101038079b.png!post)

等完成后，我们可以点击「Review」查看修改内容。

**记住，复杂的修改一定要 review，否则很不安全。**

## 五、像产品经理和架构师一样使用 AI

很多人的 Prompt 还是"程序员思维"——"帮我写一个 for 循环"。这是把 AI 当键盘用。

AI 已经做了程序员做的事，我们要升级思维模型，做“指挥家”该做的事：

-   像 PM 一样定义需求（用户故事、验收标准、边界情况）
    
-   像架构师一样约束边界（数据流向、技术栈、错误处理）
    

## 5.1 PM 思维：定义 What & Why

**有时候我们的提示词太过模糊，比如：**"帮我写一个博客发布功能"，没有说功能、没有说格式，AI 只能自由发挥。

**正确的方式是像产品写文档一样详细：**

```none
实现博客发布功能：
1. 用户输入标题、正文、标签
2. 支持 Markdown 格式
3. 发布前需要预览
4. 发布成功后跳转到文章详情页
5. 如果标题为空，显示错误提示
6. 需要包含 Loading 状态"
```

核心区别在于，产品文档包括这些：

-   用户故事（User Story）：描述用户的行为和期望结果
    
-   验收标准（Acceptance Criteria）：最终要实现的所有功能
    
-   边界情况（Edge Cases）：异常情况如何处理
    

写的如此完善后，AI 才会生成包含所有边界情况的代码，也就不再需要反复补充需求。

## 5.2 架构师思维：定义 How & Constraints

除了功能上要描述清楚，复杂的项目还要把技术方案也说详细，比如：

```none
"基于 FastAPI，使用 Pydantic 做数据验证，数据库用 SQLite，所有 API 必须包含 Try-Catch 并返回标准 JSON 格式：
{
"success": true/false,
"data": {},
"error": ""
}"
```

一般要包括：

-   数据流向：数据是否持久化，存储方式
    
-   技术栈约束：是否有偏好的技术框架
    
-   错误处理机制：最核心的一点，定义好规范
    

## 六、结语：

今天我们介绍了适合编程的模型、工具、 SSP 心法和怎么提需求。

希望你可以明白，**真正高效的 Vibe Coding，需要你像 PM（产品经理）和架构师一样思考，像鲁班一样用好工具。**

**代码实现的边际成本正在归零。未来工程师的区别，不在于谁敲代码更快，而在于谁能用"产品经理的语言"定义需求，用"架构师的语言"约束边界。**

建议你现在就试试：

1.  花 5 分钟配置 .cursorrules：把你的项目规范写进去，让 AI "记住"。
    
2.  为内部的 SDK 创建 Docs，下次就可以让 AI 直接调用内部代码
    
3.  添加文中的 MCP：感受一下插上翅膀后的 AI IDE 能力
    

好了，以上就是这篇文章的主要内容，觉得有帮助欢迎留言、点「有启发」，我们下一讲再见。

> 由于平台不支持复制代码，文中的项目规范、MCP 代码上传在这里：[https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC3%E8%AE%B2.md](https://github.com/shixinzhang/AI-TODO/blob/main/prompts/%E7%AC%AC3%E8%AE%B2.md)

> 本专栏已开启「合伙人计划」，读者可生成专属的邀请链接或邀请海报。
> 
> 有人通过你的邀请链接或海报付费订阅时，会返现支付金额的 25% 给你，比如支付 298 元 会返现 74.5 元，快去分享给你的好朋友们吧！

转型 AI 工程师：重塑你的能力栈与思维

56 读者， 14 内容

![](https://xiaobot.net/img/icon_arrow_right_light.svg)