# AI 待办事项应用 - 项目概览

## 📋 项目简介

这是一个集成 AI 智能功能的现代化待办事项管理应用。用户可以：
- 使用 AI 智能拆解宽泛任务为具体可执行的子任务
- 通过流式 AI 聊天与 AI 进行实时对话
- 使用 AI 优化模糊需求为高质量的提示词
- 管理待办事项的优先级、截止日期等

## 🎯 核心功能

### 基础待办管理
- ✅ 添加、编辑、删除任务
- ✅ 任务完成状态切换
- ✅ 任务进度追踪
- ✅ 美观的响应式 UI 设计
- ✅ 任务优先级设置（高/中/低）
- ✅ 任务截止日期设置
- ✅ 日期筛选（今天/本周/本月/全部/自定义）

### AI 智能拆解
- 🤖 **智能任务拆解**：输入宽泛任务，AI 自动生成 3-5 个具体可执行的子任务
- 🔗 **父子任务关联**：支持主任务与子任务的层级关系
- 📊 **进度可视化**：显示子任务完成进度（如：3/5 个子任务已完成）
- 🔄 **模式切换**：支持普通模式和 AI 拆解模式的一键切换

### 流式 AI 聊天
- 💬 **实时对话**：与 AI 进行实时聊天交流
- 📡 **流式输出**：逐字显示 AI 回复内容
- 💰 **成本计算**：实时显示输入/输出 token 数和成本
- 💾 **历史存储**：聊天历史自动保存到本地存储（按用户隔离）
- ⏳ **等待动画**：响应前显示跳动圆点加载动画

### 提示词优化
- ✨ **智能优化**：输入模糊需求，AI 优化为结构化提示词
- 📡 **流式输出**：实时显示优化过程
- 📋 **一键复制**：快速复制优化结果

### 用户体验优化
- 👤 **用户认证**：基于 Supabase 的登录系统
- 🎨 **渐变 UI 设计**：采用现代化的渐变色彩方案
- ⚡ **实时更新**：任务状态变更即时反映
- 📱 **响应式布局**：完美适配各种屏幕尺寸
- 🔄 **加载状态**：友好的加载动画和错误处理

## 🛠 技术架构

### 前端技术栈
- **框架**: React 18 + Next.js 14
- **类型系统**: TypeScript 5
- **样式方案**: Tailwind CSS 3.4 + Typography 插件
- **构建工具**: Next.js 内置构建系统
- **代码质量**: ESLint + TypeScript 严格模式

### 后端架构
- **API 框架**: Next.js API Routes
- **数据库**: Supabase (基于 PostgreSQL)
- **AI 服务**:
  - DeepSeek（任务拆解、提示词优化）
  - 智谱 BigModel（流式聊天）
- **Token 计算**: js-tiktoken
- **数据验证**: 原生 TypeScript 类型检查

### 数据库设计
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**设计特点**：
- 🔗 **自关联设计**：通过 `parent_id` 实现无限层级任务结构
- 👤 **用户关联**：通过 `user_id` 实现用户数据隔离
- 🚀 **性能优化**：针对常用查询字段建立索引
- 🔒 **数据安全**：支持 Row Level Security

## 📁 项目结构

```
todo-ai/
├── src/
│   ├── app/                          # Next.js 13+ App Router
│   │   ├── api/                      # API 路由
│   │   │   ├── todos/
│   │   │   │   ├── route.ts          # GET/POST 待办事项
│   │   │   │   └── [id]/route.ts     # GET/PATCH/DELETE 单个待办
│   │   │   └── ai/
│   │   │       ├── decompose/route.ts     # AI 拆解 API
│   │   │       ├── prompt-enhance/route.ts # 提示词优化 API
│   │   │       └── chat/route.ts          # 流式聊天 API
│   │   ├── components/               # 可复用组件
│   │   │   ├── UserMenu.tsx        # 用户菜单
│   │   │   └── DateFilter.tsx       # 日期筛选器
│   │   ├── page.tsx                  # 主页面组件（三 Tab）
│   │   ├── layout.tsx                # 根布局
│   │   └── globals.css               # 全局样式
│   └── lib/                          # 工具库
│       ├── supabase.ts               # Supabase 客户端配置
│       ├── openai.ts                 # OpenAI/AI 服务配置
│       ├── token.ts                 # Token 计算工具
│       └── dateUtils.ts             # 日期处理工具
├── .env.local                        # 环境变量配置
├── supabase-schema.sql               # 数据库 Schema
├── package.json                      # 项目依赖配置
├── tsconfig.json                     # TypeScript 配置
├── tailwind.config.ts               # Tailwind CSS 配置
└── README.md                         # 项目文档
```

## 🔧 API 接口设计

