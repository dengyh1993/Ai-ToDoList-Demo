'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Todo, supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import UserMenu from '@/app/components/UserMenu';
import DateFilter from '@/app/components/DateFilter';
import { DateFilterType, DateRange, getDateRange } from '@/lib/dateUtils';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [isAiMode, setIsAiMode] = useState(false);
  const [dateFilter, setDateFilter] = useState<{
    type: DateFilterType;
    customRange?: DateRange;
  }>({ type: 'all' });
  // Tab 切换状态
  const [activeTab, setActiveTab] = useState<'todo' | 'prompt' | 'chat'>('todo');
  // 提示词优化状态
  const [userPrompt, setUserPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  // 聊天状态
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string }>
  >([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState('');
  const [chatCost, setChatCost] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  // 从 localStorage 加载/保存聊天历史
  const getChatStorageKey = (userId: string) => `chat_history_${userId}`;

  useEffect(() => {
    if (user) {
      const key = getChatStorageKey(user.id);
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setChatMessages(parsed);
          }
        }
      } catch (e) {
        console.error('加载聊天历史失败:', e);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && chatMessages.length > 0) {
      const key = getChatStorageKey(user.id);
      try {
        localStorage.setItem(key, JSON.stringify(chatMessages));
      } catch (e) {
        console.error('保存聊天历史失败:', e);
      }
    }
  }, [user, chatMessages]);
  // 编辑状态
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  // 折叠状态
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  // 更新中状态（优先级/截止日期）
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // 优先级配置
  const priorityConfig = {
    high: { label: '高', color: 'bg-red-100 text-red-700 border-red-200' },
    medium: {
      label: '中',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    low: { label: '低', color: 'bg-green-100 text-green-700 border-green-200' },
  };

  // 获取截止日期状态
  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0)
      return { label: '已过期', color: 'text-red-600 bg-red-50' };
    if (diffDays === 0)
      return { label: '今天到期', color: 'text-orange-600 bg-orange-50' };
    if (diffDays <= 3)
      return {
        label: `${diffDays}天后`,
        color: 'text-yellow-600 bg-yellow-50',
      };
    return { label: dueDate, color: 'text-gray-500 bg-gray-50' };
  };

  // 检查登录状态
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [router]);

  // 获取所有待办事项
  const fetchTodos = useCallback(
    async (
      filter: { type: DateFilterType; customRange?: DateRange } = {
        type: 'all',
      },
    ) => {
      try {
        const params = new URLSearchParams();
        if (filter.type === 'custom' && filter.customRange) {
          params.set('start', filter.customRange.start);
          params.set('end', filter.customRange.end);
        } else {
          const dateRange = getDateRange(filter.type);
          if (dateRange?.start) params.set('start', dateRange.start);
          if (dateRange?.end) params.set('end', dateRange.end);
        }

        const url = `/api/todos${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setTodos(data);
      } catch (error) {
        console.error('获取待办事项失败:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (user) {
      fetchTodos(dateFilter);
    }
  }, [user, dateFilter, fetchTodos]);

  // 处理日期筛选变化
  const handleDateFilterChange = (filter: {
    type: DateFilterType;
    customRange?: DateRange;
  }) => {
    setDateFilter(filter);
  };

  // 添加普通任务
  const addTask = async () => {
    if (!newTask.trim()) return;

    setIsAddingTask(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask }),
      });
      if (res.ok) {
        setNewTask('');
        fetchTodos(dateFilter);
      }
    } catch (error) {
      console.error('添加任务失败:', error);
    } finally {
      setIsAddingTask(false);
    }
  };

  // AI 拆解任务
  const aiDecompose = async () => {
    if (!newTask.trim()) return;

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: newTask }),
      });
      if (res.ok) {
        setNewTask('');
        fetchTodos(dateFilter);
      } else {
        const data = await res.json();
        alert(data.error || 'AI 拆解失败');
      }
    } catch (error) {
      console.error('AI 拆解失败:', error);
      alert('AI 服务暂时不可用');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 切换完成状态
  const toggleComplete = async (
    id: string,
    status: 'pending' | 'completed',
  ) => {
    setTogglingIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: status === 'completed' ? 'pending' : 'completed',
        }),
      });
      fetchTodos(dateFilter);
    } catch (error) {
      console.error('更新任务失败:', error);
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 删除任务
  const deleteTask = async (id: string) => {
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      fetchTodos(dateFilter);
    } catch (error) {
      console.error('删除任务失败:', error);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 更新任务标题
  const updateTask = async (id: string, title: string) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchTodos(dateFilter);
    } catch (error) {
      console.error('更新任务失败:', error);
    }
  };

  // 更新任务优先级
  const updatePriority = async (
    id: string,
    priority: 'low' | 'medium' | 'high',
  ) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      fetchTodos(dateFilter);
    } catch (error) {
      console.error('更新优先级失败:', error);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 更新截止日期
  const updateDueDate = async (id: string, due_date: string | null) => {
    setUpdatingIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ due_date }),
      });
      fetchTodos(dateFilter);
    } catch (error) {
      console.error('更新截止日期失败:', error);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // 开始编辑
  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };

  // 保存编辑
  const saveEdit = async () => {
    if (editingId && editingTitle.trim()) {
      await updateTask(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 切换折叠状态
  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 获取主任务（没有 parent_id 的）
  const mainTodos = todos.filter((todo) => !todo.parent_id);

  // 获取子任务
  const getSubTasks = (parentId: string) =>
    todos
      .filter((todo) => todo.parent_id === parentId)
      .sort((a, b) => {
        const timeDiff =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (timeDiff !== 0) return timeDiff;
        return a.id.localeCompare(b.id);
      });

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAiMode) {
      aiDecompose();
    } else {
      addTask();
    }
  };

  // AI 优化提示词 - 流式接收
  const enhancePromptWithAI = async () => {
    if (!userPrompt.trim()) return;

    setIsEnhancing(true);
    setEnhancedPrompt('');

    try {
      const res = await fetch('/api/ai/prompt-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '提示词优化失败');
        setIsEnhancing(false);
        return;
      }

      // 处理流式响应
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        alert('无法读取响应流');
        setIsEnhancing(false);
        return;
      }

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;
        setEnhancedPrompt(accumulatedText);
      }

      setIsEnhancing(false);
    } catch (error) {
      console.error('提示词优化失败:', error);
      alert('AI 服务暂时不可用');
      setIsEnhancing(false);
    }
  };

  // 发送聊天消息
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatting) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatting(true);
    setCurrentAssistantMessage('');
    setChatCost(null);
    setChatError(null);

    // 添加用户消息
    const newMessages = [
      ...chatMessages,
      { role: 'user' as const, content: userMessage },
    ];
    setChatMessages(newMessages);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '聊天失败');
        setIsChatting(false);
        return;
      }

      // 处理流式响应
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        alert('无法读取响应流');
        setIsChatting(false);
        return;
      }

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'cost') {
                setChatCost(parsed.formatted);
              } else if (parsed.type === 'error') {
                setChatError(parsed.message || 'AI 服务暂时不可用');
                setIsChatting(false);
                setCurrentAssistantMessage('');
              } else if (parsed.content) {
                accumulatedText += parsed.content;
                setCurrentAssistantMessage(accumulatedText);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 完成后添加助手消息到历史记录
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant' as const, content: accumulatedText },
      ]);
      setCurrentAssistantMessage('');
      setIsChatting(false);
    } catch (error) {
      console.error('聊天失败:', error);
      setChatError('网络错误，请稍后重试');
      setIsChatting(false);
    }
  };

  // 如果还在检查登录状态，显示加载
  if (!user) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 顶部用户菜单 */}
      <div className="absolute top-4 right-4">
        <UserMenu user={user} />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 标题和 Tab 切换 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 助手
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            智能拆解任务，优化提示词
          </p>

          {/* Tab 切换按钮 */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setActiveTab('todo')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'todo'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              待办事项
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'prompt'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              提示词生成
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'chat'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              流式AI
            </button>
          </div>
        </div>

        {/* 待办事项 Tab */}
        {activeTab === 'todo' && (
          <>
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
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
                    className="w-full px-5 py-4 text-lg text-gray-800 dark:text-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                    disabled={isAiLoading}
                  />
                </div>

                {/* 模式切换和提交按钮 */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsAiMode(!isAiMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isAiMode
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
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
                    disabled={!newTask.trim() || isAiLoading || isAddingTask}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isAiLoading || isAddingTask ? (
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
                        {isAiLoading ? 'AI 处理中...' : '添加中...'}
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
              <DateFilter
                value={dateFilter}
                onChange={handleDateFilterChange}
              />
            </div>

            {/* 任务列表 */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-500 mt-4">加载中...</p>
                </div>
              ) : mainTodos.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    还没有任务，开始添加吧！
                  </p>
                </div>
              ) : (
                mainTodos.map((todo) => {
                  const subTasks = getSubTasks(todo.id);
                  const completedSubTasks = subTasks.filter(
                    (t) => t.status === 'completed',
                  ).length;

                  return (
                    <div
                      key={todo.id}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                    >
                      {/* 主任务 */}
                      <div className="p-5 flex items-center gap-4">
                        <button
                          onClick={() => toggleComplete(todo.id, todo.status)}
                          disabled={togglingIds.has(todo.id)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${todo.status === 'completed'
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-indigo-500'
                            } ${togglingIds.has(todo.id) ? 'opacity-50' : ''}`}
                        >
                          {togglingIds.has(todo.id) ? (
                            <svg
                              className="animate-spin w-4 h-4 text-indigo-600"
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
                            todo.status === 'completed' && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )
                          )}
                        </button>

                        <div className="flex-1">
                          {editingId === todo.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) =>
                                  setEditingTitle(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                                className="flex-1 px-3 py-1 text-lg border-2 border-indigo-500 rounded-lg focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={saveEdit}
                                className="p-1 text-green-500 hover:bg-green-50 rounded"
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
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <p
                              onDoubleClick={() =>
                                startEdit(todo.id, todo.title)
                              }
                              className={`text-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 py-1 -mx-2 rounded transition-colors ${todo.status === 'completed'
                                  ? 'text-gray-400 line-through'
                                  : 'text-gray-800 dark:text-gray-100'
                                }`}
                              title="双击编辑"
                            >
                              {todo.title}
                            </p>
                          )}
                          {/* 优先级标签 */}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {updatingIds.has(todo.id) ? (
                              <div className="flex items-center gap-1 text-xs text-indigo-500">
                                <svg
                                  className="animate-spin w-3 h-3"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                  />
                                </svg>
                                更新中...
                              </div>
                            ) : (
                              <>
                                <select
                                  value={todo.priority || 'medium'}
                                  onChange={(e) =>
                                    updatePriority(
                                      todo.id,
                                      e.target.value as
                                      | 'low'
                                      | 'medium'
                                      | 'high',
                                    )
                                  }
                                  className={`text-xs px-2 py-1 rounded-full border cursor-pointer ${priorityConfig[todo.priority || 'medium'].color}`}
                                >
                                  <option value="high">高优先级</option>
                                  <option value="medium">中优先级</option>
                                  <option value="low">低优先级</option>
                                </select>
                                {/* 截止日期 */}
                                <input
                                  type="date"
                                  value={todo.due_date || ''}
                                  onChange={(e) =>
                                    updateDueDate(
                                      todo.id,
                                      e.target.value || null,
                                    )
                                  }
                                  className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded cursor-pointer hover:border-indigo-300"
                                />
                                {todo.due_date &&
                                  (() => {
                                    const status = getDueDateStatus(
                                      todo.due_date,
                                    );
                                    return (
                                      status && (
                                        <span
                                          className={`text-xs px-2 py-0.5 rounded ${status.color}`}
                                        >
                                          {status.label}
                                        </span>
                                      )
                                    );
                                  })()}
                              </>
                            )}
                          </div>
                          {todo.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {todo.description}
                            </p>
                          )}
                          {subTasks.length > 0 && (
                            <button
                              onClick={() => toggleCollapse(todo.id)}
                              className="text-sm text-indigo-500 hover:text-indigo-700 mt-1 flex items-center gap-1"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${collapsedIds.has(todo.id) ? '' : 'rotate-90'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                              {completedSubTasks}/{subTasks.length}{' '}
                              个子任务已完成
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTask(todo.id)}
                          disabled={deletingIds.has(todo.id)}
                          className={`p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ${deletingIds.has(todo.id) ? 'opacity-50' : ''}`}
                        >
                          {deletingIds.has(todo.id) ? (
                            <svg
                              className="animate-spin w-5 h-5 text-red-500"
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
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              />
                            </svg>
                          ) : (
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* 子任务列表 */}
                      {subTasks.length > 0 && !collapsedIds.has(todo.id) && (
                        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-5 py-3">
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
                                  disabled={togglingIds.has(subTask.id)}
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${subTask.status === 'completed'
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-indigo-500'
                                    } ${togglingIds.has(subTask.id) ? 'opacity-50' : ''}`}
                                >
                                  {togglingIds.has(subTask.id) ? (
                                    <svg
                                      className="animate-spin w-3 h-3 text-indigo-600"
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
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                  ) : (
                                    subTask.status === 'completed' && (
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
                                    )
                                  )}
                                </button>
                                {editingId === subTask.id ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      value={editingTitle}
                                      onChange={(e) =>
                                        setEditingTitle(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') saveEdit();
                                        if (e.key === 'Escape') cancelEdit();
                                      }}
                                      className="flex-1 px-2 py-1 border-2 border-indigo-500 rounded focus:outline-none text-sm"
                                      autoFocus
                                    />
                                    <button
                                      onClick={saveEdit}
                                      className="p-1 text-green-500 hover:bg-green-50 rounded"
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
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="p-1 text-gray-400 hover:bg-gray-100 rounded"
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
                                ) : (
                                  <span
                                    onDoubleClick={() =>
                                      startEdit(subTask.id, subTask.title)
                                    }
                                    className={`flex-1 cursor-pointer hover:bg-gray-100 px-2 py-1 -mx-2 rounded transition-colors ${subTask.status === 'completed'
                                        ? 'text-gray-400 line-through'
                                        : 'text-gray-600'
                                      }`}
                                    title="双击编辑"
                                  >
                                    {subTask.title}
                                  </span>
                                )}
                                <button
                                  onClick={() => deleteTask(subTask.id)}
                                  disabled={deletingIds.has(subTask.id)}
                                  className={`p-1 text-gray-300 hover:text-red-500 transition-colors ${deletingIds.has(subTask.id) ? 'opacity-50' : ''}`}
                                >
                                  {deletingIds.has(subTask.id) ? (
                                    <svg
                                      className="animate-spin w-4 h-4 text-red-500"
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
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                      />
                                    </svg>
                                  ) : (
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
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* 流式 AI 聊天 Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* 聊天消息列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
              {chatMessages.length === 0 && !isChatting && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p>开始与 AI 对话吧</p>
                  </div>
                </div>
              )}

              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                    }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                      }`}
                  >
                    {message.role === 'user' && (
                      <div className="text-xs opacity-70 mb-1">你</div>
                    )}
                    {message.role === 'assistant' && (
                      <div className="text-xs text-indigo-500 mb-1">AI</div>
                    )}
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}

              {/* 当前正在生成的消息 */}
              {isChatting && !currentAssistantMessage && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    <div className="text-xs text-indigo-500 mb-1">AI</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {isChatting && currentAssistantMessage && (
                <div className="mb-4 flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    <div className="text-xs text-indigo-500 mb-1">AI</div>
                    <div className="whitespace-pre-wrap break-words">
                      {currentAssistantMessage}
                      <span className="animate-pulse">|</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 成本信息 */}
              {chatCost && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 bg-gray-50 dark:bg-gray-900 rounded-lg py-2">
                  {chatCost}
                </div>
              )}

              {/* 错误信息 */}
              {chatError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                  <div className="text-5xl mb-3">⚠️</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{chatError}</p>
                  <button
                    onClick={() => {
                      setChatError(null);
                      // 重新发送最后一条用户消息
                      if (chatMessages.length > 0) {
                        const lastMessage = chatMessages[chatMessages.length - 1];
                        if (lastMessage?.role === 'user') {
                          setChatInput(lastMessage.content);
                        }
                      }
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center gap-2"
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
                        d="M4 4v4M3 8h8m0 0l-4 4M3 12H4z"
                      />
                    </svg>
                    重试
                  </button>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="输入你的问题..."
                  className="flex-1 px-5 py-4 text-lg text-gray-800 dark:text-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                  disabled={isChatting}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatting}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isChatting ? (
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
                    </>
                  ) : (
                    <>
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
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                      发送
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 提示词生成 Tab */}
        {activeTab === 'prompt' && (
          <div className="space-y-6">
            {/* 输入区域 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    输入你的需求
                  </label>
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    placeholder="例如：写一个 Python 脚本，读取 CSV 文件并统计每列的平均值..."
                    rows={6}
                    className="w-full px-4 py-3 text-gray-800 dark:text-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    disabled={isEnhancing}
                  />
                </div>

                <button
                  onClick={enhancePromptWithAI}
                  disabled={!userPrompt.trim() || isEnhancing}
                  className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isEnhancing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                      AI 优化中...
                    </>
                  ) : (
                    <>
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
                      优化提示词
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 优化结果 */}
            {enhancedPrompt && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    优化后的提示词
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(enhancedPrompt);
                      alert('已复制到剪贴板');
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    复制
                  </button>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    {enhancedPrompt}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
