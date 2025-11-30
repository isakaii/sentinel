'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import { Event, Course, NotificationTiming } from '@/lib/types'

interface UpcomingDeadline {
  id: string
  title: string
  courseName: string
  courseColor: string
  date: string
  type: string
  daysUntil: number
}

function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const eventDate = new Date(dateString)
  eventDate.setHours(0, 0, 0, 0)
  const diffTime = eventDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationTiming, setNotificationTiming] = useState<NotificationTiming[]>(['1_day'])
  const [events, setEvents] = useState<Event[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prefsRes, eventsRes, coursesRes] = await Promise.all([
          fetch('/api/user/preferences'),
          fetch('/api/events'),
          fetch('/api/courses'),
        ])

        if (prefsRes.ok) {
          const prefsData = await prefsRes.json()
          setNotificationTiming(prefsData.notificationTiming || ['1_day'])
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json()
          setEvents(eventsData.events || [])
        }

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json()
          setCourses(coursesData.courses || [])
        }
      } catch (error) {
        console.error('Error fetching notification data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get course name and color by ID
  const getCourseInfo = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId)
    return {
      name: course?.courseCode || 'Unknown',
      color: course?.color || 'gray',
    }
  }

  // Filter and calculate upcoming deadlines
  const getMaxDays = (): number => {
    if (notificationTiming.includes('1_week')) return 7
    if (notificationTiming.includes('3_days')) return 3
    if (notificationTiming.includes('1_day')) return 1
    return 7 // Default to show all within a week
  }

  const upcomingDeadlines: UpcomingDeadline[] = events
    .filter((event) => {
      if (event.completed) return false
      const daysUntil = getDaysUntil(event.date)
      return daysUntil >= 0 && daysUntil <= getMaxDays()
    })
    .map((event) => {
      const courseInfo = getCourseInfo(event.courseId)
      return {
        id: event.id,
        title: event.title,
        courseName: courseInfo.name,
        courseColor: courseInfo.color,
        date: event.date,
        type: event.type,
        daysUntil: getDaysUntil(event.date),
      }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)

  const count = upcomingDeadlines.length

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil === 0) return 'text-red-600 dark:text-red-400'
    if (daysUntil === 1) return 'text-orange-600 dark:text-orange-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getUrgencyLabel = (daysUntil: number): string => {
    if (daysUntil === 0) return 'Today'
    if (daysUntil === 1) return 'Tomorrow'
    return `In ${daysUntil} days`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Upcoming Deadlines
            </h3>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {upcomingDeadlines.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  All caught up!
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  No upcoming deadlines
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingDeadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {deadline.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full bg-course-${deadline.courseColor}`}
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {deadline.courseName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-medium ${getUrgencyColor(deadline.daysUntil)}`}>
                          {getUrgencyLabel(deadline.daysUntil)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {formatDate(deadline.date)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {upcomingDeadlines.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Showing deadlines within {getMaxDays()} day{getMaxDays() > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
