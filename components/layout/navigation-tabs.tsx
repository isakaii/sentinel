"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3x3, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const tabs = [
  {
    name: "Courses",
    href: "/dashboard",
    icon: Grid3x3,
  },
  {
    name: "Event Timeline",
    href: "/events",
    icon: Calendar,
  },
];

export function NavigationTabs() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors",
                  isActive
                    ? "border-red-700 text-red-700 dark:text-red-400 dark:border-red-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
