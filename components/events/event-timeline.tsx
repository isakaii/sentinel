"use client";

import { useState } from "react";
import { List, Grid3x3 } from "lucide-react";
import { Event, Course } from "@/lib/types";
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatEventDate } from "@/lib/utils/date";

interface EventTimelineProps {
  events: Event[];
  courses: Course[];
  onDeleteEvent?: (eventId: string) => void;
  onToggleComplete?: (eventId: string, completed: boolean) => void;
  onEditEvent?: (event: Event) => void;
}

type ViewMode = "chronological" | "by-course";

export function EventTimeline({ events, courses, onDeleteEvent, onToggleComplete, onEditEvent }: EventTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("chronological");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (filterCourse !== "all" && event.courseId !== filterCourse) return false;
    if (filterType !== "all" && event.type !== filterType) return false;
    if (!showCompleted && event.completed) return false;
    return true;
  });

  // Group events
  const groupedEvents =
    viewMode === "chronological"
      ? groupByDate(filteredEvents)
      : groupByCourse(filteredEvents, courses);

  // Course options for filter
  const courseOptions = [
    { value: "all", label: "All Courses" },
    ...courses.map((course) => ({
      value: course.id,
      label: course.courseCode,
    })),
  ];

  // Event type options for filter
  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "assignment", label: "Assignment" },
    { value: "exam", label: "Exam" },
    { value: "quiz", label: "Quiz" },
    { value: "reading", label: "Reading" },
    { value: "important_date", label: "Important Date" },
  ];

  return (
    <div>
      {/* Header and Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Timeline</h2>

          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "chronological" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("chronological")}
            >
              <List className="mr-2 h-4 w-4" />
              Chronological
            </Button>
            <Button
              variant={viewMode === "by-course" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("by-course")}
            >
              <Grid3x3 className="mr-2 h-4 w-4" />
              By Course
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <Select
            options={courseOptions}
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          />
          <Select
            options={typeOptions}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-800"
            />
            Show completed
          </label>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">No events found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedEvents).map(([group, groupEvents]) => (
            <div key={group}>
              <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">{group}</h3>
              <div className="space-y-3">
                {groupEvents.map((event) => {
                  const course = courses.find((c) => c.id === event.courseId)!;
                  return (
                    <EventCard
                      key={event.id}
                      event={event}
                      course={course}
                      onDelete={() => onDeleteEvent?.(event.id)}
                      onToggleComplete={(completed) => onToggleComplete?.(event.id, completed)}
                      onEdit={() => onEditEvent?.(event)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper functions
function groupByDate(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};

  events.forEach((event) => {
    const date = formatEventDate(event.date);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });

  return grouped;
}

function groupByCourse(events: Event[], courses: Course[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};

  courses.forEach((course) => {
    const courseEvents = events.filter((e) => e.courseId === course.id);
    if (courseEvents.length > 0) {
      grouped[`${course.courseCode} - ${course.courseName}`] = courseEvents;
    }
  });

  return grouped;
}
