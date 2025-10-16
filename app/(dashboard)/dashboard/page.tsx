"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NextDeadline } from "@/components/events/next-deadline";
import { ComingUpWeek } from "@/components/events/coming-up-week";
import { CourseList } from "@/components/courses/course-list";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { UploadSyllabusModal } from "@/components/courses/upload-syllabus-modal";
import { mockCourses, mockEvents } from "@/lib/data/mock";
import { Course, CourseColor } from "@/lib/types";

export default function DashboardPage() {
  const [courses, setCourses] = useState(mockCourses);
  const [events] = useState(mockEvents);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [uploadSyllabusCourseId, setUploadSyllabusCourseId] = useState<string | null>(null);

  // Get next deadline (first incomplete event)
  const nextEvent = events.filter((e) => !e.completed)[0];
  const nextEventCourse = courses.find((c) => c.id === nextEvent?.courseId);

  // Get upcoming events (next 3 incomplete events excluding the first one)
  const upcomingEvents = events.filter((e) => !e.completed).slice(1);

  const handleAddCourse = async (file: File, color: CourseColor) => {
    // Mock course extraction from PDF
    console.log("Uploading syllabus and extracting course info:", file.name);

    // Simulate upload and extraction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock extracted course data
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
    // Mock upload - in real implementation, this would call the API
    console.log("Uploading syllabus:", file.name);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update course to mark syllabus as uploaded
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
      <div className="space-y-8">
        {/* Welcome Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Isabella</h1>
          <p className="text-gray-600">Here's what's happening with your courses</p>
        </div>

        {/* Next Deadline */}
        {nextEvent && nextEventCourse && (
          <NextDeadline event={nextEvent} course={nextEventCourse} />
        )}

        {/* Coming Up This Week */}
        {upcomingEvents.length > 0 && (
          <ComingUpWeek events={upcomingEvents} courses={courses} />
        )}

        {/* Courses Section */}
        <CourseList
          courses={courses}
          onAddCourse={() => setShowAddCourse(true)}
          onUploadSyllabus={setUploadSyllabusCourseId}
        />

        {/* Modals */}
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
      </div>
    </DashboardLayout>
  );
}
