"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseList } from "@/components/courses/course-list";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { UploadSyllabusModal } from "@/components/courses/upload-syllabus-modal";
import { Course, CourseColor } from "@/lib/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [uploadSyllabusCourseId, setUploadSyllabusCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses');
      if (response.ok) {
        const { courses: fetchedCourses } = await response.json();
        setCourses(fetchedCourses || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (file: File, color: CourseColor) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/syllabi/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Failed to upload syllabus');
    }

    const { course: newCourse } = await response.json();

    // Update the color if different
    if (color !== newCourse.color) {
      await fetch(`/api/courses/${newCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color }),
      });
    }

    await fetchCourses();
    setShowAddCourse(false);
  };

  const handleUploadSyllabus = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    if (uploadSyllabusCourseId) {
      formData.append('courseId', uploadSyllabusCourseId);
    }

    const response = await fetch('/api/syllabi/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.details || 'Failed to upload syllabus');
    }

    await fetchCourses();
    setUploadSyllabusCourseId(null);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This will also delete all associated events.')) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete course');
      }

      await fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const uploadCourse = courses.find((c) => c.id === uploadSyllabusCourseId);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <CourseList
        courses={courses}
        onAddCourse={() => setShowAddCourse(true)}
        onUploadSyllabus={setUploadSyllabusCourseId}
        onDeleteCourse={handleDeleteCourse}
      />

      <AddCourseModal
        isOpen={showAddCourse}
        onClose={() => setShowAddCourse(false)}
        onUpload={handleAddCourse}
      />

      {uploadCourse && (
        <UploadSyllabusModal
          isOpen={!!uploadSyllabusCourseId}
          onClose={() => setUploadSyllabusCourseId(null)}
          courseCode={uploadCourse.courseCode}
          onUpload={handleUploadSyllabus}
        />
      )}
    </DashboardLayout>
  );
}
