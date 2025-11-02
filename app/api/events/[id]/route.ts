import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PATCH /api/events/[id] - Update an event
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updates: any = {}

    // Only include fields that are provided
    if (body.completed !== undefined) updates.completed = body.completed
    if (body.title !== undefined) updates.title = body.title
    if (body.description !== undefined) updates.description = body.description
    if (body.date !== undefined) updates.date = body.date
    if (body.time !== undefined) updates.time = body.time

    const { data: eventData, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error || !eventData) {
      return NextResponse.json(
        { error: 'Failed to update event' },
        { status: 500 }
      )
    }

    // Transform to camelCase
    const event = {
      id: eventData.id,
      courseId: eventData.course_id,
      userId: eventData.user_id,
      type: eventData.type,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      time: eventData.time,
      location: eventData.location,
      points: eventData.points,
      submissionMethod: eventData.submission_method,
      coverage: eventData.coverage,
      completed: eventData.completed,
      syncedToCalendar: eventData.synced_to_calendar,
      googleCalendarEventId: eventData.google_calendar_event_id,
      confidence: eventData.confidence,
      createdAt: eventData.created_at,
      updatedAt: eventData.updated_at,
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
