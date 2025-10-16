import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event, Course } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/utils/date";
import { getCourseColorClasses } from "@/lib/utils/colors";

interface ComingUpWeekProps {
  events: Event[];
  courses: Course[];
}

const eventIcons = {
  quiz: "❓",
  assignment: "📝",
  exam: "📄",
  reading: "📚",
  important_date: "📅",
};

export function ComingUpWeek({ events, courses }: ComingUpWeekProps) {
  // Take only the first 3 upcoming events
  const upcomingEvents = events.slice(0, 3);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Coming up this week</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {upcomingEvents.map((event) => {
          const course = courses.find((c) => c.id === event.courseId);
          if (!course) return null;

          const colorClasses = getCourseColorClasses(course.color);

          return (
            <div
              key={event.id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="text-2xl">{eventIcons[event.type]}</div>
                <Badge variant={event.type} className="text-xs">
                  {event.type}
                </Badge>
              </div>

              <h3 className="mb-2 font-semibold text-gray-900 line-clamp-2">{event.title}</h3>

              <div className="mb-3">
                <span className={`text-sm font-medium ${colorClasses.text}`}>
                  {course.courseCode}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {formatEventDate(event.date)}, {formatEventTime(event.time || "23:59")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
