import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCalendarEvents, deleteCalendarEvent } from '@/lib/google/calendar';
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

    // Get course details including Google Calendar ID
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

    if (!course.google_calendar_id) {
      return NextResponse.json(
        { error: 'No Google Calendar exists for this course. Create one first.' },
        { status: 400 }
      );
    }

    // Fetch all events for this course that haven't been synced
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('synced_to_calendar', false)
      .order('date', { ascending: true });

    if (eventsError) {
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new events to sync',
        eventsSynced: 0
      });
    }

    // Convert events to Google Calendar format
    const googleEvents = convertEventsToGoogleFormat(
      events,
      course.course_name,
      course.course_code
    );

    // Create events in Google Calendar
    const googleEventIds = await createCalendarEvents(
      userData.google_refresh_token,
      course.google_calendar_id,
      googleEvents
    );

    // Update events in database with their Google Calendar IDs
    let syncedCount = 0;
    for (let i = 0; i < events.length && i < googleEventIds.length; i++) {
      if (googleEventIds[i]) {
        const { error: updateError } = await supabase
          .from('events')
          .update({
            synced_to_calendar: true,
            google_calendar_event_id: googleEventIds[i]
          })
          .eq('id', events[i].id);

        if (!updateError) {
          syncedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsSynced: syncedCount,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Error syncing events to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync events to Google Calendar' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove events from Google Calendar
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

    if (courseError || !course || !course.google_calendar_id) {
      return NextResponse.json(
        { error: 'Course or calendar not found' },
        { status: 404 }
      );
    }

    // Get all synced events for this course
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, google_calendar_event_id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('synced_to_calendar', true)
      .not('google_calendar_event_id', 'is', null);

    if (events && events.length > 0) {
      // Remove events from Google Calendar
      for (const event of events) {
        if (event.google_calendar_event_id) {
          try {
            await deleteCalendarEvent(
              userData.google_refresh_token,
              course.google_calendar_id,
              event.google_calendar_event_id
            );

            // Update database to reflect removal from calendar
            await supabase
              .from('events')
              .update({
                synced_to_calendar: false,
                google_calendar_event_id: null
              })
              .eq('id', event.id);
          } catch (deleteError) {
            console.error(`Failed to delete event ${event.id} from Google Calendar:`, deleteError);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsRemoved: events?.length || 0
    });
  } catch (error) {
    console.error('Error removing events from Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to remove events from Google Calendar' },
      { status: 500 }
    );
  }
}