"use client";

import { Calendar, Settings, Bell } from "lucide-react";
import { mockUser } from "@/lib/data/mock";

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sentinel</h1>
            <span className="text-sm text-gray-500">
              Good afternoon, {mockUser.name} 👋
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Google Calendar Connected Badge */}
            {mockUser.googleCalendarConnected && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                <Calendar className="h-4 w-4" />
                <span>Google Calendar Connected</span>
              </div>
            )}

            {/* Notification Icon */}
            <button
              className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Settings Icon */}
            <button
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>

            {/* User Info */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {mockUser.name?.charAt(0) || "U"}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{mockUser.name}</p>
                <p className="text-xs text-gray-500">{mockUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
