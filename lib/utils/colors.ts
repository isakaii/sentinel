import { CourseColor } from "@/lib/types";

export const courseColors: Record<CourseColor, { bg: string; text: string; border: string }> = {
  cardinal: {
    bg: "bg-red-100",
    text: "text-red-900",
    border: "border-red-500",
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

// Fallback colors for backward compatibility with old "purple" data
const legacyColorMap: Record<string, CourseColor> = {
  purple: "cardinal", // Map old purple to new cardinal
};

export const getCourseColorClasses = (color: CourseColor | string) => {
  // Handle legacy colors
  const mappedColor = legacyColorMap[color] || color;

  // Return the color classes, fallback to cardinal if not found
  return courseColors[mappedColor as CourseColor] || courseColors.cardinal;
};