### 待办事项管理
| 方法 | 路径 | 功能描述 |
|------|------|----------|
| GET | `/api/todos` | 获取所有待办事项（支持日期筛选） |
| POST | `/api/todos` | 创建新待办事项 |
| PATCH | `/api/todos/:id` | 更新待办事项（状态、优先级、截止日期） |
| DELETE | `/api/todos/:id` | 删除待办事项（级联删除子任务） |

### AI 功能
| 方法 | 路径 | 功能描述 |
|------|------|----------|
| POST | `/api/ai/decompose` | 使用 AI 拆解复杂任务 |
| POST | `/api/ai/prompt-enhance` | AI 优化提示词（流式输出） |
| POST | `/api/ai/chat` | 流式 AI 聊天 |

## 🤖 AI 集成详解

### DeepSeek 模型
- **用途**: 任务拆解、提示词优化
- **模型**: deepseek-chat
- **特性**: 高性价比，适合文本任务

### 智谱 BigModel 模型
- **用途**: 流式聊天
- **模型**: glm-4.7
- **特性**: 流式输出、成本计算
- **定价**:
  - 输入: ¥2 / 百万 tokens
  - 输出: ¥8 / 百万 tokens
- **配置**:
  - baseURL: https://open.bigmodel.cn/api/paas/v4
  - temperature: 0.8
  - timeout: 120s
  - max_tokens: 65535

### Token 计算
- **工具**: js-tiktoken
- **编码器**: cl100k_base
- **功能**:
  - 计算文本的 token 数
  - 计算使用成本
  - 实时显示成本信息

## 🎨 UI/UX 设计特点

### 视觉设计
- **色彩方案**: 紫色到蓝色的渐变主题
- **布局设计**: 卡片式布局，层次分明
- **交互反馈**: 悬停效果、过渡动画
- **状态指示**: 清晰的完成状态和进度显示

### 交互设计
- **模式切换**: 一键切换普通/AI 拆解模式
- **Tab 切换**: 待办事项、提示词生成、流式 AI 三个功能模块
- **实时更新**: 操作后立即刷新数据
- **错误处理**: 友好的错误提示和加载状态
- **响应式**: 完美适配桌面和移动设备

### 加载状态
- **任务加载**: 列表加载时的旋转动画
- **AI 处理**: AI 处理时的旋转图标
- **流式等待**: 等待 AI 响应时的跳动圆点动画
- **流式输入**: AI 逐字输出时的光标闪烁效果

## 🚀 部署与配置

### 环境变量配置
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# DeepSeek API 配置
DEEPSEEK_API_KEY=your-deepseek-api-key

# 智谱 BigModel API 配置
BIGMODEL_API_KEY=your-bigmodel-api-key
```

### 快速启动
```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件，填入实际配置

# 3. 启动开发服务器
npm run dev

# 4. 访问应用
# 浏览器打开 http://localhost:3000
```

### 生产部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📊 性能优化

### 前端优化
- **代码分割**: Next.js 自动代码分割
- **CSS 优化**: Tailwind CSS 的 PurgeCSS
- **缓存策略**: 合理的状态管理
- **本地存储**: 聊天历史使用 localStorage

### 后端优化
- **数据库索引**: 针对 user_id、parent_id 和 created_at 建立索引
- **API 设计**: RESTful 设计原则
- **错误处理**: 统一的错误响应格式
- **类型安全**: 完整的 TypeScript 类型覆盖

## 🔒 安全考虑

### 数据安全
- **API 密钥**: 环境变量存储，不暴露给客户端
- **数据库安全**: Supabase RLS 支持
- **输入验证**: 前后端双重验证
- **错误处理**: 避免敏感信息泄露
- **用户隔离**: 所有数据操作都基于用户 ID

### AI 服务安全
- **API 限制**: 合理的 token 使用限制
- **错误恢复**: AI 服务不可用时的降级处理
- **成本控制**: 使用高性价比模型

## 🎯 项目亮点

1. **创新性**: 将 AI 技术与传统待办事项管理相结合
2. **多功能性**: 集成任务拆解、提示词优化、流式聊天三大 AI 功能
3. **实用性**: 解决了复杂任务难以执行的实际问题
4. **技术先进性**: 采用最新的 Next.js 14 + TypeScript 5
5. **用户体验**: 现代化的 UI 设计和流畅的交互体验
6. **可扩展性**: 模块化设计，易于扩展新功能

## 🛣 未来规划

### 短期优化
- [ ] 添加任务标签和分类功能
- [ ] 支持任务排序和搜索
- [ ] 增加任务截止日期提醒通知
- [ ] 支持批量操作

### 中长期扩展
- [ ] 团队协作功能
- [ ] 数据分析和报表
- [ ] 移动端 App 开发
- [ ] 集成更多 AI 模型选项
- [ ] 导出聊天记录
- [ ] 聊天语音输入

---

**开发时间**: 2026年1月
**技术栈版本**: React 18, Next.js 14, TypeScript 5, Tailwind CSS 3.4
**许可证**: MIT License
