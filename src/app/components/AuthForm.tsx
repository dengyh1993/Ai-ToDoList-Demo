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
        // 先尝试登录
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        // 如果登录失败（用户不存在），自动注册
        if (loginError) {
          // 尝试注册（使用 emailRedirectTo 跳过邮箱验证的等待）
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              // 禁用邮箱验证重定向，直接获取 session
              emailRedirectTo: undefined,
            }
          })

          if (signUpError) throw signUpError

          // 如果注册后直接返回了 session，说明不需要邮箱验证
          if (signUpData.session) {
            window.location.href = '/'
            return
          }

          // 如果需要邮箱验证但用户信息已创建，尝试直接登录
          // （适用于 Supabase 禁用邮箱验证的情况）
          if (signUpData.user) {
            const { error: retryLoginError } = await supabase.auth.signInWithPassword({
              email,
              password,
            })

            // 如果还是需要邮箱验证，给用户友好提示
            if (retryLoginError) {
              if (retryLoginError.message.includes('Email not confirmed')) {
                throw new Error('账号已创建！请先查收验证邮件，点击链接后再登录。')
              }
              throw retryLoginError
            }
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        // 如果注册后有 session，直接跳转
        if (data.session) {
          window.location.href = '/'
          return
        }

        // 否则提示用户验证邮箱
        throw new Error('注册成功！请查收验证邮件，点击链接后再登录。')
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 placeholder:text-gray-400"
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors text-gray-900 placeholder:text-gray-400"
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
