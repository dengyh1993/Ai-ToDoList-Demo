'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Todo, supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import UserMenu from '@/app/components/UserMenu'
import DateFilter from '@/app/components/DateFilter'
import { DateFilterType, DateRange, getDateRange } from '@/lib/dateUtils'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isAiMode, setIsAiMode] = useState(false)
  const [dateFilter, setDateFilter] = useState<{ type: DateFilterType; customRange?: DateRange }>({ type: 'all' })

  // 检查登录状态
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    checkUser()
  }, [router])

  // 获取所有待办事项
  const fetchTodos = useCallback(async (filter: { type: DateFilterType; customRange?: DateRange } = { type: 'all' }) => {
    try {
      const params = new URLSearchParams()
      if (filter.type === 'custom' && filter.customRange) {
        params.set('start', filter.customRange.start)
        params.set('end', filter.customRange.end)
      } else {
        const dateRange = getDateRange(filter.type)
        if (dateRange?.start) params.set('start', dateRange.start)
        if (dateRange?.end) params.set('end', dateRange.end)
      }

      const url = `/api/todos${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error('获取待办事项失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchTodos(dateFilter)
    }
  }, [user, dateFilter, fetchTodos])

  // 处理日期筛选变化
  const handleDateFilterChange = (filter: { type: DateFilterType; customRange?: DateRange }) => {
    setDateFilter(filter)
  }

  // 添加普通任务
  const addTask = async () => {
    if (!newTask.trim()) return

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      })
      if (res.ok) {
        setNewTask('')
        fetchTodos(dateFilter)
      }
    } catch (error) {
      console.error('添加任务失败:', error)
    }
  }

  // AI 拆解任务
  const aiDecompose = async () => {
    if (!newTask.trim()) return

    setIsAiLoading(true)
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      })
      if (res.ok) {
        setNewTask('')
        fetchTodos(dateFilter)
      } else {
        const data = await res.json()
        alert(data.error || 'AI 拆解失败')
      }
    } catch (error) {
      console.error('AI 拆解失败:', error)
      alert('AI 服务暂时不可用')
    } finally {
      setIsAiLoading(false)
    }
  }

  // 切换完成状态
  const toggleComplete = async (id: string, status: 'pending' | 'completed') => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status === 'completed' ? 'pending' : 'completed' }),
      })
      fetchTodos(dateFilter)
    } catch (error) {
      console.error('更新任务失败:', error)
    }
  }

  // 删除任务
  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      fetchTodos(dateFilter)
    } catch (error) {
      console.error('删除任务失败:', error)
    }
  }

  // 获取主任务（没有 parent_id 的）
  const mainTodos = todos.filter((todo) => !todo.parent_id)

  // 获取子任务
  const getSubTasks = (parentId: string) =>
    todos
      .filter((todo) => todo.parent_id === parentId)
      .sort((a, b) => {
        const timeDiff =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        if (timeDiff !== 0) return timeDiff
        return a.id.localeCompare(b.id)
      })

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isAiMode) {
      aiDecompose()
    } else {
      addTask()
    }
  }

  // 如果还在检查登录状态，显示加载
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* 顶部用户菜单 */}
      <div className="absolute top-4 right-4">
        <UserMenu user={user} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 待办事项
          </h1>
          <p className="text-gray-500 mt-2">智能拆解任务，让复杂变简单</p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder={
                  isAiMode
                    ? '输入一个宽泛任务，如"准备下周的产品发布"...'
                    : '添加一个新任务...'
                }
                className="w-full px-5 py-4 text-lg text-gray-800 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                disabled={isAiLoading}
              />
            </div>

            {/* 模式切换和提交按钮 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAiMode(!isAiMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isAiMode
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                AI 拆解模式
              </button>

              <button
                type="submit"
                disabled={!newTask.trim() || isAiLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    AI 处理中...
                  </>
                ) : isAiMode ? (
                  '智能拆解'
                ) : (
                  '添加任务'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 日期筛选 */}
        <div className="mb-6">
          <DateFilter value={dateFilter} onChange={handleDateFilterChange} />
        </div>

        {/* 任务列表 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-4">加载中...</p>
            </div>
          ) : mainTodos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">还没有任务，开始添加吧！</p>
            </div>
          ) : (
            mainTodos.map((todo) => {
              const subTasks = getSubTasks(todo.id)
              const completedSubTasks = subTasks.filter((t) => t.status === 'completed').length

              return (
                <div
                  key={todo.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* 主任务 */}
                  <div className="p-5 flex items-center gap-4">
                    <button
                      onClick={() => toggleComplete(todo.id, todo.status)}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                        todo.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-indigo-500'
                      }`}
                    >
                      {todo.status === 'completed' && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1">
                      <p
                        className={`text-lg ${
                          todo.status === 'completed'
                            ? 'text-gray-400 line-through'
                            : 'text-gray-800'
                        }`}
                      >
                        {todo.title}
                      </p>
                      {todo.description && (
                        <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                      )}
                      {subTasks.length > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          {completedSubTasks}/{subTasks.length} 个子任务已完成
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTask(todo.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* 子任务列表 */}
                  {subTasks.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                      <div className="space-y-2">
                        {subTasks.map((subTask) => (
                          <div
                            key={subTask.id}
                            className="flex items-center gap-3 py-2 pl-4"
                          >
                            <button
                              onClick={() =>
                                toggleComplete(subTask.id, subTask.status)
                              }
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                subTask.status === 'completed'
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-indigo-500'
                              }`}
                            >
                              {subTask.status === 'completed' && (
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                            <span
                              className={`flex-1 ${
                                subTask.status === 'completed'
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-600'
                              }`}
                            >
                              {subTask.title}
                            </span>
                            <button
                              onClick={() => deleteTask(subTask.id)}
                              className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
