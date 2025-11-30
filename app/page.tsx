'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
              Sentinel
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Automated peace of mind for managing course syllabi and deadlines
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-red-700 border-b-2 border-red-700 dark:text-red-400 dark:border-red-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 pb-3 text-center font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'text-red-700 border-b-2 border-red-700 dark:text-red-400 dark:border-red-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Sign Up
              </button>
            </div>

            {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Upload your course syllabi and let AI extract all your deadlines automatically
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Sentinel. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
