import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/events - Get all events for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const completed = searchParams.get('completed')

    let query = supabase
      .from('events')
      .select('*, courses(*)')
      .eq('user_id', user.id)
      .order('date', { ascending: true })

    // Apply filters
    if (courseId) {
      query = query.eq('course_id', courseId)
    }
    if (completed !== null) {
      query = query.eq('completed', completed === 'true')
    }

    const { data: eventsData, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase
    const events = eventsData?.map((event: any) => ({
      id: event.id,
      courseId: event.course_id,
      userId: event.user_id,
      type: event.type,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      points: event.points,
      submissionMethod: event.submission_method,
      coverage: event.coverage,
      completed: event.completed,
      syncedToCalendar: event.synced_to_calendar,
      googleCalendarEventId: event.google_calendar_event_id,
      confidence: event.confidence,
      createdAt: event.created_at,
      updatedAt: event.updated_at,
    })) || []

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
