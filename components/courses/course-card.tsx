"use client";

import { FileText, MoreVertical, Upload, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Course } from "@/lib/types";
import { getCourseColorClasses } from "@/lib/utils/colors";
import { cn } from "@/lib/utils/cn";

interface CourseCardProps {
  course: Course;
  onUploadSyllabus?: () => void;
}

export function CourseCard({ course, onUploadSyllabus }: CourseCardProps) {
  const colorClasses = getCourseColorClasses(course.color);
  const progress = course.eventsExtracted > 0
    ? Math.min((course.eventsExtracted / 10) * 100, 100)
    : 0;

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
              <p className="text-sm text-gray-600">{course.courseName}</p>
            </div>
          </div>
          <button className="rounded-lg p-1 hover:bg-white/50 transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Instructor */}
        {course.instructor && (
          <div>
            <p className="text-sm text-gray-500">Instructor</p>
            <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
          </div>
        )}

        {/* Syllabus Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {course.syllabusUploaded
                  ? `${course.eventsExtracted} events extracted`
                  : "No syllabus uploaded"}
              </span>
            </div>
            {course.syllabusUploaded && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" />
                Synced
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {course.syllabusUploaded && (
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all",
                  colorClasses.bg.replace("100", "500")
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Upload Button */}
        {!course.syllabusUploaded && onUploadSyllabus && (
          <button
            onClick={onUploadSyllabus}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Syllabus
          </button>
        )}

        {/* Progress Label */}
        {course.syllabusUploaded && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Progress</span>
            <span>{course.eventsExtracted}/10</span>
          </div>
        )}
      </div>
    </Card>
  );
}
