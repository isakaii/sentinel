import { CourseColor } from "@/lib/types";

export const courseColors: Record<CourseColor, { bg: string; text: string; border: string }> = {
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  pink: {
    bg: "bg-pink-100",
    text: "text-pink-700",
    border: "border-pink-300",
  },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    border: "border-indigo-300",
  },
  teal: {
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-300",
  },
};

export const getCourseColorClasses = (color: CourseColor) => courseColors[color];
