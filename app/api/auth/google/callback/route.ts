import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTokensFromCode, getUserInfo } from '@/lib/google/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle errors from Google OAuth
  if (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=google_auth_failed', request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL('/dashboard?error=no_auth_code', request.url)
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    if (!tokens.refresh_token) {
      console.error('No refresh token received');
      return NextResponse.redirect(
        new URL('/dashboard?error=no_refresh_token', request.url)
      );
    }

    // Get user info from Google
    const googleUser = await getUserInfo(tokens.access_token!);

    // Get current user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.redirect(
        new URL('/login?error=not_authenticated', request.url)
      );
    }

    // Update user record with Google tokens
    const { error: updateError } = await supabase
      .from('users')
      .update({
        google_refresh_token: tokens.refresh_token,
        google_access_token: tokens.access_token,
        google_token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
        google_calendar_connected: true
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.redirect(
        new URL('/dashboard?error=update_failed', request.url)
      );
    }

    // Redirect back to dashboard with success
    return NextResponse.redirect(
      new URL('/dashboard?google_connected=true', request.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=oauth_callback_failed', request.url)
    );
  }
}