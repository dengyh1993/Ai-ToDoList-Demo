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
