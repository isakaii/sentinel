"use client";

import { Calendar, Settings, Bell, LogOut } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-700">
              <span className="text-lg font-bold text-white">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Sentinel</h1>
            <span className="text-sm text-gray-500">
              Good afternoon, {userName} 👋
            </span>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Notification Icon */}
            <button
              className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
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
              <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {userInitial}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
