import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCalendar, deleteCalendar, createCalendarEvents } from '@/lib/google/calendar';
import { convertEventsToGoogleFormat } from '@/lib/google/event-converter';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's Google refresh token
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.google_refresh_token) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      );
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .eq('user_id', user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if calendar already exists
    if (course.google_calendar_id) {
      return NextResponse.json(
        { error: 'Calendar already exists for this course' },
        { status: 400 }
      );
    }

    // Create Google Calendar for the course
    const calendar = await createCalendar(
      userData.google_refresh_token,
      course.course_name,
      course.course_code,
      course.color
    );

    // Update course with calendar ID
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        google_calendar_id: calendar.id,
        synced_to_google: true
      })
      .eq('id', courseId);

    if (updateError) {
      // Try to delete the created calendar if update fails
      try {
        await deleteCalendar(userData.google_refresh_token, calendar.id);
      } catch (deleteError) {
        console.error('Failed to delete calendar after update error:', deleteError);
      }

      throw updateError;
    }

    // Fetch events for this course to sync them to Google Calendar
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    let syncedEventCount = 0;
    let googleEventIds: string[] = [];

    if (events && events.length > 0) {
      try {
        // Convert events to Google Calendar format
        const googleEvents = convertEventsToGoogleFormat(
          events,
          course.course_name,
          course.course_code
        );

        // Create events in Google Calendar
        googleEventIds = await createCalendarEvents(
          userData.google_refresh_token,
          calendar.id,
          googleEvents
        );

        syncedEventCount = googleEventIds.length;

        // Update events in database with their Google Calendar IDs
        for (let i = 0; i < events.length && i < googleEventIds.length; i++) {
          if (googleEventIds[i]) {
            await supabase
              .from('events')
              .update({
                synced_to_calendar: true,
                google_calendar_event_id: googleEventIds[i]
              })
              .eq('id', events[i].id);
          }
        }

        console.log(`Successfully synced ${syncedEventCount} events to Google Calendar`);
      } catch (syncError) {
        console.error('Error syncing events to Google Calendar:', syncError);
        // Don't fail the whole request if event sync fails
      }
    }

    return NextResponse.json({
      success: true,
      calendarId: calendar.id,
      eventsSynced: syncedEventCount
    });
  } catch (error) {
    console.error('Error creating Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to create Google Calendar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user's Google refresh token
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('google_refresh_token')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.google_refresh_token) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      );
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('google_calendar_id')
      .eq('id', courseId)
      .eq('user_id', user.id)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    if (!course.google_calendar_id) {
      return NextResponse.json(
        { error: 'No calendar exists for this course' },
        { status: 400 }
      );
    }

    // Delete Google Calendar
    await deleteCalendar(userData.google_refresh_token, course.google_calendar_id);

    // Update course to remove calendar ID
    const { error: updateError } = await supabase
      .from('courses')
      .update({
        google_calendar_id: null,
        synced_to_google: false
      })
      .eq('id', courseId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to delete Google Calendar' },
      { status: 500 }
    );
  }
}