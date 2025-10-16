"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseList } from "@/components/courses/course-list";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { UploadSyllabusModal } from "@/components/courses/upload-syllabus-modal";
import { mockCourses } from "@/lib/data/mock";
import { Course, CourseColor } from "@/lib/types";

export default function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [uploadSyllabusCourseId, setUploadSyllabusCourseId] = useState<string | null>(null);

  const handleAddCourse = async (file: File, color: CourseColor) => {
    console.log("Uploading syllabus and extracting course info:", file.name);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const newCourse: Course = {
      id: String(courses.length + 1),
      userId: "1",
      courseName: "New Course from Syllabus",
      courseCode: "NEW 101",
      color,
      instructor: "Dr. Extracted",
      term: "Fall 2024",
      syllabusUploaded: true,
      eventsExtracted: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCourses([...courses, newCourse]);
  };

  const handleUploadSyllabus = async (file: File) => {
    console.log("Uploading syllabus:", file.name);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (uploadSyllabusCourseId) {
      setCourses(
        courses.map((course) =>
          course.id === uploadSyllabusCourseId
            ? { ...course, syllabusUploaded: true, eventsExtracted: 5 }
            : course
        )
      );
    }
  };

  const uploadCourse = courses.find((c) => c.id === uploadSyllabusCourseId);

  return (
    <DashboardLayout>
      <CourseList
        courses={courses}
        onAddCourse={() => setShowAddCourse(true)}
        onUploadSyllabus={setUploadSyllabusCourseId}
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
