"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "./course-card";
import { Course } from "@/lib/types";

interface CourseListProps {
  courses: Course[];
  onAddCourse?: () => void;
  onUploadSyllabus?: (courseId: string) => void;
  onDeleteCourse?: (courseId: string) => void;
}

export function CourseList({ courses, onAddCourse, onUploadSyllabus, onDeleteCourse }: CourseListProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        {onAddCourse && (
          <Button onClick={onAddCourse} size="md">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500 mb-4">No courses yet</p>
          {onAddCourse && (
            <Button onClick={onAddCourse} variant="secondary">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Course
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onUploadSyllabus={() => onUploadSyllabus?.(course.id)}
              onDelete={() => onDeleteCourse?.(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
