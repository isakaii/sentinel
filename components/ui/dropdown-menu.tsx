"use client";

import { Fragment } from "react";
import { Menu, MenuButton, MenuItems, MenuItem, Transition } from "@headlessui/react";
import { cn } from "@/lib/utils/cn";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  triggerClassName?: string;
}

export function DropdownMenu({ trigger, children, align = "right", triggerClassName }: DropdownMenuProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className={cn("focus:outline-none", triggerClassName)}>
        {trigger}
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            "absolute z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            align === "left" ? "left-0" : "right-0"
          )}
        >
          {children}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  danger?: boolean;
}

export function DropdownMenuItem({ onClick, children, className, danger }: DropdownMenuItemProps) {
  return (
    <MenuItem>
      {({ active, close }) => (
        <button
          type="button"
          className={cn(
            "group flex w-full items-center px-4 py-2 text-sm",
            danger
              ? active
                ? "bg-red-100 text-red-900"
                : "text-red-600"
              : active
              ? "bg-gray-100 text-gray-900"
              : "text-gray-700",
            className
          )}
          onClick={() => {
            if (onClick) {
              onClick();
            }
            // Close menu after handler executes
            setTimeout(() => close(), 0);
          }}
        >
          {children}
        </button>
      )}
    </MenuItem>
  );
}

export function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div className="py-1">{children}</div>;
}