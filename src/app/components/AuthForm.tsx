// src/app/components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        // 先尝试登录
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        // 如果登录失败（用户不存在），自动注册
        if (loginError) {
          // 尝试注册（使用 emailRedirectTo 跳过邮箱验证的等待）
          const { data: signUpData, error: signUpError } =
            await supabase.auth.signUp({
              email,
              password,
              options: {
                // 禁用邮箱验证重定向，直接获取 session
                emailRedirectTo: undefined,
              },
            });

          if (signUpError) throw signUpError;

          // 如果注册后直接返回了 session，说明不需要邮箱验证
          if (signUpData.session) {
            window.location.href = '/';
            return;
          }

          // 如果需要邮箱验证但用户信息已创建，尝试直接登录
          // （适用于 Supabase 禁用邮箱验证的情况）
          if (signUpData.user) {
            const { error: retryLoginError } =
              await supabase.auth.signInWithPassword({
                email,
                password,
              });

            // 如果还是需要邮箱验证，给用户友好提示
            if (retryLoginError) {
              if (retryLoginError.message.includes('Email not confirmed')) {
                throw new Error(
                  '账号已创建！请先查收验证邮件，点击链接后再登录。',
                );
              }
              throw retryLoginError;
            }
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

        // 如果注册后有 session，直接跳转
        if (data.session) {
          window.location.href = '/';
          return;
        }

        // 否则提示用户验证邮箱
        throw new Error('注册成功！请查收验证邮件，点击链接后再登录。');
      }
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? '处理中...' : mode === 'login' ? '登录 | 注册' : '注册'}
        </button>
      </form>
    </div>
  );
}
