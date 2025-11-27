import {
  format,
  formatDistanceToNow,
  isPast,
  isToday,
  isTomorrow,
  isThisWeek,
  parseISO,
  isAfter,
  isBefore,
  addDays,
  startOfDay,
  endOfDay
} from "date-fns";

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

/**
 * Check if a date is today or in the future
 */
export function isUpcoming(dateString: string): boolean {
  const eventDate = startOfDay(parseISO(dateString));
  const today = startOfDay(new Date());
  return isAfter(eventDate, today) || isToday(eventDate);
}

/**
 * Check if a date is within the next 7 days (including today)
 */
export function isWithinNextWeek(dateString: string): boolean {
  const eventDate = startOfDay(parseISO(dateString));
  const today = startOfDay(new Date());
  const weekFromNow = endOfDay(addDays(today, 7));

  return (isAfter(eventDate, today) || isToday(eventDate)) && isBefore(eventDate, weekFromNow);
}

/**
 * Get days until an event (negative if past)
 */
export function getDaysUntil(dateString: string): number {
  const eventDate = startOfDay(parseISO(dateString));
  const today = startOfDay(new Date());
  const diffTime = eventDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
