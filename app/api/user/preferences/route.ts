import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/user/preferences - Get current user preferences
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('theme_preference, notification_timing, google_calendar_connected')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user preferences:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      themePreference: userData?.theme_preference || 'system',
      notificationTiming: userData?.notification_timing || ['1_day'],
      googleCalendarConnected: userData?.google_calendar_connected || false,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/user/preferences - Update user preferences
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { themePreference, notificationTiming } = body

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {}

    if (themePreference !== undefined) {
      const validThemes = ['light', 'dark', 'system']
      if (!validThemes.includes(themePreference)) {
        return NextResponse.json(
          { error: 'Invalid theme preference' },
          { status: 400 }
        )
      }
      updates.theme_preference = themePreference
    }

    if (notificationTiming !== undefined) {
      const validTimings = ['1_day', '3_days', '1_week']
      if (!Array.isArray(notificationTiming)) {
        return NextResponse.json(
          { error: 'notificationTiming must be an array' },
          { status: 400 }
        )
      }
      if (!notificationTiming.every((t: string) => validTimings.includes(t))) {
        return NextResponse.json(
          { error: 'Invalid notification timing values' },
          { status: 400 }
        )
      }
      updates.notification_timing = notificationTiming
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating preferences:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
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
