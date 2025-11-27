"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EventTimeline } from "@/components/events/event-timeline";
import { EditEventModal } from "@/components/events/edit-event-modal";
import { Course, Event } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete event');
      }

      await fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const handleToggleComplete = async (eventId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }

      // Optimistically update local state
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, completed } : e))
      );
    } catch (error) {
      console.error('Error toggling completion:', error);
      alert('Failed to update event. Please try again.');
      // Refetch to ensure consistency
      await fetchData();
    }
  };

  const handleEditEvent = async (eventId: string, updates: Partial<Event>) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update event');
      }

      // Refresh data to get updated event
      await fetchData();
    } catch (error) {
      console.error('Error editing event:', error);
      throw error; // Re-throw so modal can handle it
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <EventTimeline
        events={events}
        courses={courses}
        onDeleteEvent={handleDeleteEvent}
        onToggleComplete={handleToggleComplete}
        onEditEvent={setEditingEvent}
      />

      {editingEvent && (
        <EditEventModal
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          onSave={handleEditEvent}
        />
      )}
    </DashboardLayout>
  );
}
