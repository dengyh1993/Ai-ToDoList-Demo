# AI 待办事项应用

一个集成 AI 智能拆解、提示词优化和流式聊天功能的现代化待办事项管理应用。

## 功能特性

### 待办事项管理
- ✅ 添加、完成、删除任务
- ✅ 任务编辑（双击编辑）
- ✅ AI 智能拆解：输入宽泛任务，自动生成子任务
- ✅ 父子任务关联显示
- ✅ 子任务完成进度追踪
- ✅ 任务优先级设置（高/中/低）
- ✅ 任务截止日期设置
- ✅ 日期筛选（今天/本周/本月/全部/自定义）
- ✅ 美观的渐变 UI 设计

### AI 助手功能
- ✅ **流式 AI 聊天**：与 AI 进行实时对话，支持流式输出和成本计算
- ✅ **提示词优化**：输入模糊需求，AI 自动优化为结构化的高质量提示词
- ✅ **智能任务拆解**：AI 将宽泛任务拆解为 3-5 个具体可执行的子任务

### 用户体验
- ✅ 用户认证（Supabase Auth）
- ✅ 响应式设计
- ✅ 加载动画和等待状态
- ✅ 聊天历史本地存储（按用户隔离）

## 技术栈

- **前端**: React + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI 服务**:
  - DeepSeek（任务拆解、提示词优化）
  - 智谱 BigModel（流式聊天）

## 快速开始

### 1. 安装依赖

```bash
cd todo-ai
npm install
```

### 2. 配置环境变量

编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# DeepSeek API 配置
DEEPSEEK_API_KEY=your-deepseek-api-key

# 智谱 BigModel API 配置
BIGMODEL_API_KEY=your-bigmodel-api-key
```

### 3. 配置数据库

1. 访问 [Supabase](https://supabase.com) 创建一个新项目
2. 在 SQL Editor 中运行 `supabase-schema.sql` 文件中的 SQL
3. 在项目设置中获取 `URL` 和 `anon key`

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 使用方法

### 待办事项 Tab
- **普通模式**：直接输入任务，点击"添加任务"即可
- **AI 拆解模式**：输入宽泛任务，点击"智能拆解"，AI 自动生成子任务
- **任务管理**：支持优先级设置、截止日期、编辑和删除
- **日期筛选**：支持按今天、本周、本月、自定义日期范围筛选

### 提示词生成 Tab
1. 输入你的需求（如："写一个 Python 脚本..."）
2. 点击"优化提示词"
3. AI 会流式输出优化后的高质量提示词
4. 点击"复制"按钮将结果复制到剪贴板

### 流式 AI Tab
1. 输入问题并发送
2. AI 会实时流式输出回复内容
3. 显示输入/输出的 token 数和成本信息
4. 聊天历史自动保存到浏览器本地存储

## 项目结构

```
todo-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── todos/
│   │   │   │   ├── route.ts          # GET/POST 待办事项
│   │   │   │   └── [id]/route.ts     # GET/PATCH/DELETE 单个待办
│   │   │   └── ai/
│   │   │       ├── decompose/route.ts     # AI 拆解 API
│   │   │       ├── prompt-enhance/route.ts # 提示词优化 API
│   │   │       └── chat/route.ts          # 流式聊天 API
│   │   ├── components/
│   │   │   ├── UserMenu.tsx        # 用户菜单组件
│   │   │   └── DateFilter.tsx       # 日期筛选组件
│   │   ├── page.tsx                   # 主页面（三 Tab）
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── lib/
│   │   ├── supabase.ts               # Supabase 客户端
│   │   ├── openai.ts                 # OpenAI/DeepSeek 客户端
│   │   └── token.ts                 # Token 计算工具
│   └── types/                       # 类型定义
├── .env.local                        # 环境变量
├── supabase-schema.sql               # 数据库 Schema
└── package.json
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todos | 获取所有待办事项（支持日期筛选） |
| POST | /api/todos | 创建新待办事项 |
| GET | /api/todos/:id | 获取单个待办事项详情 |
| PATCH | /api/todos/:id | 更新待办事项 |
| DELETE | /api/todos/:id | 删除待办事项（级联删除子任务） |
| POST | /api/ai/decompose | AI 拆解任务 |
| POST | /api/ai/prompt-enhance | AI 优化提示词（流式） |
| POST | /api/ai/chat | 流式 AI 聊天 |

## AI 模型配置

### DeepSeek（任务拆解、提示词优化）
- **提供商**: DeepSeek
- **模型**: deepseek-chat
- **特性**: 高性价比，适合文本任务

### 智谱 BigModel（流式聊天）
- **提供商**: 智谱 AI
- **模型**: glm-4.7
- **特性**: 流式输出、成本计算
- **定价**: 输入 ¥2/百万 tokens，输出 ¥8/百万 tokens

## 许可证

MIT
