'use client'

import { useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Sentinel
          </h1>
          <p className="text-lg text-gray-600">
            Automated peace of mind for managing course syllabi and deadlines
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 pb-3 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 pb-3 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Upload your course syllabi and let AI extract all your deadlines automatically
        </p>
      </div>
    </div>
  )
}
