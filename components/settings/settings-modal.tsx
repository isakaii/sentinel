'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/contexts/ThemeContext'
import { ThemePreference, NotificationTiming } from '@/lib/types'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const themeOptions: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
]

const notificationOptions: { value: NotificationTiming; label: string }[] = [
  { value: '1_day', label: '1 day before' },
  { value: '3_days', label: '3 days before' },
  { value: '1_week', label: '1 week before' },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme()
  const [notificationTiming, setNotificationTiming] = useState<NotificationTiming[]>(['1_day'])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // Fetch user preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPreferences()
      checkGoogleStatus()
    }
  }, [isOpen])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences')
      if (response.ok) {
        const data = await response.json()
        setNotificationTiming(data.notificationTiming || ['1_day'])
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkGoogleStatus = async () => {
    try {
      const response = await fetch('/api/auth/google/status')
      if (response.ok) {
        const data = await response.json()
        setGoogleConnected(data.connected && data.valid)
      }
    } catch (error) {
      console.error('Error checking Google status:', error)
    }
  }

  const handleThemeChange = async (newTheme: ThemePreference) => {
    setTheme(newTheme)
    // Save to database
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themePreference: newTheme }),
      })
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  const handleNotificationChange = async (timing: NotificationTiming) => {
    const newTiming = notificationTiming.includes(timing)
      ? notificationTiming.filter((t) => t !== timing)
      : [...notificationTiming, timing]

    setNotificationTiming(newTiming)

    // Save to database
    try {
      await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationTiming: newTiming }),
      })
    } catch (error) {
      console.error('Error saving notification preferences:', error)
    }
  }

  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/google'
  }

  const handleGoogleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Calendar?')) {
      return
    }

    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
      })
      if (response.ok) {
        setGoogleConnected(false)
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" className="dark:bg-gray-800">
      <div className="space-y-6">
        {/* Appearance Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Appearance</h3>
          <div className="flex gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  theme === option.value
                    ? 'border-red-700 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Deadline Reminders</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Show notifications for deadlines:</p>
          <div className="space-y-2">
            {notificationOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    notificationTiming.includes(option.value)
                      ? 'border-red-700 bg-red-700'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  onClick={() => handleNotificationChange(option.value)}
                >
                  {notificationTiming.includes(option.value) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Google Calendar Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Google Calendar</h3>
          <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {googleConnected ? 'Connected' : 'Not connected'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {googleConnected
                    ? 'Events sync to your Google Calendar'
                    : 'Connect to sync events'}
                </p>
              </div>
            </div>
            {googleConnected ? (
              <Button
                onClick={handleGoogleDisconnect}
                variant="secondary"
                size="sm"
                disabled={isDisconnecting}
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            ) : (
              <Button onClick={handleGoogleConnect} variant="primary" size="sm">
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
