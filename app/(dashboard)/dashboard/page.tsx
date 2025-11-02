"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { NextDeadline } from "@/components/events/next-deadline";
import { ComingUpWeek } from "@/components/events/coming-up-week";
import { CourseList } from "@/components/courses/course-list";
import { AddCourseModal } from "@/components/courses/add-course-modal";
import { UploadSyllabusModal } from "@/components/courses/upload-syllabus-modal";
import { Course, Event, CourseColor } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [uploadSyllabusCourseId, setUploadSyllabusCourseId] = useState<string | null>(null);

  // Fetch courses and events on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, eventsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/events'),
      ]);

      if (coursesRes.ok) {
        const { courses: fetchedCourses } = await coursesRes.json();
        setCourses(fetchedCourses || []);
      }

      if (eventsRes.ok) {
        const { events: fetchedEvents } = await eventsRes.json();
        setEvents(fetchedEvents || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get next deadline (first incomplete event)
  const nextEvent = events.filter((e) => !e.completed)[0];
  const nextEventCourse = courses.find((c) => c.id === nextEvent?.courseId);

  // Get upcoming events (next 3 incomplete events excluding the first one)
  const upcomingEvents = events.filter((e) => !e.completed).slice(1);

  const handleAddCourse = async (file: File, color: CourseColor) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/syllabi/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload syllabus');
      }

      const { course: newCourse, events: newEvents } = await response.json();

      // Update the color if different from what was extracted
      if (color !== newCourse.color) {
        await fetch(`/api/courses/${newCourse.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ color }),
        });
        newCourse.color = color;
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error adding course:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload syllabus');
    }
  };

  const handleUploadSyllabus = async (file: File) => {
    try {
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
        throw new Error(error.error || 'Failed to upload syllabus');
      }

      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error uploading syllabus:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload syllabus');
    }
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

      await fetchData();
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const uploadCourse = courses.find((c) => c.id === uploadSyllabusCourseId);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Message */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}</h1>
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
          onDeleteCourse={handleDeleteCourse}
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
