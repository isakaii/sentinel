import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { EventType } from "@/lib/types";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: EventType | "default" | "success" | "warning";
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          {
            "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200": variant === "default",
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400": variant === "success" || variant === "assignment" || variant === "reading",
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400": variant === "warning" || variant === "quiz",
            "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400": variant === "exam",
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400": variant === "important_date",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
