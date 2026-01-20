# AI 待办事项应用

一个带有 AI 智能拆解功能的待办事项应用，可以将宽泛的任务自动拆解成 3-5 个可执行的小步骤。

## 功能特性

- ✅ 添加、完成、删除任务
- ✅ AI 智能拆解：输入宽泛任务，自动生成子任务
- ✅ 父子任务关联显示
- ✅ 子任务完成进度追踪
- ✅ 美观的渐变 UI 设计

## 技术栈

- **前端**: React + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **AI**: 小米 MiMo (通过 OpenRouter)

## 快速开始

### 1. 安装依赖

```bash
cd todo-ai
npm install
```

### 2. 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 创建一个新项目
2. 在 SQL Editor 中运行 `supabase-schema.sql` 文件中的 SQL
3. 在项目设置中获取 `URL` 和 `anon key`

### 3. 配置环境变量

编辑 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# 小米 API 配置 (通过 OpenRouter)
XIAOMI_API_KEY=your-openrouter-api-key
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 使用方法

### 普通模式
直接输入任务，点击"添加任务"即可。

### AI 拆解模式
1. 点击左下角的"AI 拆解模式"按钮激活
2. 输入一个宽泛的任务，例如：
   - "准备下周的产品发布"
   - "学习 React"
   - "组织团队建设活动"
3. 点击"智能拆解"，AI 会自动生成 3-5 个具体可执行的子任务

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
│   │   │       └── decompose/route.ts # AI 拆解 API
│   │   ├── page.tsx                   # 主页面
│   │   └── layout.tsx
│   └── lib/
│       ├── supabase.ts               # Supabase 客户端
│       └── openai.ts                 # OpenAI 配置
├── .env.local                        # 环境变量
├── supabase-schema.sql               # 数据库 Schema
└── package.json
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todos | 获取所有待办事项 |
| POST | /api/todos | 创建新待办事项 |
| GET | /api/todos/:id | 获取单个待办事项 |
| PATCH | /api/todos/:id | 更新待办事项 |
| DELETE | /api/todos/:id | 删除待办事项 |
| POST | /api/ai/decompose | AI 拆解任务 |

## 许可证

MIT
