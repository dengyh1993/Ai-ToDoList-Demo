# 登录功能 + 日期筛选 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为待办事项应用添加用户登录系统（Supabase Auth + GitHub OAuth）和按日期筛选任务功能。

**Architecture:** 使用 Supabase Auth 管理用户认证，通过 Row Level Security (RLS) 实现数据隔离。前端新增登录/注册页面和日期筛选组件，API 层增加用户身份校验和日期过滤参数。

**Tech Stack:** Next.js 14, Supabase Auth, TypeScript, Tailwind CSS

**Worktree:** `/Users/dengyouhao/work/aiDemo/ai-todolist/todo-ai/.worktrees/feature-auth`

---

## Phase 1: 数据库准备

### Task 1: 更新数据库 Schema

**Files:**
- Create: `supabase-auth-schema.sql`

**Step 1: 创建 SQL 迁移文件**

```sql
-- supabase-auth-schema.sql
-- 为 todos 表添加用户关联

-- 1. 添加 user_id 列
ALTER TABLE todos ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- 2. 启用 Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略
CREATE POLICY "用户只能查看自己的任务" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户只能创建自己的任务" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户只能更新自己的任务" ON todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "用户只能删除自己的任务" ON todos
  FOR DELETE USING (auth.uid() = user_id);

-- 4. 为 user_id 创建索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
```

**Step 2: 在 Supabase 控制台执行 SQL**

手动操作：
1. 打开 Supabase Dashboard → SQL Editor
2. 复制并执行上述 SQL
3. 验证：Table Editor → todos 表应显示新的 user_id 列

**Step 3: Commit**

```bash
git add supabase-auth-schema.sql
git commit -m "feat(db): 添加用户关联和 RLS 策略"
```

---

## Phase 2: 认证基础设施

### Task 2: 创建 Supabase Auth 客户端

**Files:**
- Modify: `src/lib/supabase.ts`

