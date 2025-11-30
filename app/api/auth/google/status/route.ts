import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRefreshToken } from '@/lib/google/calendar';

export async function GET(request: NextRequest) {
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

    // Get user's Google connection status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('google_calendar_connected, google_refresh_token')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { connected: false, valid: false }
      );
    }

    // Check if token is still valid
    let isValid = false;
    if (userData.google_refresh_token) {
      isValid = await validateRefreshToken(userData.google_refresh_token);
    }

    return NextResponse.json({
      connected: userData.google_calendar_connected || false,
      valid: isValid
    });
  } catch (error) {
    console.error('Error checking Google status:', error);
    return NextResponse.json(
      { connected: false, valid: false },
      { status: 200 } // Return 200 even on error to not break UI
    );
  }
}