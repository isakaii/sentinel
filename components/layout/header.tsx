"use client";

import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { GoogleConnectionButton } from "@/components/google/google-connection-button";
import { NotificationBell } from "@/components/layout/notification-bell";
import { SettingsModal } from "@/components/settings/settings-modal";

export function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <>
      <header className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-700">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sentinel</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Good afternoon, {userName}
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Google Calendar Connection */}
              <GoogleConnectionButton />

              {/* Notification Bell */}
              <NotificationBell />

              {/* Settings Icon */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* User Info */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-red-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {userInitial}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Sign Out"
              >
                <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}
