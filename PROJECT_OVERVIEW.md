# AI 待办事项应用 - 项目概览

## 📋 项目简介

这是一个集成 AI 智能拆解功能的现代化待办事项管理应用。用户不仅可以添加普通任务，还可以通过 AI 将宽泛、复杂的任务自动拆解成 3-5 个具体可执行的小步骤，提高任务管理的效率和可操作性。

## 🎯 核心功能

### 基础待办管理
- ✅ 添加、编辑、删除任务
- ✅ 任务完成状态切换
- ✅ 任务进度追踪
- ✅ 美观的响应式 UI 设计

### AI 智能拆解（核心特色）
- 🤖 **智能任务拆解**：输入宽泛任务，AI 自动生成 3-5 个具体可执行的子任务
- 🔗 **父子任务关联**：支持主任务与子任务的层级关系
- 📊 **进度可视化**：显示子任务完成进度（如：3/5 个子任务已完成）
- 🔄 **模式切换**：支持普通模式和 AI 拆解模式的一键切换

### 用户体验优化
- 🎨 **渐变 UI 设计**：采用现代化的渐变色彩方案
- ⚡ **实时更新**：任务状态变更即时反映
- 📱 **响应式布局**：完美适配各种屏幕尺寸
- 🔄 **加载状态**：友好的加载动画和错误处理

## 🛠 技术架构

### 前端技术栈
- **框架**: React 18 + Next.js 14
- **类型系统**: TypeScript 5
- **样式方案**: Tailwind CSS 3.4
- **构建工具**: Next.js 内置构建系统
- **代码质量**: ESLint + TypeScript 严格模式

### 后端架构
- **API 框架**: Next.js API Routes
- **数据库**: Supabase (基于 PostgreSQL)
- **AI 服务**: 小米 MiMo 模型（通过 OpenRouter）
- **数据验证**: 原生 TypeScript 类型检查

### 数据库设计
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  parent_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**设计特点**：
- 🔗 **自关联设计**：通过 `parent_id` 实现无限层级任务结构
- 🚀 **性能优化**：针对常用查询字段建立索引
- 🔒 **数据安全**：支持 Row Level Security（可选）

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
│   │   │       └── decompose/route.ts # AI 拆解 API
│   │   ├── page.tsx                  # 主页面组件
│   │   ├── layout.tsx                # 根布局
│   │   └── globals.css               # 全局样式
│   └── lib/                          # 工具库
│       ├── supabase.ts               # Supabase 客户端配置
│       └── openai.ts                 # OpenAI/AI 服务配置
├── .env.local                        # 环境变量配置
├── supabase-schema.sql               # 数据库 Schema
├── package.json                      # 项目依赖配置
├── tsconfig.json                     # TypeScript 配置
├── tailwind.config.ts               # Tailwind CSS 配置
└── README.md                         # 原始项目文档
```

## 🔧 API 接口设计

### 待办事项管理
| 方法 | 路径 | 功能描述 |
|------|------|----------|
| GET | `/api/todos` | 获取所有待办事项（包含父子关系） |
| POST | `/api/todos` | 创建新待办事项 |
| GET | `/api/todos/:id` | 获取单个待办事项详情 |
| PATCH | `/api/todos/:id` | 更新待办事项状态 |
| DELETE | `/api/todos/:id` | 删除待办事项（级联删除子任务） |

### AI 智能拆解
| 方法 | 路径 | 功能描述 |
|------|------|----------|
| POST | `/api/ai/decompose` | 使用 AI 拆解复杂任务 |

**AI 拆解流程**：
1. 接收用户输入的宽泛任务
2. 调用小米 MiMo 模型进行任务拆解
3. 创建主任务记录
4. 批量创建子任务记录
5. 返回拆解结果

## 🤖 AI 集成详解

### AI 模型配置
- **提供商**: 小米 MiMo v2 Flash（免费版本）
- **接入方式**: 通过 OpenRouter 平台
- **模型特性**: 中文本土化，任务拆解能力强

### 拆解规则
```typescript
{
  role: 'system',
  content: `你是一个任务分解助手。用户会给你一个宽泛的任务，你需要将它拆解成3-5个具体可执行的小步骤。
规则：
1. 每个步骤应该是具体、可操作的
2. 步骤之间应该有逻辑顺序
3. 只返回步骤列表，每行一个步骤
4. 不要添加序号或其他格式
5. 用中文回复`
}
```

### 典型拆解示例
**输入**: "准备下周的产品发布"
**输出**:
```
确定发布内容和时间节点
准备发布文档和用户指南
进行最终的功能测试和修复
协调市场和销售团队准备
执行发布计划并收集用户反馈
```

## 🎨 UI/UX 设计特点

### 视觉设计
- **色彩方案**: 紫色到蓝色的渐变主题
- **布局设计**: 卡片式布局，层次分明
- **交互反馈**: 悬停效果、过渡动画
- **状态指示**: 清晰的完成状态和进度显示

### 交互设计
- **模式切换**: 一键切换普通/AI 模式
- **实时更新**: 操作后立即刷新数据
- **错误处理**: 友好的错误提示和加载状态
- **响应式**: 完美适配桌面和移动设备

## 🚀 部署与配置

### 环境变量配置
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI 服务配置（小米 MiMo，通过 OpenRouter）
XIAOMI_API_KEY=your-openrouter-api-key
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
- **图片优化**: Next.js Image 组件
- **CSS 优化**: Tailwind CSS 的 PurgeCSS
- **缓存策略**: 合理的状态管理

### 后端优化
- **数据库索引**: 针对 parent_id 和 created_at 建立索引
- **API 设计**: RESTful 设计原则
- **错误处理**: 统一的错误响应格式
- **类型安全**: 完整的 TypeScript 类型覆盖

## 🔒 安全考虑

### 数据安全
- **API 密钥**: 环境变量存储，不暴露给客户端
- **数据库安全**: Supabase RLS 支持
- **输入验证**: 前后端双重验证
- **错误处理**: 避免敏感信息泄露

### AI 服务安全
- **API 限制**: 合理的 token 使用限制
- **错误恢复**: AI 服务不可用时的降级处理
- **成本控制**: 使用免费版本模型

## 🎯 项目亮点

1. **创新性**: 将 AI 技术与传统待办事项管理相结合
2. **实用性**: 解决了复杂任务难以执行的实际问题
3. **技术先进性**: 采用最新的 Next.js 14 + TypeScript 5
4. **用户体验**: 现代化的 UI 设计和流畅的交互体验
5. **可扩展性**: 模块化设计，易于扩展新功能

## 🛣 未来规划

### 短期优化
- [ ] 添加任务标签和分类功能
- [ ] 支持任务优先级设置
- [ ] 增加任务截止日期提醒
- [ ] 支持批量操作

### 中长期扩展
- [ ] 多用户支持和权限管理
- [ ] 团队协作功能
- [ ] 数据分析和报表
- [ ] 移动端 App 开发
- [ ] 集成更多 AI 功能（如任务建议、进度预测）

---

**开发时间**: 2026年1月  
**技术栈版本**: React 18, Next.js 14, TypeScript 5, Tailwind CSS 3.4  
**许可证**: MIT License