"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EventTimeline } from "@/components/events/event-timeline";
import { mockCourses, mockEvents } from "@/lib/data/mock";

export default function EventsPage() {
  const [events] = useState(mockEvents);
  const [courses] = useState(mockCourses);

  return (
    <DashboardLayout>
      <EventTimeline events={events} courses={courses} />
    </DashboardLayout>
  );
}
