"use client";

import { Clock, MapPin, FileText, Trash2, MoreVertical, Check, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Event, Course } from "@/lib/types";
import { formatEventDate, formatEventTime } from "@/lib/utils/date";
import { getCourseColorClasses } from "@/lib/utils/colors";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface EventCardProps {
  event: Event;
  course: Course;
  onDelete?: () => void;
  onToggleComplete?: (completed: boolean) => void;
  onEdit?: () => void;
}

const eventIcons = {
  quiz: "❓",
  assignment: "📝",
  exam: "📄",
  reading: "📚",
  important_date: "📅",
};

export function EventCard({ event, course, onDelete, onToggleComplete, onEdit }: EventCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const colorClasses = getCourseColorClasses(course.color);

  const handleToggleComplete = async () => {
    if (!onToggleComplete || isToggling) return;

    setIsToggling(true);
    try {
      await onToggleComplete(!event.completed);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${event.completed ? 'bg-gray-50' : ''}`}>
      <div className="flex gap-3">
        {/* Completion Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <button
            onClick={handleToggleComplete}
            disabled={isToggling || !onToggleComplete}
            className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
              event.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-500'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
              !onToggleComplete ? 'cursor-default' : ''
            }`}
          >
            {event.completed && <Check className="h-3 w-3 text-white" />}
          </button>
        </div>

        {/* Event Icon */}
        <div className="flex-shrink-0">
          <div className={`flex h-10 w-10 items-center justify-center text-2xl ${event.completed ? 'opacity-50' : ''}`}>
            {eventIcons[event.type]}
          </div>
        </div>

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-semibold truncate ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {event.title}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={event.type}>{event.type}</Badge>
              {(onDelete || onEdit) && (
                <DropdownMenu
                  trigger={<MoreVertical className="h-4 w-4 text-gray-600" />}
                  triggerClassName="rounded-lg p-1 hover:bg-gray-100 transition-colors"
                >
                  <DropdownMenuGroup>
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem onClick={onDelete} danger>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Event
                      </DropdownMenuItem>
                    )}
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
