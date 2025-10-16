import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event, Course } from "@/lib/types";
import { formatEventDate, formatEventTime, formatRelativeDate } from "@/lib/utils/date";
import { getCourseColorClasses } from "@/lib/utils/colors";

interface NextDeadlineProps {
  event: Event;
  course: Course;
}

const eventIcons = {
  quiz: "❓",
  assignment: "📝",
  exam: "📄",
  reading: "📚",
  important_date: "📅",
};

export function NextDeadline({ event, course }: NextDeadlineProps) {
  const colorClasses = getCourseColorClasses(course.color);

  return (
    <Card className="overflow-hidden">
      <div className="bg-purple-50 px-6 py-3 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-purple-700">Next Deadline</p>
          <Clock className="h-4 w-4 text-purple-600" />
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 text-4xl">{eventIcons[event.type]}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={event.type}>{event.type}</Badge>
              <span className={`text-sm font-medium ${colorClasses.text}`}>
                {course.courseCode}
              </span>
            </div>
            {event.description && (
              <p className="text-gray-600 mb-3">{event.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatEventTime(event.time)}
                </span>
              )}
              {event.points && <span>{event.points}% of final grade</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Due {formatRelativeDate(event.date)}</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatEventDate(event.date)} at {formatEventTime(event.time || "23:59")}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
