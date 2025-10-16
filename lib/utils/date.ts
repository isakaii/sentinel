import { format, formatDistanceToNow, isPast, isToday, isTomorrow, isThisWeek, parseISO } from "date-fns";

export function formatEventDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isTomorrow(date)) {
    return "Tomorrow";
  }

  if (isThisWeek(date)) {
    return format(date, "EEEE"); // Day name
  }

  return format(date, "MMM d, yyyy");
}

export function formatEventTime(timeString?: string): string {
  if (!timeString) return "";

  try {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const isPM = hour >= 12;
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${isPM ? "PM" : "AM"}`;
  } catch {
    return timeString;
  }
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function isOverdue(dateString: string): boolean {
  return isPast(parseISO(dateString));
}
