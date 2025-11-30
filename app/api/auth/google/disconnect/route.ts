import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Clear Google tokens from user record
    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_refresh_token: null,
        google_access_token: null,
        google_token_expiry: null,
        google_calendar_connected: false
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error disconnecting Google:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Google account' },
        { status: 500 }
      );
    }

    // Also clear Google Calendar IDs from all courses
    const { error: coursesError } = await supabase
      .from('courses')
      .update({
        google_calendar_id: null,
        synced_to_google: false
      })
      .eq('user_id', user.id);

    if (coursesError) {
      console.error('Error clearing calendar IDs:', coursesError);
      // Don't fail the disconnect if this errors
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disconnecting Google:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google account' },
      { status: 500 }
    );
  }
}