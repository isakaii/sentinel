"use client";

import { FileText, MoreVertical, Upload, Check, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Course } from "@/lib/types";
import { getCourseColorClasses } from "@/lib/utils/colors";
import { cn } from "@/lib/utils/cn";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface CourseCardProps {
  course: Course;
  onUploadSyllabus?: () => void;
  onDelete?: () => void;
}

export function CourseCard({ course, onUploadSyllabus, onDelete }: CourseCardProps) {
  const colorClasses = getCourseColorClasses(course.color);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Course Code Badge */}
      <div className={cn("px-6 pt-6 pb-3", colorClasses.bg)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("rounded-lg p-2", colorClasses.bg)}>
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center font-bold text-lg",
                colorClasses.bg.replace("100", "200"),
                colorClasses.text
              )}>
                {course.courseCode.substring(0, 2)}
              </div>
            </div>
            <div>
              <h3 className={cn("font-bold text-lg", colorClasses.text)}>
                {course.courseCode}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{course.courseName}</p>
            </div>
          </div>
          <DropdownMenu
            trigger={<MoreVertical className="h-5 w-5 text-gray-600" />}
            triggerClassName="rounded-lg p-1 hover:bg-white/50 transition-colors"
          >
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={onDelete} danger>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Instructor */}
        {course.instructor && (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Instructor</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.instructor}</p>
          </div>
        )}

        {/* Syllabus Status */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {course.syllabusUploaded
                  ? "Syllabus uploaded"
                  : "No syllabus uploaded"}
              </span>
            </div>
            {course.syllabusUploaded && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="h-3 w-3" />
                Synced
              </span>
            )}
          </div>
        </div>

        {/* Events Count Badge */}
        {course.syllabusUploaded && course.eventsExtracted > 0 && (
          <div className={cn(
            "rounded-lg px-4 py-3 flex items-center justify-between",
            colorClasses.bg
          )}>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Calendar Events</span>
            <span className={cn(
              "text-2xl font-bold",
              colorClasses.text
            )}>
              {course.eventsExtracted}
            </span>
          </div>
        )}

        {/* Upload Button */}
        {!course.syllabusUploaded && onUploadSyllabus && (
          <button
            onClick={onUploadSyllabus}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700"
          >
            <Upload className="h-4 w-4" />
            Upload Syllabus
          </button>
        )}
      </div>
    </Card>
  );
}