**Step 1: 更新 Supabase 客户端，添加 Auth 支持**

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface Todo {
  id: string
  title: string
  description?: string
  status: 'pending' | 'completed'
  parent_id?: string
  user_id?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
}
```

**Step 2: Commit**

```bash
git add src/lib/supabase.ts
git commit -m "feat(auth): 更新 Supabase 客户端类型定义"
```

---

### Task 3: 创建认证表单组件

**Files:**
- Create: `src/app/components/AuthForm.tsx`

**Step 1: 创建登录/注册表单组件**

```typescript
// src/app/components/AuthForm.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
      }
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleGitHubLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            邮箱
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition-all"
        >
          {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm">或</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <button
        onClick={handleGitHubLogin}
        disabled={loading}
        className="w-full py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        使用 GitHub 登录
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/components/AuthForm.tsx
git commit -m "feat(auth): 创建登录/注册表单组件"
```

---

### Task 4: 创建登录页面

**Files:**
- Create: `src/app/(auth)/login/page.tsx`

**Step 1: 创建登录页面**

```typescript
// src/app/(auth)/login/page.tsx
import Link from 'next/link'
import AuthForm from '@/app/components/AuthForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 待办事项
          </h1>
          <p className="text-gray-500 mt-2">登录你的账号</p>
        </div>

        <AuthForm mode="login" />

        <p className="text-center text-gray-500 mt-6">
          还没有账号？{' '}
          <Link href="/signup" className="text-indigo-600 hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/\(auth\)/login/page.tsx
git commit -m "feat(auth): 创建登录页面"
```

---

### Task 5: 创建注册页面

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`

**Step 1: 创建注册页面**

```typescript
// src/app/(auth)/signup/page.tsx
import Link from 'next/link'
import AuthForm from '@/app/components/AuthForm'

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 待办事项
          </h1>
          <p className="text-gray-500 mt-2">创建新账号</p>
        </div>

        <AuthForm mode="signup" />

        <p className="text-center text-gray-500 mt-6">
          已有账号？{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">
            立即登录
          </Link>
        </p>
      </div>
    </main>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/\(auth\)/signup/page.tsx
git commit -m "feat(auth): 创建注册页面"
```

---

### Task 6: 创建用户菜单组件

**Files:**
- Create: `src/app/components/UserMenu.tsx`

**Step 1: 创建用户菜单组件**

```typescript
// src/app/components/UserMenu.tsx
'use client'

import { useState } from 'react'
import { supabase, User } from '@/lib/supabase'

interface UserMenuProps {
  user: User
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '用户'
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/50 transition-colors"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="头像" className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-gray-700 font-medium">{displayName}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-20">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
            >
              退出登录
            </button>
          </div>
        </>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/components/UserMenu.tsx
git commit -m "feat(auth): 创建用户菜单组件"
```

---

## Phase 3: 日期筛选功能

### Task 7: 创建日期工具函数

**Files:**
- Create: `src/lib/dateUtils.ts`

**Step 1: 创建日期工具函数**

```typescript
// src/lib/dateUtils.ts
export type DateFilterType = 'all' | 'today' | 'week' | 'month' | 'custom'

export interface DateRange {
  start: string  // ISO 日期字符串 YYYY-MM-DD
  end: string
}

export function getDateRange(type: DateFilterType): DateRange | null {
  if (type === 'all') return null

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (type) {
    case 'today':
      return {
        start: formatDate(today),
        end: formatDate(today),
      }

    case 'week': {
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return {
        start: formatDate(monday),
        end: formatDate(sunday),
      }
    }

    case 'month': {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
      }
    }

    default:
      return null
  }
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
```

**Step 2: Commit**

```bash
git add src/lib/dateUtils.ts
git commit -m "feat(filter): 创建日期工具函数"
```

---

### Task 8: 创建日期筛选组件

**Files:**
- Create: `src/app/components/DateFilter.tsx`

**Step 1: 创建日期筛选组件**

```typescript
// src/app/components/DateFilter.tsx
'use client'

import { useState } from 'react'
import { DateFilterType, DateRange, formatDate } from '@/lib/dateUtils'

interface DateFilterProps {
  value: { type: DateFilterType; customRange?: DateRange }
  onChange: (filter: { type: DateFilterType; customRange?: DateRange }) => void
}

export default function DateFilter({ value, onChange }: DateFilterProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(formatDate(new Date()))
  const [customEnd, setCustomEnd] = useState(formatDate(new Date()))

  const buttons: { type: DateFilterType; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'today', label: '今天' },
    { type: 'week', label: '本周' },
    { type: 'month', label: '本月' },
  ]

  const handleButtonClick = (type: DateFilterType) => {
    setShowCustom(false)
    onChange({ type })
  }

  const handleCustomApply = () => {
    onChange({
      type: 'custom',
      customRange: { start: customStart, end: customEnd },
    })
    setShowCustom(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => handleButtonClick(btn.type)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value.type === btn.type
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {btn.label}
          </button>
        ))}

        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            value.type === 'custom'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          自定义
        </button>
      </div>

      {showCustom && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">开始:</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">结束:</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleCustomApply}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            应用筛选
          </button>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/components/DateFilter.tsx
git commit -m "feat(filter): 创建日期筛选组件"
```

---

## Phase 4: API 更新

### Task 9: 更新 todos API 支持用户和日期筛选

**Files:**
- Modify: `src/app/api/todos/route.ts`

**Step 1: 读取当前 API 文件内容**

先读取当前文件确认结构。

**Step 2: 更新 GET 和 POST 路由**

```typescript
// src/app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // 获取查询参数
  const searchParams = request.nextUrl.searchParams
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  // 构建查询
  let query = supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  // 添加日期筛选
  if (start) {
    query = query.gte('created_at', `${start}T00:00:00`)
  }
  if (end) {
    query = query.lte('created_at', `${end}T23:59:59`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, description, parent_id } = body

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('todos')
    .insert({
      title,
      description,
      parent_id,
      user_id: user?.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
```

**Step 3: Commit**

```bash
git add src/app/api/todos/route.ts
git commit -m "feat(api): 更新 todos API 支持日期筛选和用户关联"
```

---

### Task 10: 更新 AI 拆解 API

**Files:**
- Modify: `src/app/api/ai/decompose/route.ts`

**Step 1: 更新 API 添加 user_id**

读取当前文件，然后在创建任务时添加 user_id。

**Step 2: Commit**

```bash
git add src/app/api/ai/decompose/route.ts
git commit -m "feat(api): AI 拆解任务关联用户 ID"
```

---

## Phase 5: 主页面整合

### Task 11: 更新主页面

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: 添加认证检查、用户菜单和日期筛选**

更新主页面：
1. 检查登录状态，未登录跳转到 /login
2. 顶部添加用户菜单
3. 任务列表上方添加日期筛选
4. fetchTodos 支持日期参数

**Step 2: 验证功能**

```bash
npm run dev
```

测试：
1. 访问 http://localhost:3000 应跳转到 /login
2. 注册/登录后返回主页
3. 日期筛选按钮正常工作
4. 任务与用户关联

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(ui): 主页面集成认证和日期筛选"
```

---

## Phase 6: 最终测试

### Task 12: 完整功能测试

**测试清单：**

1. **注册流程**
   - [ ] 邮箱/密码注册成功
   - [ ] 注册后自动登录跳转主页

2. **登录流程**
   - [ ] 邮箱/密码登录成功
   - [ ] GitHub OAuth 登录成功
   - [ ] 登录失败显示错误提示

3. **用户隔离**
   - [ ] 用户只能看到自己的任务
   - [ ] 新建任务关联当前用户

4. **日期筛选**
   - [ ] 「全部」显示所有任务
   - [ ] 「今天」只显示今日任务
   - [ ] 「本周」显示本周任务
   - [ ] 「本月」显示本月任务
   - [ ] 自定义日期范围正常工作

5. **退出登录**
   - [ ] 点击退出后跳转到登录页
   - [ ] 退出后无法访问主页

---

## Supabase 配置提醒

在 Supabase Dashboard 中完成以下配置：

### 1. 启用 GitHub OAuth Provider

1. 进入 Authentication → Providers
2. 启用 GitHub
3. 在 GitHub 创建 OAuth App：
   - Homepage URL: `http://localhost:3000`
   - Callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. 将 Client ID 和 Secret 填入 Supabase

### 2. 配置 Redirect URLs

1. 进入 Authentication → URL Configuration
2. 添加 `http://localhost:3000` 到 Redirect URLs
3. 生产环境添加实际域名

---

## 预估时间

| Phase | 任务 | 时间 |
|-------|------|------|
| 1 | 数据库 Schema | 15 分钟 |
| 2 | 认证基础设施 | 60 分钟 |
| 3 | 日期筛选组件 | 30 分钟 |
| 4 | API 更新 | 20 分钟 |
| 5 | 主页面整合 | 30 分钟 |
| 6 | 测试 | 15 分钟 |
| **总计** | | **~3 小时** |
