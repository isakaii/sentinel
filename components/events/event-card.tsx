"use client";

import { Clock, MapPin, FileText, Trash2, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event, Course } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/utils/date";
import { getCourseColorClasses } from "@/lib/utils/colors";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EventCardProps {
  event: Event;
  course: Course;
  onDelete?: () => void;
}

const eventIcons = {
  quiz: "❓",
  assignment: "📝",
  exam: "📄",
  reading: "📚",
  important_date: "📅",
};

export function EventCard({ event, course, onDelete }: EventCardProps) {
  const colorClasses = getCourseColorClasses(course.color);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {/* Event Icon */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center text-2xl">
            {eventIcons[event.type]}
          </div>
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
            <div className="flex items-center gap-2">
              <Badge variant={event.type}>{event.type}</Badge>
              {onDelete && (
                <DropdownMenu
                  trigger={<MoreVertical className="h-4 w-4 text-gray-600" />}
                  triggerClassName="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onDelete} danger>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-medium ${colorClasses.text}`}>
              {course.courseCode}
            </span>
            <span className="text-sm text-gray-500">{course.courseName}</span>
          </div>

          {event.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {event.time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatEventTime(event.time)}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{event.location}</span>
              </div>
            )}
            {event.points && (
              <div className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                <span>{event.points} points</span>
              </div>
            )}
          </div>
        </div>

        {/* Due Date */}
        <div className="flex-shrink-0 text-right">
          <p className="text-xs text-gray-500 mb-1">Due</p>
          <p className="text-sm font-medium text-gray-900">{formatEventDate(event.date)}</p>
        </div>
      </div>
    </Card>
  );
}
